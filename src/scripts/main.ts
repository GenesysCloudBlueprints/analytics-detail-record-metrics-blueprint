import configuration from './config.ts';
import platformClient from 'purecloud-platform-client-v2';
import {
  displayUserData,
  displayDateRange,
  displayChatInteractions,
  displayCallCount,
  displayAbandonedCalls,
  displayAnsweredCalls,
  displayVoiceOutbound,
  displayVoiceInbound,
  populateAgentDropdown,
  appendPresenceRow,
} from './view.ts';

// --- SDK setup ---

const client = platformClient.ApiClient.instance;
const analyticsApi = new platformClient.AnalyticsApi();
const usersApi = new platformClient.UsersApi();

client.setEnvironment(configuration.genesysCloud.region);

// --- Popup auth context guard ---

// When this script is reloaded inside the popup after Genesys redirects it back
// to the redirectUri with ?code=.../?error=..., post the "gc_auth_popup"
// handshake message to the opener so the opener can finish PKCE, and do NOT init
// the dashboard.
const inAuthPopup =
  typeof window !== 'undefined' &&
  !!window.opener &&
  window.opener !== window &&
  /[?&](code|error)=/.test(window.location.search);

// --- Types ---

interface SegmentPredicate {
  type: string;
  dimension: string;
  operator: string;
  value: string;
}

interface ConversationFilter {
  type: string;
  predicates: Array<{
    type: string;
    metric: string;
    range: { gte: number };
  }>;
}

interface ConversationQueryOptions {
  interval: string;
  segmentPredicates: SegmentPredicate[];
  conversationFilters?: ConversationFilter[];
  pageSize?: number;
}

// --- Helpers ---

function buildDateInterval(daysBack: number = 30): string {
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - daysBack);
  return `${from.toISOString()}/${now.toISOString()}`;
}

function formatIntervalForDisplay(interval: string): { from: string; to: string } {
  const [start, end] = interval.split('/');
  return {
    from: start.slice(0, 10),
    to: end.slice(0, 10),
  };
}

async function queryConversations(options: ConversationQueryOptions): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: any = {
    interval: options.interval,
    order: 'asc',
    orderBy: 'conversationStart',
    paging: {
      pageSize: options.pageSize ?? 25,
      pageNumber: 1,
    },
    segmentFilters: [
      {
        type: 'and',
        predicates: options.segmentPredicates,
      },
    ],
  };

  if (options.conversationFilters) {
    body.conversationFilters = options.conversationFilters;
  }

  const data = await analyticsApi.postAnalyticsConversationsDetailsQuery(body);
  return data.totalHits ?? 0;
}

// --- Data fetching ---

async function fetchCurrentUser(): Promise<void> {
  const data = await usersApi.getUsersMe({});
  displayUserData(data.name ?? 'Unknown');
}

async function fetchAllMetrics(interval: string): Promise<void> {
  const mediaFilter = (media: string): SegmentPredicate => ({
    type: 'dimension',
    dimension: 'mediaType',
    operator: 'matches',
    value: media,
  });

  const directionFilter = (dir: string): SegmentPredicate => ({
    type: 'dimension',
    dimension: 'direction',
    operator: 'matches',
    value: dir,
  });

  const metricFilter = (metric: string): ConversationFilter => ({
    type: 'and',
    predicates: [{ type: 'metric', metric, range: { gte: 1 } }],
  });

  const queries = [
    queryConversations({
      interval,
      segmentPredicates: [mediaFilter('voice')],
    }).then(displayCallCount),

    queryConversations({
      interval,
      segmentPredicates: [mediaFilter('chat')],
      pageSize: 100,
    }).then(displayChatInteractions),

    queryConversations({
      interval,
      segmentPredicates: [mediaFilter('voice')],
      conversationFilters: [{ ...metricFilter('tAbandon'), type: 'or' }],
    }).then(displayAbandonedCalls),

    queryConversations({
      interval,
      segmentPredicates: [mediaFilter('voice')],
      conversationFilters: [metricFilter('tAnswered')],
    }).then(displayAnsweredCalls),

    queryConversations({
      interval,
      segmentPredicates: [directionFilter('outbound'), mediaFilter('voice')],
      pageSize: 100,
    }).then(displayVoiceOutbound),

    queryConversations({
      interval,
      segmentPredicates: [directionFilter('inbound'), mediaFilter('voice')],
      pageSize: 100,
    }).then(displayVoiceInbound),
  ];

  const results = await Promise.allSettled(queries);
  for (const result of results) {
    if (result.status === 'rejected') {
      console.error('Metric query failed:', result.reason);
    }
  }
}

async function fetchUsers(): Promise<void> {
  const data = await usersApi.postUsersSearch({
    sortOrder: 'ASC',
    pageSize: 100,
  });
  populateAgentDropdown(data);
}

async function fetchAgentPresence(userId: string, interval: string): Promise<void> {
  const body = {
    interval,
    order: 'asc',
    paging: { pageSize: 25, pageNumber: 1 },
    userFilters: [
      {
        type: 'or',
        predicates: [
          { type: 'dimension', dimension: 'userId', operator: 'matches', value: userId },
        ],
      },
    ],
  };

  const data = await analyticsApi.postAnalyticsUsersDetailsQuery(body);
  const presenceList = data.userDetails?.[0]?.primaryPresence;
  if (!presenceList) return;

  for (const record of presenceList) {
    appendPresenceRow(record);
  }
}

// --- Init ---

async function runDashboard(interval: string): Promise<void> {
  const { from, to } = formatIntervalForDisplay(interval);
  displayDateRange(from, to);

  await Promise.allSettled([
    fetchCurrentUser(),
    fetchAllMetrics(interval),
    fetchUsers(),
  ]);
}

function setupSignIn(): void {
  const interval = buildDateInterval(30);

  const agentsList = document.getElementById('agentsList') as HTMLSelectElement;
  agentsList.addEventListener('change', () => {
    const table = document.getElementById('userTable') as HTMLTableElement;
    table.querySelectorAll('tr:not(:first-child)').forEach((row) => row.remove());
    fetchAgentPresence(agentsList.value, interval).catch((err) =>
      console.error('Failed to fetch agent presence:', err),
    );
  });

  const signInButton = document.getElementById('signInButton') as HTMLButtonElement;
  signInButton.addEventListener('click', async () => {
    signInButton.disabled = true;
    try {
      await client.loginPKCEGrant(configuration.clientID, configuration.redirectUri, {
        authPopupConfiguration: { usePopup: true, autoClosePopup: true, popupTimeout: 30000 },
      });
    } catch (error) {
      console.error('Authentication failed:', error);
      signInButton.disabled = false; // allow retry
      return;
    }
    signInButton.style.display = 'none'; // hide after success
    await runDashboard(interval);
  });
}

if (inAuthPopup) {
  // Running inside the popup after Genesys redirected back to redirectUri with
  // ?code=... The SDK has no popup-side logic: the PKCE exchange runs entirely
  // in the opener, which is waiting for a postMessage handshake. Hand the auth
  // result back to the opener so its loginPKCEGrant promise resolves; do NOT run
  // loginPKCEGrant/authorizePKCEGrant, the dashboard, or any fetch here.
  const opener: Window | null = window.opener;
  if (opener) {
    // Shape must match ApiClient._handleAuthPopupMessage: name "gc_auth_popup",
    // type "message", with search/hash carrying the ?code=... back. Target the
    // opener's exact origin (never '*') — it also matches the origin check the
    // opener runs via redirectUri.startsWith(event.origin).
    const openerOrigin = new URL(configuration.redirectUri).origin;
    opener.postMessage(
      {
        name: 'gc_auth_popup',
        type: 'message',
        search: window.location.search,
        hash: window.location.hash,
      },
      openerOrigin,
    );
    // The opener is configured with autoClosePopup: true and will close this
    // window after processing the message; close as a fallback.
    window.close();
  } else {
    // No opener to hand the result to — nothing we can safely do. Do NOT fall
    // through to the dashboard init.
    console.error('Popup auth completion failed: no window.opener to notify.');
  }
} else {
  // Main-window path: wire the dashboard and gate auth on the Sign In button.
  setupSignIn();
}
