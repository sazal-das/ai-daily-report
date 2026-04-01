// ai.service.js
import OpenAI from "openai";
import { config } from "../config.js";

const client = new OpenAI({
  apiKey: config.openaiApiKey,
});

/** Telegram HTML: escape dynamic text inside tags. */
const escapeHtml = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const fmtTicket = (t) =>
  `${escapeHtml(t.id)} (${escapeHtml(t.priority)}) — ${escapeHtml(t.title)}`;

const bulletList = (items, fmt, emptyLabel = "None") =>
  items.length === 0
    ? `— ${emptyLabel}`
    : items.map((t) => `• ${fmt(t)}`).join("\n");

/**
 * Human-readable report body — no LLM, same structure every day.
 */
export const formatReportHtml = (data) => {
  const sections = [
    `<b>Daily report</b>`,
    "",
    `<b>Assigned to me</b>: ${data.total_assigned}`,
    "",
    `<b>In development</b> (${data.in_progress.length}):`,
    bulletList(data.in_progress, fmtTicket),
    "",
    `<b>Moved to REVIEW today</b> (${data.moved_to_review_today.length}):`,
    bulletList(data.moved_to_review_today, fmtTicket),
    "",
    `<b>Next to work</b> (Ready for development, highest priority first) (${data.next_work.length}):`,
    bulletList(
      data.next_work,
      fmtTicket,
      "None (nothing in Ready for development)"
    ),
    "",
    `<b>Blocked</b> (${data.blocked.length}):`,
    bulletList(data.blocked, fmtTicket),
    "",
    `<b>Stale</b> (not updated in 3+ days, not completed) (${data.blockers.length}):`,
    bulletList(data.blockers, fmtTicket),
  ];

  return sections.join("\n");
};

/**
 * Optional 1–2 sentence focus line; must not add tickets not in the body.
 */
const generateBriefSummary = async (plainFacts) => {
  const res = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.35,
    max_completion_tokens: 120,
    messages: [
      {
        role: "system",
        content:
          "You write one or two very short sentences (max 40 words total) for a developer daily standup. Use ONLY the snapshot provided. Do not invent issues, numbers, or priorities. No markdown, no bullets, no ticket keys unless already emphasized in the input. Plain English.",
      },
      {
        role: "user",
        content: plainFacts,
      },
    ],
  });

  return res.choices[0]?.message?.content?.trim() ?? "";
};

export const generateReport = async (data) => {
  const bodyHtml = formatReportHtml(data);

  const plainFacts = [
    `Assigned: ${data.total_assigned}`,
    `In development: ${data.in_progress.length} — ${data.in_progress.map((t) => `${t.id} ${t.priority}`).join("; ") || "none"}`,
    `Moved to REVIEW today: ${data.moved_to_review_today.length}`,
    `Next (ready for dev): ${data.next_work.length} — ${data.next_work.map((t) => `${t.id} ${t.priority}`).join("; ") || "none"}`,
    `Blocked: ${data.blocked.length}`,
    `Stale: ${data.blockers.length}`,
  ].join("\n");

  try {
    const summary = await generateBriefSummary(plainFacts);
    if (summary) {
      return (
        `<b>At a glance</b>\n${escapeHtml(summary)}\n\n` + bodyHtml
      );
    }
  } catch (err) {
    console.warn("[ai] Brief summary skipped:", err.message);
  }

  return bodyHtml;
};
