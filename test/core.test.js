const test = require("node:test");
const assert = require("node:assert/strict");
const { clearCompleted, deriveStats, filterWorkspace, moveTask, normalizeWorkspace } = require("../src/core.js");

const workspace = {
  projects: [
    { id: "p1", name: "Pulse API", description: "Health service", language: "TypeScript", status: "active" },
    { id: "p2", name: "Northstar", description: "Finance app", language: "Python", status: "paused" }
  ],
  tasks: [
    { id: "t1", title: "Write API docs", projectId: "p1", status: "todo", priority: "high" },
    { id: "t2", title: "Ship reports", projectId: "p2", status: "progress", priority: "medium" },
    { id: "t3", title: "Publish release", projectId: "p1", status: "done", priority: "low" }
  ],
  milestones: [
    { id: "m1", progress: 80 },
    { id: "m2", progress: 100 }
  ],
  activity: []
};

test("deriveStats returns consistent workspace totals", () => {
  assert.deepEqual(deriveStats(workspace), {
    activeProjects: 1,
    completed: 1,
    focusScore: 33,
    inProgress: 1,
    openMilestones: 1,
    remaining: 2,
    totalTasks: 3
  });
});

test("filterWorkspace searches project and task context", () => {
  const byLanguage = filterWorkspace(workspace, "python", "all");
  assert.equal(byLanguage.projects.length, 1);
  assert.equal(byLanguage.projects[0].id, "p2");

  const byProjectName = filterWorkspace(workspace, "pulse", "all");
  assert.deepEqual(byProjectName.tasks.map((task) => task.id), ["t1", "t3"]);

  const activeOnly = filterWorkspace(workspace, "", "active");
  assert.deepEqual(activeOnly.projects.map((project) => project.id), ["p1"]);
});

test("moveTask respects the first and last columns", () => {
  assert.equal(moveTask(workspace, "t1", -1).tasks[0].status, "todo");
  assert.equal(moveTask(workspace, "t1", 1).tasks[0].status, "progress");
  assert.equal(moveTask(workspace, "t3", 1).tasks[2].status, "done");
});

test("clearCompleted returns a new workspace without done tasks", () => {
  const result = clearCompleted(workspace);
  assert.equal(result.tasks.length, 2);
  assert.equal(workspace.tasks.length, 3);
});

test("normalizeWorkspace supplies arrays and repairs unknown statuses", () => {
  const result = normalizeWorkspace({ tasks: [{ id: "t1", status: "blocked" }] });
  assert.deepEqual(result.projects, []);
  assert.deepEqual(result.milestones, []);
  assert.equal(result.tasks[0].status, "todo");
  assert.equal(result.tasks[0].priority, "medium");
});
