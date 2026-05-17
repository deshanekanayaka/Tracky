# Tracky

A Chrome extension that automatically logs job applications to your own Google Sheet. No copy-pasting, no proprietary platforms — your data stays in your file.

## How it works

1. Navigate to a job listing on LinkedIn, Indeed, Glassdoor, Lever, or Greenhouse
2. Click the Apply button
3. A confirmation pill appears — tap **Log it**
4. The job is appended as a row to your Google Sheet instantly

If you miss the pill, open the Tracky popup and tap **Log manually**. Works on unsupported sites too — captures the page title and URL as a fallback.

## Features

- Auto-detects Apply button clicks on major job boards
- Confirmation pill with 30-second window — nothing logged without your intent
- Your data lives in your own Google Sheet — no Tracky servers, no database
- Offline queue — logs are saved locally and synced when reconnected
- Duplicate detection — never logs the same job URL twice
- Error tracking via Sentry — production bugs reported automatically

## Tech stack

- Chrome Extension Manifest V3
- React 19 + TypeScript
- Vite 8
- Zustand (state management)
- Google Sheets API v4
- Sentry (error tracking)

## Local setup

### Prerequisites

- Node.js v18 or higher
- A Google account
- Chrome browser

### Install

```bash
git clone https://github.com/deshanekanayaka/Tracky.git
cd Tracky
npm install
```

### Environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

| Variable | Where to get it |
|---|---|
| `VITE_SENTRY_DSN` | sentry.io → your project → Settings → Client Keys |

Sentry is optional for local development. Leave the value empty and it will be skipped.

### Build

```bash
npm run build
```

### Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `dist/` folder inside the project

The Tracky icon appears in your toolbar. Click it to open the popup.

## Google OAuth setup

Required for the extension to write to your Google Sheet.

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project named **Tracky**
3. **APIs & Services → Library** → search **Google Sheets API** → Enable
4. **APIs & Services → OAuth consent screen**
    - User type: External
    - Add your Gmail as a test user
5. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
    - Application type: **Chrome Extension**
    - Extension ID: copy from `chrome://extensions` (32-character string under Tracky)
6. Copy the Client ID and paste it into `public/manifest.json`:

```json
"oauth2": {
  "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
  "scopes": ["https://www.googleapis.com/auth/spreadsheets"]
}
```

7. Rebuild: `npm run build`
8. Reload the extension at `chrome://extensions`

## Supported job boards

| Site | Auto-detect Apply | Full scrape |
|---|---|---|
| LinkedIn | ✅ | ✅ |
| Indeed | ✅ | ✅ |
| Glassdoor | ✅ | ✅ |
| Lever | ✅ | ✅ |
| Greenhouse | ✅ | ✅ |
| Other sites | ❌ | Fallback (title + URL only) |


## Privacy

Tracky has no backend server. All data is stored locally in your browser via `chrome.storage` or written directly to your own Google Sheet. No personal data is collected, stored, or transmitted to any third party.

OAuth authentication is handled entirely by Chrome's built-in identity API. Tracky never sees or stores your Google password.

[Full privacy policy →]
(https://github.com/deshanekanayaka/Tracky/blob/main/PRIVACY.md)

## License

MIT — see [LICENSE](LICENSE)