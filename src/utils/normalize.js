// normalize.js
const normStatus = (s) => (s || "").toUpperCase().replace(/\s+/g, " ").trim();

export const normalizeData = (tasks, options = {}) => {
  const { commits, movedToReviewToday = [] } = options;

  const priorityRank = (priority) => {
    switch ((priority || "").toLowerCase()) {
      case "blocker":
      case "critical":
        return 6;
      case "highest":
        return 5;
      case "high":
        return 4;
      case "medium":
        return 3;
      case "low":
        return 2;
      case "lowest":
        return 1;
      default:
        return 0;
    }
  };

  const sortByPriority = (a, b) =>
    priorityRank(b.priority) - priorityRank(a.priority);

  const result = {
    total_assigned: tasks.length,
    completed: [],
    in_progress: [],
    pending: [],
    blocked: [],
    blockers: [],
    moved_to_review_today: [...movedToReviewToday].sort(sortByPriority),
    next_work: [],
    top_priorities: [],
    commits,
  };

  tasks.forEach((task) => {
    const st = normStatus(task.status);

    if (st === "COMPLETED") result.completed.push(task);
    else if (st === "DEVELOPMENT") result.in_progress.push(task);
    else if (st === "READY FOR DEVELOPMENT") result.pending.push(task);
    else if (st === "BLOCKED") result.blocked.push(task);
    else result.pending.push(task);

    const days =
      (Date.now() - new Date(task.updated)) / (1000 * 60 * 60 * 24);
    if (days > 3 && st !== "COMPLETED") {
      result.blockers.push(task);
    }
  });

  result.in_progress.sort(sortByPriority);
  result.blocked.sort(sortByPriority);
  result.pending.sort(sortByPriority);

  result.next_work = tasks
    .filter((t) => normStatus(t.status) === "READY FOR DEVELOPMENT")
    .sort(sortByPriority);

  result.top_priorities = [
    ...result.in_progress,
    ...result.blocked,
    ...result.pending.filter(
      (t) => normStatus(t.status) === "READY FOR DEVELOPMENT"
    ),
  ]
    .sort(sortByPriority)
    .slice(0, 5);

  return result;
};
