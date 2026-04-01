# AI Daily Report

Automated daily status reporting for Jira tasks, delivered to Telegram.

This project fetches your assigned Jira issues, classifies and prioritizes them, generates a concise daily summary, and sends the result to a Telegram chat on a schedule.

## Features

- Pulls assigned Jira issues with priority, status, update time, and due date
- Tracks issues moved to `REVIEW` today
- Normalizes and groups tasks (`DEVELOPMENT`, `READY FOR DEVELOPMENT`, `BLOCKED`, stale work)
- Builds a structured HTML report for Telegram
- Optionally adds a short AI-generated "at a glance" summary
- Runs automatically via cron schedule

## Tech Stack

- Node.js (ES modules)
- `node-cron` for scheduling
- `axios` for Jira and Telegram API calls
- `openai` for short summary generation
- `dotenv` for environment configuration

## Project Structure

```text
src/
  config.js                  # Env loading + validation
  scheduler.js               # Cron schedule entrypoint
  workflow/dailyReport.js    # End-to-end report workflow
  services/
    jira.service.js          # Jira queries
    ai.service.js            # Report formatting + short AI summary
    notify.service.js        # Telegram delivery
  utils/
    normalize.js             # Task classification and prioritization
example.env                  # Environment variable template
```

## Prerequisites

- Node.js 18+ (recommended)
- `pnpm` (project uses `pnpm-lock.yaml`)
- Jira Cloud account + API token
- OpenAI API key
- Telegram bot token and target chat ID

## Setup

1. Install dependencies:
  ```bash
   pnpm install
  ```
2. Create a local env file:
  ```bash
   cp example.env .env
  ```
3. Fill all required values in `.env`.

## Environment Variables

Required by `src/config.js`:

- `OPENAI_API_KEY`
- `JIRA_BASE_URL` (example: `https://your-org.atlassian.net`)
- `JIRA_EMAIL`
- `JIRA_API_TOKEN`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

Optional (present in config but not currently used in workflow):

- `GITHUB_TOKEN`
- `GITHUB_USERNAME`
- `GITHUB_REPO`

## Usage

Start the scheduler:

```bash
node src/scheduler.js
```

The scheduler triggers report generation automatically at configured times.

## Cron Schedule

Configured in `src/scheduler.js` (server local time):

- `00 11 * * *` (11:00)
- `30 14 * * *` (14:30)
- `20 17 * * *` (17:20)

## How It Works

1. Fetch assigned Jira issues
2. Fetch issues moved to `REVIEW` today
3. Normalize and rank tasks by priority/status
4. Build Telegram HTML report body
5. Generate short AI summary (best effort; fallback to static body if AI call fails)
6. Send message to Telegram

## Security Notes

- Never commit real secrets in `.env`
- Keep API tokens scoped and rotated regularly
- Use a dedicated Telegram bot for this automation

## Troubleshooting

- **Missing env vars:** startup throws `Missing required environment variables`
- **Jira auth errors (401/403):** verify Jira email/token and base URL
- **No Telegram messages:** check bot token, chat ID, and bot permissions
- **OpenAI summary skipped:** workflow continues and still sends the base report

## License

ISC