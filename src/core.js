(function attachDevBoardCore(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.DevBoardCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createCore() {
  const STATUSES = ["todo", "progress", "done"];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeWorkspace(workspace) {
    const next = clone(workspace || {});
    next.projects = Array.isArray(next.projects) ? next.projects : [];
    next.tasks = Array.isArray(next.tasks) ? next.tasks : [];
    next.milestones = Array.isArray(next.milestones) ? next.milestones : [];
    next.activity = Array.isArray(next.activity) ? next.activity : [];
    next.tasks = next.tasks.map((task) => ({
      priority: "medium",
      status: "todo",
      ...task,
      status: STATUSES.includes(task.status) ? task.status : "todo"
    }));
    return next;
  }

  function deriveStats(workspace) {
    const data = normalizeWorkspace(workspace);
    const completed = data.tasks.filter((task) => task.status === "done").length;
    const inProgress = data.tasks.filter((task) => task.status === "progress").length;
    const remaining = data.tasks.length - completed;
    const focusScore = data.tasks.length ? Math.round((completed / data.tasks.length) * 100) : 0;

    return {
      activeProjects: data.projects.filter((project) => project.status === "active").length,
      completed,
      focusScore,
      inProgress,
      openMilestones: data.milestones.filter((milestone) => milestone.progress < 100).length,
      remaining,
      totalTasks: data.tasks.length
    };
  }

  function filterWorkspace(workspace, query, projectFilter) {
    const data = normalizeWorkspace(workspace);
    const needle = String(query || "").trim().toLowerCase();
    const matches = (value) => String(value || "").toLowerCase().includes(needle);
    const visibleProjects = data.projects.filter((project) => {
      const statusMatches = !projectFilter || projectFilter === "all" || project.status === projectFilter;
      return statusMatches && (!needle || matches(project.name) || matches(project.description) || matches(project.language));
    });
    const projectNames = new Map(data.projects.map((project) => [project.id, project.name]));
    const visibleTasks = data.tasks.filter((task) => !needle || matches(task.title) || matches(projectNames.get(task.projectId)) || matches(task.priority));
    return { projects: visibleProjects, tasks: visibleTasks };
  }

  function moveTask(workspace, taskId, direction) {
    const data = normalizeWorkspace(workspace);
    const task = data.tasks.find((item) => item.id === taskId);
    if (!task) return data;
    const currentIndex = STATUSES.indexOf(task.status);
    const nextIndex = Math.max(0, Math.min(STATUSES.length - 1, currentIndex + direction));
    task.status = STATUSES[nextIndex];
    return data;
  }

  function clearCompleted(workspace) {
    const data = normalizeWorkspace(workspace);
    data.tasks = data.tasks.filter((task) => task.status !== "done");
    return data;
  }

  return { STATUSES, clearCompleted, deriveStats, filterWorkspace, moveTask, normalizeWorkspace };
});
