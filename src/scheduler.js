// src/scheduler.js
import "./config.js";
import cron from "node-cron";
import { runDailyReport } from "./workflow/dailyReport.js";

console.log("⏰ Scheduler started...");

const runScheduledReport = async (label) => {
  console.log(`🚀 Daily report (${label})...`);

  await runDailyReport();

  console.log(`✅ Daily report completed (${label})`);
};

// Every day at 11:30 (local server time)
cron.schedule("00 11 * * *", () => runScheduledReport("11:00"));

cron.schedule("30 14 * * *", () => runScheduledReport("14:30"));

// Every day at 17:20 / 5:20 PM (local server time)
cron.schedule("20 17 * * *", () => runScheduledReport("17:20"));
