import "dotenv/config";

const required = [
  "OPENAI_API_KEY",
  "JIRA_BASE_URL",
  "JIRA_EMAIL",
  "JIRA_API_TOKEN",
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_CHAT_ID",
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(
    `Missing required environment variables: ${missing.join(", ")}`
  );
}

export const config = Object.freeze({
  openaiApiKey: process.env.OPENAI_API_KEY,
  jira: Object.freeze({
    baseUrl: process.env.JIRA_BASE_URL,
    email: process.env.JIRA_EMAIL,
    apiToken: process.env.JIRA_API_TOKEN,
  }),
  telegram: Object.freeze({
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
  }),
  github: Object.freeze({
    token: process.env.GITHUB_TOKEN,
    username: process.env.GITHUB_USERNAME,
    repo: process.env.GITHUB_REPO,
  }),
});
