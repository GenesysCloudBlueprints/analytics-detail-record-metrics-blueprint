
:::{\"alert\":\"primary\",\"title\":\"About Genesys Cloud Blueprints\",\"autoCollapse\":false} Genesys Cloud blueprints are intended to help you jump-start an integration or application. They show one practical implementation path and are not production-ready, turn-key solutions.

For more details on Genesys Cloud blueprint support and practices, see the Genesys Cloud blueprint FAQ. :::

This blueprint provides an Analytics Detailed Record Metric app that uses the Genesys Cloud Platform API to retrieve historical analytics and agent presence information. The current implementation is a lightweight TypeScript single-page app built with Vite. It authenticates users with PKCE, loads summary interaction metrics for the last 30 days, and lets supervisors drill into agent presence details from a drop-down list.

The dashboard is useful both as a working sample and as a starting point for more specialized reporting experiences. You can extend the same query patterns to surface additional metrics, add filters, or tailor the layout for a specific operational workflow.

![Flowchart](images/flowchart.png "Flowchart")

## What the app does

When a user opens the app, it performs the following sequence:

1. Authenticates the user against Genesys Cloud with `loginPKCEGrant`.
2. Loads the signed-in user's name for the dashboard header.
3. Queries conversation analytics to display:
   - chat interactions
   - total voice calls
   - abandoned voice calls
   - answered voice calls
   - inbound voice interactions
   - outbound voice interactions
4. Loads a list of users into the **Select Agent** drop-down.
5. Retrieves presence detail rows for the selected agent over the same date interval.

## Solution components

* **Analytics Detailed Record Metric app** - A browser-based dashboard that displays conversation and agent presence data from Genesys Cloud analytics endpoints.
* **Vite development and build tooling** - Provides a modern local development server on port `3000` and production bundling for the front-end application.
* **Genesys Cloud Platform API SDK for JavaScript** - Handles authentication and API requests to the Genesys Cloud Platform API.

## Prerequisites

Before you begin, make sure you have the following:

* A Genesys Cloud organization and an account with permissions to create OAuth clients and install integrations.
* Working knowledge of Genesys Cloud administration and Platform API concepts.
* Node.js `18` or later.

### Genesys Cloud access

* A valid Genesys Cloud license. For more information, see [Genesys Cloud pricing](https://www.genesys.com/pricing "Opens the Genesys Cloud pricing page").
* A role with sufficient administrative permissions. The Master Admin role is recommended. For more information, see [Roles and permissions overview](https://help.genesys.cloud/articles/about-roles-permissions/ "Opens the Roles and permissions overview article").

## Implementation steps

* [Clone the GitHub repository](#clone-the-github-repository "Goes to the Clone the GitHub repository section")
* [Create an OAuth client in Genesys Cloud](#create-an-oauth-client-in-genesys-cloud "Goes to the Create an OAuth client in Genesys Cloud section")
* [Configure the application](#configure-the-application "Goes to the Configure the application section")
* [Run the app locally with Vite](#run-the-app-locally-with-vite "Goes to the Run the app locally with Vite section")
* [Install and activate the app in your Genesys Cloud organization](#install-and-activate-the-app-in-your-genesys-cloud-organization "Goes to the Install and activate the app in your Genesys Cloud organization section")
* [Validate the solution](#validate-the-solution "Goes to the Validate the solution section")

### Clone the GitHub repository

Clone the [analytics-detail-record-metrics-blueprint](https://github.com/GenesysCloudBlueprints/analytics-detail-record-metrics-blueprint "analytics-detail-record-metrics-blueprint repository in GitHub") repository to your local machine.

### Create an OAuth client in Genesys Cloud

1. Sign in to your Genesys Cloud organization.
2. Create an OAuth client for browser-based authentication and configure it for PKCE-based sign-in.
3. Add your local redirect URI to the client's authorized redirect URIs. For local development, use `http://localhost:3000/`.
4. Record the client ID that Genesys Cloud generates for the OAuth client.
5. Note the region of your organization, such as `mypurecloud.com` or `mypurecloud.au`.

![Client Details Authorize Redirect URI](images/client-details-authorize-redirect-uri.png "Client Details Authorize Redirect URI")

### Configure the application

Update `src/scripts/config.ts` with values for your organization:

* `clientID` - The OAuth client ID you created in Genesys Cloud.
* `redirectUri` - The redirect URI registered on the OAuth client, such as `http://localhost:3000/`.
* `genesysCloud.region` - The Genesys Cloud region for your organization.

The application reads these values at startup before it initializes the Genesys Cloud SDK.

### Run the app locally with Vite

1. Open a terminal and change to the `src` directory.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000/` in your browser.

For a production-style build, run:

```bash
npm run build
```

To preview the built output locally, run:

```bash
npm run preview
```

### Install and activate the app in your Genesys Cloud organization

1. In Genesys Cloud, go to **Admin** > **Integrations**.
2. Search for **Client Application** and click **Install**.
3. Open the **Details** tab, rename the integration if needed, and set it to **Active**.
4. Open the **Configuration** tab.
5. Set **Application URL** to your hosted app URL. For local development, use `http://localhost:3000/`.
6. Under **Group Filtering**, select the groups that should have access to the app.
7. Save the integration.

If you want to preserve the embedded-app URL pattern used by older revisions of this blueprint, you can append query parameters such as `?conversationid={{gcConversationId}}&language={{gcLangTag}}`. The current TypeScript implementation does not require those parameters.

![Install Client Application](images/client-app-install.png "Install Client Application")

### Validate the solution

1. Launch the app from the Genesys Cloud **Apps** menu.
2. Sign in when prompted.
3. Confirm that the dashboard loads the signed-in user name and a date range for the last 30 days.
4. Verify that the summary cards show analytics values for chat, calls, abandoned calls, answered calls, inbound voice, and outbound voice.
5. Select an agent from **Select Agent** and verify that presence records populate in the details table.

## Project structure

The current implementation is centered around a small front-end codebase in `src`:

* `src/index.html` - Dashboard markup and the module entry point.
* `src/scripts/main.ts` - Authentication, analytics queries, and application initialization.
* `src/scripts/view.ts` - DOM update helpers for metrics, user data, and presence rows.
* `src/scripts/config.ts` - Local configuration for the OAuth client and Genesys Cloud region.
* `src/vite.config.ts` - Vite development server settings and SDK path aliasing.
* `src/tsconfig.json` - TypeScript compiler configuration.

## Additional resources

* [Genesys Cloud Developer Center](https://developer.genesys.cloud/ "Goes to the main page of the Genesys Cloud Developer Center")
* [Analytics Overview](https://developer.genesys.cloud/api/rest/v2/analytics/overview "Goes to the Analytics Overview page")
* [Genesys Cloud Platform API SDK for JavaScript](https://github.com/MyPureCloud/platform-client-sdk-javascript "Goes to the JavaScript SDK repository")
* [Vite Documentation](https://vite.dev/ "Goes to the Vite documentation")
* [TypeScript Documentation](https://www.typescriptlang.org/docs/ "Goes to the TypeScript documentation")
* [Analytics GitHub Repository](https://github.com/GenesysCloudBlueprints/analytics-detail-record-metrics-blueprint "Goes to the analytics-detail-record-metrics-blueprint repository in GitHub")
