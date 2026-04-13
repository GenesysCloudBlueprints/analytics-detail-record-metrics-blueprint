export interface PresenceRecord {
  startTime?: string;
  endTime?: string;
  systemPresence?: string;
  organizationPresenceId?: string;
}

export interface UserSearchResult {
  results: Array<{ id?: string; name?: string }>;
}

function getElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element #${id} not found`);
  return el as T;
}

function setText(id: string, value: string | number): void {
  getElement(id).textContent = String(value);
}

function formatTimestamp(iso: string): string {
  return iso.replace('T', ' ').replace('Z', '').slice(0, 19);
}

export function displayUserData(name: string): void {
  setText('userName', name);
}

export function displayDateRange(from: string, to: string): void {
  setText('date', `Data from ${from} to ${to}`);
}

export function displayChatInteractions(count: number): void {
  setText('chatInteractionsNumber', count);
}

export function displayCallCount(count: number): void {
  setText('numberofCalls', count);
}

export function displayAbandonedCalls(count: number): void {
  setText('numberofAbandonedCalls', count);
}

export function displayAnsweredCalls(count: number): void {
  setText('numberofAnsweredCalls', count);
}

export function displayVoiceOutbound(count: number): void {
  setText('numberofOutbound', count);
}

export function displayVoiceInbound(count: number): void {
  setText('numberofInbound', count);
}

export function populateAgentDropdown(data: UserSearchResult): void {
  const select = getElement<HTMLSelectElement>('agentsList');
  for (const user of data.results) {
    if (!user.id || !user.name) continue;
    const option = document.createElement('option');
    option.value = user.id;
    option.textContent = user.name;
    select.appendChild(option);
  }
}

export function appendPresenceRow(record: PresenceRecord): void {
  const table = getElement('userTable');
  const row = document.createElement('tr');

  const fields = [
    record.startTime ? formatTimestamp(record.startTime) : '',
    record.endTime ? formatTimestamp(record.endTime) : '',
    record.systemPresence ?? '',
  ];

  for (const value of fields) {
    const cell = document.createElement('td');
    cell.textContent = value;
    row.appendChild(cell);
  }

  table.appendChild(row);
}
