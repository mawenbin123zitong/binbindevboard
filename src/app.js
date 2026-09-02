(function bootstrapDevBoard() {
  "use strict";

  const STORAGE_KEY = "devboard-workspace-v1";
  const THEME_KEY = "devboard-theme";
  const core = window.DevBoardCore;
  const statusLabels = { todo: "To do", progress: "In progress", done: "Done" };

  const sampleWorkspace = {
    projects: [
      { id: "p1", name: "Pulse API", description: "Service health platform", language: "TypeScript", languageColor: "#476fbd", color: "#dce8ff", progress: 78, status: "active", updated: "2026-09-01", favorite: true },
      { id: "p2", name: "Northstar", description: "Personal finance companion", language: "Python", languageColor: "#e4ae35", color: "#fff0b8", progress: 61, status: "active", updated: "2026-08-31", favorite: true },
      { id: "p3", name: "FormKit", description: "Accessible form primitives", language: "JavaScript", languageColor: "#f1ce43", color: "#f4e987", progress: 92, status: "active", updated: "2026-08-29", favorite: false },
      { id: "p4", name: "Signal Notes", description: "Local-first knowledge base", language: "Rust", languageColor: "#f26b4f", color: "#ffc9b9", progress: 43, status: "paused", updated: "2026-08-24", favorite: false }
    ],
    tasks: [
      { id: "t1", title: "Document rate-limit behavior", projectId: "p1", status: "todo", priority: "high", dueDate: "2026-09-03" },
      { id: "t2", title: "Add export filters to reports", projectId: "p2", status: "todo", priority: "medium", dueDate: "2026-09-05" },
      { id: "t3", title: "Audit keyboard focus states", projectId: "p3", status: "todo", priority: "low", dueDate: "2026-09-06" },
      { id: "t4", title: "Implement webhook retries", projectId: "p1", status: "progress", priority: "high", dueDate: "2026-09-02" },
      { id: "t5", title: "Refine onboarding categories", projectId: "p2", status: "progress", priority: "medium", dueDate: "2026-09-04" },
      { id: "t6", title: "Prepare v1.4 release notes", projectId: "p3", status: "progress", priority: "low", dueDate: "2026-09-07" },
      { id: "t7", title: "Ship status page endpoint", projectId: "p1", status: "done", priority: "high", dueDate: "2026-08-30" },
      { id: "t8", title: "Add recurring transaction rules", projectId: "p2", status: "done", priority: "medium", dueDate: "2026-08-31" },
      { id: "t9", title: "Publish validation examples", projectId: "p3", status: "done", priority: "low", dueDate: "2026-08-29" }
    ],
    milestones: [
      { id: "m1", title: "Pulse API public beta", date: "2026-09-12", progress: 78 },
      { id: "m2", title: "Northstar private preview", date: "2026-09-21", progress: 61 },
      { id: "m3", title: "FormKit v1.4", date: "2026-09-07", progress: 92 }
    ],
    activity: [
      { id: "a1", icon: "M", text: "Milestone FormKit v1.4 reached 92%", timestamp: "2026-09-01T08:45:00" },
      { id: "a2", icon: "P", text: "Progress updated on Pulse API", timestamp: "2026-08-31T16:20:00" },
      { id: "a3", icon: "T", text: "Completed Add recurring transaction rules", timestamp: "2026-08-31T10:10:00" },
      { id: "a4", icon: "N", text: "Created project Signal Notes", timestamp: "2026-08-24T14:05:00" }
    ]
  };

  const elements = {
    activeProjectsMetric: document.querySelector("#activeProjectsMetric"),
    activityList: document.querySelector("#activityList"),
    addTaskButton: document.querySelector("#addTaskButton"),
    cancelTask: document.querySelector("#cancelTask"),
    clearCompleted: document.querySelector("#clearCompleted"),
    closeSidebar: document.querySelector("#closeSidebar"),
    closeTaskDialog: document.querySelector("#closeTaskDialog"),
    completedTasksMetric: document.querySelector("#completedTasksMetric"),
    donutValue: document.querySelector("#donutValue"),
    focusCompleted: document.querySelector("#focusCompleted"),
    focusDonut: document.querySelector("#focusDonut"),
    focusInProgress: document.querySelector("#focusInProgress"),
    focusMetric: document.querySelector("#focusMetric"),
    focusRemaining: document.querySelector("#focusRemaining"),
    greeting: document.querySelector("#greeting"),
    globalSearch: document.querySelector("#globalSearch"),
    milestoneList: document.querySelector("#milestoneList"),
    milestoneMetric: document.querySelector("#milestoneMetric"),
    nextMilestone: document.querySelector("#nextMilestone"),
    nextMilestoneDate: document.querySelector("#nextMilestoneDate"),
    openSidebar: document.querySelector("#openSidebar"),
    profileButton: document.querySelector("#profileButton"),
    projectCount: document.querySelector("#projectCount"),
    projectRows: document.querySelector("#projectRows"),
    projectsEmpty: document.querySelector("#projectsEmpty"),
    resetWorkspace: document.querySelector("#resetWorkspace"),
    sidebarFocus: document.querySelector("#sidebarFocus"),
    sidebarProgress: document.querySelector("#sidebarProgress"),
    sidebarScrim: document.querySelector("#sidebarScrim"),
    taskBoard: document.querySelector("#taskBoard"),
    taskCount: document.querySelector("#taskCount"),
    taskDialog: document.querySelector("#taskDialog"),
    taskDueDate: document.querySelector("#taskDueDate"),
    taskForm: document.querySelector("#taskForm"),
    taskProject: document.querySelector("#taskProject"),
    tasksEmpty: document.querySelector("#tasksEmpty"),
    themeToggle: document.querySelector("#themeToggle"),
    todayLabel: document.querySelector("#todayLabel"),
    toast: document.querySelector("#toast"),
    weekRange: document.querySelector("#weekRange")
  };

  let workspace = loadWorkspace();
  let projectFilter = "all";
  let searchQuery = "";
  let toastTimer;

  function cloneSampleWorkspace() {
    return JSON.parse(JSON.stringify(sampleWorkspace));
  }

  function loadWorkspace() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return core.normalizeWorkspace(stored ? JSON.parse(stored) : cloneSampleWorkspace());
    } catch (error) {
      console.warn("Could not read the saved workspace.", error);
      return core.normalizeWorkspace(cloneSampleWorkspace());
    }
  }

  function saveWorkspace() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatShortDate(value) {
    const date = new Date(`${value}T12:00:00`);
    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
  }

  function formatRelativeDate(value) {
    const date = new Date(`${value}T12:00:00`);
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const days = Math.round((today - date) / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days > 1 && days < 7) return `${days} days ago`;
    return formatShortDate(value);
  }

  function formatActivityTime(value) {
    const date = new Date(value);
    const now = new Date();
    const difference = Math.max(0, now - date);
    const hours = Math.floor(difference / 3600000);
    const days = Math.floor(hours / 24);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
  }

  function getProject(projectId) {
    return workspace.projects.find((project) => project.id === projectId);
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.add("show");
    toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 2400);
  }

  function addActivity(icon, text) {
    workspace.activity.unshift({
      id: `a-${Date.now()}`,
      icon,
      text,
      timestamp: new Date().toISOString()
    });
    workspace.activity = workspace.activity.slice(0, 8);
  }

  function renderMetrics() {
    const stats = core.deriveStats(workspace);
    elements.activeProjectsMetric.textContent = stats.activeProjects;
    elements.completedTasksMetric.textContent = stats.completed;
    elements.focusMetric.textContent = `${stats.focusScore}%`;
    elements.milestoneMetric.textContent = stats.openMilestones;
    elements.projectCount.textContent = workspace.projects.length;
    elements.taskCount.textContent = stats.remaining;
    elements.donutValue.textContent = `${stats.focusScore}%`;
    elements.focusCompleted.textContent = stats.completed;
    elements.focusInProgress.textContent = stats.inProgress;
    elements.focusRemaining.textContent = stats.remaining;
    elements.focusDonut.style.setProperty("--focus-angle", `${stats.focusScore * 3.6}deg`);
    elements.focusDonut.setAttribute("aria-label", `Weekly focus is ${stats.focusScore}% complete`);
    elements.sidebarFocus.textContent = `${stats.focusScore}%`;
    elements.sidebarProgress.style.width = `${stats.focusScore}%`;
  }

  function renderProjects(projects) {
    elements.projectRows.innerHTML = projects.map((project) => `
      <tr>
        <td>
          <div class="project-name">
            <span class="project-icon" style="background:${escapeHtml(project.color)}">${escapeHtml(project.name.slice(0, 1))}</span>
            <div><strong>${escapeHtml(project.name)}</strong><small>${escapeHtml(project.description)}</small></div>
          </div>
        </td>
        <td><span class="language-label" style="--language-color:${escapeHtml(project.languageColor)}">${escapeHtml(project.language)}</span></td>
        <td><div class="table-progress"><div class="progress-track"><span style="width:${Number(project.progress)}%"></span></div><span>${Number(project.progress)}%</span></div></td>
        <td><span class="updated-label">${formatRelativeDate(project.updated)}</span></td>
        <td><button class="favorite-button${project.favorite ? " active" : ""}" type="button" data-favorite-project="${escapeHtml(project.id)}" aria-label="${project.favorite ? "Remove from" : "Add to"} favorites" title="Favorite">${project.favorite ? "&#9733;" : "&#9734;"}</button></td>
      </tr>
    `).join("");
    elements.projectsEmpty.hidden = projects.length > 0;
    elements.projectRows.closest(".project-table-wrap").hidden = projects.length === 0;
  }

  function taskCard(task) {
    const project = getProject(task.projectId) || { name: "Unassigned", color: "#dedfd8" };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdue = task.status !== "done" && new Date(`${task.dueDate}T00:00:00`) < today;
    const leftDisabled = task.status === "todo" ? "disabled" : "";
    const rightDisabled = task.status === "done" ? "disabled" : "";
    return `
      <article class="task-card${task.status === "done" ? " is-done" : ""}">
        <div class="task-card-head">
          <span class="priority-chip ${escapeHtml(task.priority)}">${escapeHtml(task.priority)}</span>
          <button class="delete-button" type="button" data-delete-task="${escapeHtml(task.id)}" aria-label="Delete ${escapeHtml(task.title)}" title="Delete task">&times;</button>
        </div>
        <p class="task-title">${escapeHtml(task.title)}</p>
        <div class="task-meta">
          <span class="task-project"><span style="background:${escapeHtml(project.color)}"></span>${escapeHtml(project.name)}</span>
          <time class="due-date${overdue ? " overdue" : ""}" datetime="${escapeHtml(task.dueDate)}">${formatShortDate(task.dueDate)}</time>
        </div>
        <div class="task-actions">
          <button class="move-button" type="button" data-move-task="${escapeHtml(task.id)}" data-direction="-1" aria-label="Move task back" title="Move back" ${leftDisabled}>&larr;</button>
          ${task.status !== "done" ? `<button class="complete-button" type="button" data-complete-task="${escapeHtml(task.id)}" aria-label="Mark task complete" title="Complete task">&#10003;</button>` : ""}
          <button class="move-button" type="button" data-move-task="${escapeHtml(task.id)}" data-direction="1" aria-label="Move task forward" title="Move forward" ${rightDisabled}>&rarr;</button>
        </div>
      </article>
    `;
  }

  function renderTasks(tasks) {
    elements.taskBoard.innerHTML = core.STATUSES.map((status) => {
      const columnTasks = tasks.filter((task) => task.status === status);
      return `
        <section class="task-column" data-status="${status}" aria-labelledby="column-${status}">
          <div class="task-column-heading">
            <h3 id="column-${status}"><span class="column-dot"></span>${statusLabels[status]}</h3>
            <span class="task-count-chip">${columnTasks.length}</span>
          </div>
          <div class="task-list">${columnTasks.map(taskCard).join("")}</div>
        </section>
      `;
    }).join("");
    elements.tasksEmpty.hidden = tasks.length > 0;
    elements.taskBoard.hidden = tasks.length === 0;
  }

  function renderActivity() {
    elements.activityList.innerHTML = workspace.activity.slice(0, 6).map((item) => `
      <li class="activity-item">
        <span class="activity-icon" aria-hidden="true">${escapeHtml(item.icon)}</span>
        <p>${escapeHtml(item.text)}</p>
        <time datetime="${escapeHtml(item.timestamp)}">${formatActivityTime(item.timestamp)}</time>
      </li>
    `).join("");
  }

  function renderMilestones() {
    const milestones = [...workspace.milestones].sort((a, b) => a.date.localeCompare(b.date));
    elements.milestoneList.innerHTML = milestones.map((milestone) => `
      <article class="milestone-row">
        <div class="milestone-row-head"><strong>${escapeHtml(milestone.title)}</strong><time datetime="${escapeHtml(milestone.date)}">${formatShortDate(milestone.date)}</time></div>
        <div class="progress-track"><span style="width:${Number(milestone.progress)}%"></span></div>
        <div class="milestone-progress-label"><span>Progress</span><span>${Number(milestone.progress)}%</span></div>
      </article>
    `).join("");
    const next = milestones.find((milestone) => milestone.progress < 100);
    elements.nextMilestone.textContent = next ? next.title : "All milestones complete";
    elements.nextMilestoneDate.textContent = next ? formatShortDate(next.date) : "Done";
  }

  function render() {
    const filtered = core.filterWorkspace(workspace, searchQuery, projectFilter);
    renderMetrics();
    renderProjects(filtered.projects);
    renderTasks(filtered.tasks);
    renderActivity();
    renderMilestones();
  }

  function persistAndRender() {
    saveWorkspace();
    render();
  }

  function openTaskDialog() {
    elements.taskProject.innerHTML = workspace.projects
      .map((project) => `<option value="${escapeHtml(project.id)}">${escapeHtml(project.name)}</option>`)
      .join("");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    elements.taskDueDate.value = tomorrow.toISOString().slice(0, 10);
    elements.taskDialog.showModal();
    setTimeout(() => document.querySelector("#taskTitle").focus(), 0);
  }

  function closeTaskDialog() {
    elements.taskDialog.close();
    elements.taskForm.reset();
  }

  function closeSidebar() {
    document.body.classList.remove("sidebar-open");
  }

  elements.globalSearch.addEventListener("input", (event) => {
    searchQuery = event.target.value;
    render();
  });

  document.querySelectorAll("[data-project-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      projectFilter = button.dataset.projectFilter;
      document.querySelectorAll("[data-project-filter]").forEach((item) => item.classList.toggle("active", item === button));
      render();
    });
  });

  elements.projectRows.addEventListener("click", (event) => {
    const button = event.target.closest("[data-favorite-project]");
    if (!button) return;
    const project = workspace.projects.find((item) => item.id === button.dataset.favoriteProject);
    if (!project) return;
    project.favorite = !project.favorite;
    persistAndRender();
    showToast(project.favorite ? `${project.name} added to favorites` : `${project.name} removed from favorites`);
  });

  elements.taskBoard.addEventListener("click", (event) => {
    const moveButton = event.target.closest("[data-move-task]");
    const completeButton = event.target.closest("[data-complete-task]");
    const deleteButton = event.target.closest("[data-delete-task]");

    if (moveButton && !moveButton.disabled) {
      const task = workspace.tasks.find((item) => item.id === moveButton.dataset.moveTask);
      workspace = core.moveTask(workspace, moveButton.dataset.moveTask, Number(moveButton.dataset.direction));
      addActivity("T", `Moved ${task.title} to ${statusLabels[workspace.tasks.find((item) => item.id === task.id).status]}`);
      persistAndRender();
      showToast("Task moved");
    }

    if (completeButton) {
      const task = workspace.tasks.find((item) => item.id === completeButton.dataset.completeTask);
      if (!task) return;
      task.status = "done";
      addActivity("T", `Completed ${task.title}`);
      persistAndRender();
      showToast("Task completed");
    }

    if (deleteButton) {
      const task = workspace.tasks.find((item) => item.id === deleteButton.dataset.deleteTask);
      if (!task || !window.confirm(`Delete "${task.title}"?`)) return;
      workspace.tasks = workspace.tasks.filter((item) => item.id !== task.id);
      persistAndRender();
      showToast("Task deleted");
    }
  });

  elements.addTaskButton.addEventListener("click", openTaskDialog);
  elements.closeTaskDialog.addEventListener("click", closeTaskDialog);
  elements.cancelTask.addEventListener("click", closeTaskDialog);
  elements.taskDialog.addEventListener("click", (event) => {
    if (event.target === elements.taskDialog) closeTaskDialog();
  });

  elements.taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(elements.taskForm);
    const title = String(data.get("title")).trim();
    if (!title) return;
    workspace.tasks.push({
      id: `t-${Date.now()}`,
      title,
      projectId: String(data.get("project")),
      status: String(data.get("status")),
      priority: String(data.get("priority")),
      dueDate: String(data.get("dueDate"))
    });
    addActivity("T", `Created task ${title}`);
    closeTaskDialog();
    persistAndRender();
    showToast("Task created");
  });

  elements.clearCompleted.addEventListener("click", () => {
    const completed = workspace.tasks.filter((task) => task.status === "done").length;
    if (!completed) {
      showToast("There are no completed tasks to clear");
      return;
    }
    if (!window.confirm(`Clear ${completed} completed task${completed === 1 ? "" : "s"}?`)) return;
    workspace = core.clearCompleted(workspace);
    addActivity("T", `Cleared ${completed} completed task${completed === 1 ? "" : "s"}`);
    persistAndRender();
    showToast("Completed tasks cleared");
  });

  elements.resetWorkspace.addEventListener("click", () => {
    if (!window.confirm("Reset all local changes and restore the sample workspace?")) return;
    workspace = core.normalizeWorkspace(cloneSampleWorkspace());
    searchQuery = "";
    projectFilter = "all";
    elements.globalSearch.value = "";
    document.querySelectorAll("[data-project-filter]").forEach((item) => item.classList.toggle("active", item.dataset.projectFilter === "all"));
    persistAndRender();
    showToast("Sample workspace restored");
  });

  elements.openSidebar.addEventListener("click", () => document.body.classList.add("sidebar-open"));
  elements.closeSidebar.addEventListener("click", closeSidebar);
  elements.sidebarScrim.addEventListener("click", closeSidebar);
  document.querySelectorAll(".nav-item").forEach((item) => item.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((link) => link.classList.toggle("active", link === item));
    closeSidebar();
  }));

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    elements.themeToggle.innerHTML = theme === "dark" ? "&#9790;" : "&#9788;";
    elements.themeToggle.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} theme`);
    document.querySelector('meta[name="theme-color"]').setAttribute("content", theme === "dark" ? "#181a18" : "#f4f4f0");
  }

  elements.themeToggle.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
  });

  elements.profileButton.addEventListener("click", () => showToast("This demo keeps your profile private and local"));

  document.addEventListener("keydown", (event) => {
    const isTyping = event.target.matches("input, textarea, select");
    if (event.key === "/" && !isTyping) {
      event.preventDefault();
      elements.globalSearch.focus();
    }
  });

  const preferredTheme = localStorage.getItem(THEME_KEY) || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  applyTheme(preferredTheme);
  const today = new Date();
  const dayStart = new Date(today);
  const dayOffset = (today.getDay() + 6) % 7;
  dayStart.setDate(today.getDate() - dayOffset);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayStart.getDate() + 6);
  const hour = today.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  elements.greeting.textContent = `${greeting}, Developer.`;
  elements.todayLabel.textContent = new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" }).format(today);
  elements.weekRange.textContent = `${new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(dayStart)} - ${new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(dayEnd)}`;
  render();
})();
