// dailyReport.js
import {
  fetchJiraTasks,
  fetchMovedToReviewToday,
} from "../services/jira.service.js";
// import { fetchCommits } from "../services/git.service.js";
import { normalizeData } from "../utils/normalize.js";
import { generateReport } from "../services/ai.service.js";
import { sendTelegram } from "../services/notify.service.js";

export const runDailyReport = async () => {
  try {
    const [tasks, movedToReviewToday] = await Promise.all([
      fetchJiraTasks(),
      fetchMovedToReviewToday(),
    ]);
    // const commits = await fetchCommits();

    const normalized = normalizeData(tasks, {
      movedToReviewToday,
      // commits,
    });

    const report = await generateReport(normalized);

    await sendTelegram(report);

    console.log("✅ Report sent successfully");
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
};