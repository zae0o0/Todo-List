const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const completedCounter = document.getElementById("completed-counter");
const uncompletedCounter = document.getElementById("uncompleted-counter");
const clearCompletedBtn = document.getElementById("clear-completed");
const modeToggle = document.getElementById("mode-toggle");
const modeLabel = document.getElementById("mode-label"); // <-- new label span

// ---- LocalStorage Helpers ----
function saveTasks() {
  localStorage.setItem("tasks", listContainer.innerHTML);
}
function loadTasks() {
  const data = localStorage.getItem("tasks");
  if (data) {
    listContainer.innerHTML = data;
    reattachEvents();
    updateCounters();
  }
}

// ---- Counter Update ----
function updateCounters() {
  const completedTasks = document.querySelectorAll(".completed").length;
  const uncompletedTasks = document.querySelectorAll("li:not(.completed)").length;
  completedCounter.textContent = completedTasks;
  uncompletedCounter.textContent = uncompletedTasks;
  saveTasks();
}

// ---- Add New Task ----
function addTask() {
  const task = inputBox.value.trim();
  if (!task) {
    alert("Please write down a task");
    return;
  }

  const li = document.createElement("li");
  li.innerHTML = `
    <label>
      <input type="checkbox">
      <span>${task}</span>
    </label>
    <span class="edit-btn">Edit</span>
    <span class="delete-btn">Delete</span>
  `;
  listContainer.appendChild(li);
  inputBox.value = "";

  attachEvents(li);
  updateCounters();
}

// ---- Attach Events to Task ----
function attachEvents(li) {
  const checkbox = li.querySelector("input");
  const taskSpan = li.querySelector("span");
  const editBtn = li.querySelector(".edit-btn");
  const deleteBtn = li.querySelector(".delete-btn");

  checkbox.addEventListener("click", function () {
    li.classList.toggle("completed", checkbox.checked);
    updateCounters();
  });

  editBtn.addEventListener("click", function () {
    const update = prompt("Edit task:", taskSpan.textContent);
    if (update !== null && update.trim() !== "") {
      taskSpan.textContent = update.trim();
      li.classList.remove("completed");
      checkbox.checked = false;
      updateCounters();
    }
  });

  deleteBtn.addEventListener("click", function () {
    li.remove();
    updateCounters();
  });
}

// ---- Reattach Events after Loading ----
function reattachEvents() {
  const allItems = listContainer.querySelectorAll("li");
  allItems.forEach(li => attachEvents(li));
}

// ---- Clear Completed ----
clearCompletedBtn.addEventListener("click", function () {
  document.querySelectorAll(".completed").forEach(li => li.remove());
  updateCounters();
});

// ---- Dark/Light Mode ----
modeToggle.addEventListener("change", function () {
  const darkModeOn = modeToggle.checked;
  document.body.classList.toggle("dark-mode", darkModeOn);
  localStorage.setItem("darkMode", darkModeOn);

  // Update label
  modeLabel.textContent = darkModeOn ? "☀️ Light Mode" : "🌙 Dark Mode";
});

// ---- On Page Load ----
window.onload = function () {
  loadTasks();
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
    modeToggle.checked = true;
    modeLabel.textContent = "☀️ Light Mode";
  } else {
    modeLabel.textContent = "🌙 Dark Mode";
  }
};

