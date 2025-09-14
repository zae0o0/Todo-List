const inputBox = document.getElementById("input-box");
const dueDateInput = document.getElementById("due-date");
const listContainer = document.getElementById("list-container");
const completedCounter = document.getElementById("completed-counter");
const uncompletedCounter = document.getElementById("uncompleted-counter");
const clearCompletedBtn = document.getElementById("clear-completed");
const modeToggle = document.getElementById("mode-toggle");
const modeLabel = document.getElementById("mode-label");

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

// ---- Chart.js Setup ----
let ctx = document.getElementById("progressChart").getContext("2d");
let chart = new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: ["Completed", "Uncompleted"],
    datasets: [{
      data: [0, 0],
      backgroundColor: ["#73cbed", "#fd9ed9"]
    }]
  }
});

// ---- Counter Update ----
function updateCounters() {
  const completedTasks = document.querySelectorAll(".completed").length;
  const uncompletedTasks = document.querySelectorAll("li:not(.completed)").length;
  completedCounter.textContent = completedTasks;
  uncompletedCounter.textContent = uncompletedTasks;
  saveTasks();

  chart.data.datasets[0].data = [completedTasks, uncompletedTasks];
  chart.update();
}

// ---- Add New Task ----
function addTask() {
  const task = inputBox.value.trim();
  const dueDate = dueDateInput.value;
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
    <span class="due">${dueDate || "No due date"}</span>
    <span class="edit-btn">Edit</span>
    <span class="delete-btn">Delete</span>
  `;
  listContainer.appendChild(li);
  inputBox.value = "";
  dueDateInput.value = "";

  if (dueDate) {
    const today = new Date().toISOString().split("T")[0];
    if (dueDate < today) {
      li.classList.add("overdue");
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("⏰ Task overdue: " + task);
      }
    }
  }

  attachEvents(li);
  updateCounters();
}

// ---- Attach Events ----
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
      li.classList.remove("completed", "overdue");
      checkbox.checked = false;
      updateCounters();
    }
  });

  deleteBtn.addEventListener("click", function () {
    li.remove();
    updateCounters();
  });
}

// ---- Reattach Events ----
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
  modeLabel.textContent = darkModeOn ? "☀️ Light Mode" : "🌙 Dark Mode";
});

// ---- On Load ----
window.onload = function () {
  loadTasks();
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
    modeToggle.checked = true;
    modeLabel.textContent = "☀️ Light Mode";
  }
  new Sortable(listContainer, { animation: 150, onEnd: saveTasks });
};
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
