import axios from "axios";
import { config } from "../config.js";

const mapIssue = (issue) => ({
  id: issue.key,
  title: issue.fields.summary,
  status: issue.fields.status.name,
  priority: issue.fields.priority?.name ?? "Unknown",
  updated: issue.fields.updated,
  due: issue.fields.duedate,
});

export const fetchJiraTasks = async () => {
  const res = await axios.get(
    `${config.jira.baseUrl}/rest/api/3/search/jql`,
    {
      params: {
        jql: "assignee = currentUser() ORDER BY priority DESC, updated DESC",
        fields: "summary,status,priority,updated,duedate",
      },
      auth: {
        username: config.jira.email,
        password: config.jira.apiToken,
      },
    }
  );

  return res.data.issues.map(mapIssue);
};

/**
 * Issues you (assign + transition actor) moved into REVIEW since the start of today (server timezone).
 * Status name must match your Jira workflow (screenshots: REVIEW).
 */
export const fetchMovedToReviewToday = async () => {
  const jql =
    'assignee = currentUser() AND status CHANGED TO "REVIEW" AFTER startOfDay() BY currentUser()';
  try {
    const res = await axios.get(
      `${config.jira.baseUrl}/rest/api/3/search/jql`,
      {
        params: {
          jql,
          fields: "summary,status,priority,updated,duedate",
        },
        auth: {
          username: config.jira.email,
          password: config.jira.apiToken,
        },
      }
    );
    return res.data.issues.map(mapIssue);
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.errorMessages?.join("; ") ?? err.message;
    console.warn(
      `[jira] fetchMovedToReviewToday failed (${status ?? "no-status"}): ${msg}. Trying without BY currentUser().`
    );
    const fallbackJql =
      'assignee = currentUser() AND status CHANGED TO "REVIEW" AFTER startOfDay()';
    const res = await axios.get(`${config.jira.baseUrl}/rest/api/3/search/jql`, {
      params: {
        jql: fallbackJql,
        fields: "summary,status,priority,updated,duedate",
      },
      auth: {
        username: config.jira.email,
        password: config.jira.apiToken,
      },
    });
    return res.data.issues.map(mapIssue);
  }
};
