const previousDate = document.getElementById("previousDate");
const nextDate = document.getElementById("nextDate");
const currentDate = document.getElementById("currentDate");
const addActivityButton = document.getElementById("add");
const calculateButton = document.getElementById("calculate");
const result = document.getElementById("result");
const theme = document.getElementById("change-theme");
const root = document.documentElement;
const close = document.getElementById("close");
const help = document.getElementById("help");

let current = new Date();
let lastTotalTime = 0;

currentDate.value = getFormattedDate(current);
document.addEventListener("DOMContentLoaded", () => {
  loadIntervals();
  localStorage.getItem("help") === "false"
    ? (document.querySelector(".modal").style.display = "none")
    : (document.querySelector(".modal").style.display = "flex");
});

addActivityButton.addEventListener("click", addActivity);

setInterval(calculateTotal, 200);
setInterval(saveTasksInLocalStorage, 500);

currentDate.addEventListener("change", () => {
  const [year, month, day] = currentDate.value.split("-");
  current = new Date(year, month - 1, day);
  clearIntervals();
  loadIntervals();
});

function changeDate(days) {
  current.setDate(current.getDate() + days);
  currentDate.value = getFormattedDate(current);
}

function getFormattedDate(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTaskTotal(initial, final) {
  const today = new Date();
  initial = parseTime(today, initial);
  final = parseTime(today, final);
  return (final - initial) / 60000;
}

function parseTime(date, time) {
  const [hours, minutes] = time.split(":");
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hours,
    minutes
  ).getTime();
}

function calculateTotal() {
  const intervals = document.querySelectorAll(".interval");
  let totalTime = 0;

  for (const interval of intervals) {
    const initial = interval.children[1].value;
    const final = interval.children[2].value;
    const total = interval.children[4];

    if (initial && final) {
      const taskTime = getTaskTotal(initial, final);
      totalTime += taskTime;
      const formattedTime = formatTime(taskTime);
      const formattedHours = formattedTime[0].toString().padStart(2, "0");
      const formattedMinutes = formattedTime[1].toString().padStart(2, "0");
      total.value = `${formattedHours}:${formattedMinutes}`;
    }
  }

  if (totalTime === lastTotalTime) return;

  lastTotalTime = totalTime;

  const totalFormattedTime = formatTime(totalTime);
  if (totalFormattedTime[0] < 0 || totalFormattedTime[1] < 0) {
    addActivityButton.disabled = true;
    result.innerText = "horas inválidas";
    return;
  } else {
    addActivityButton.disabled = false;
  }

  const formattedHours = totalFormattedTime[0].toString().padStart(2, "0");
  const formattedMinutes = totalFormattedTime[1].toString().padStart(2, "0");

  result.innerText = `${formattedHours}:${formattedMinutes}`;
}

function formatTime(time) {
  const hours = parseInt(time / 60);
  const minutes = time - hours * 60;
  return [hours, minutes];
}

function addActivity() {
  const inside = document.querySelector(".inside");
  const task = document.createElement("div");
  task.classList.add("interval");

  const startTime = createInputElement("time");
  const endTime = createInputElement("time");
  const description = createInputElement("text");
  const totalTime = createInputElement("time", true);
  const deleteButton = document.createElement("button");
  deleteButton.innerText = "✖";
  deleteButton.classList.add("delete");
  deleteButton.addEventListener(
    "click",
    () => deleteTaskInLocalStorage(task) && task.remove()
  );

  task.appendChild(deleteButton);
  task.appendChild(startTime);
  task.appendChild(endTime);
  task.appendChild(description);
  task.appendChild(totalTime);

  inside.appendChild(task);
}

function createInputElement(type, readOnly = false) {
  const input = document.createElement("input");
  input.type = type;
  if (readOnly) input.readOnly = true;
  return input;
}

function clearIntervals() {
  const intervals = document.querySelectorAll(".interval");
  for (const interval of intervals) {
    interval.remove();
  }
}

function loadIntervals() {
  for (let i = 0; i < getIntervalsQuantity(); i++) {
    addActivity();
  }
  const intervals = document.querySelectorAll(".interval");
  intervals.forEach((interval, index) => {
    const intervalData = JSON.parse(
      localStorage.getItem(`${index + " " + getFormattedDate(current)}`)
    );
    if (intervalData) {
      interval.children[1].value = intervalData.startTime;
      interval.children[2].value = intervalData.endTime;
      interval.children[3].value = intervalData.description;
      interval.children[4].value = intervalData.totalTime;
    }
  });
  if (!intervals) {
    addActivity();
  }
}

function getIntervalsQuantity() {
  let i = 0;
  while (localStorage.getItem(`${i + " " + getFormattedDate(current)}`)) {
    i++;
  }
  return i;
}

function saveTasksInLocalStorage() {
  let intervals = document.querySelectorAll(".interval");
  intervals = Array.from(intervals);
  intervals = intervals
    .map((interval) => {
      return {
        startTime: interval.children[1].value,
        endTime: interval.children[2].value,
        description: interval.children[3].value,
        totalTime: interval.children[4].value,
      };
    })
    .filter(
      (interval) =>
        interval.startTime &&
        interval.endTime &&
        interval.description &&
        interval.totalTime
    );
  intervals.forEach((interval, index) => {
    localStorage.setItem(
      `${index + " " + getFormattedDate(current)}`,
      JSON.stringify(interval)
    );
  });
}

function deleteTaskInLocalStorage() {
  let quantity = getIntervalsQuantity();
  for (let i = 0; i < quantity; i++) {
    localStorage.removeItem(`${i + " " + getFormattedDate(current)}`);
  }
  quantity--;
  for (let i = 0; i < quantity; i++) {
    localStorage.setItem(
      `${i + " " + getFormattedDate(current)}`,
      localStorage.getItem(`${i + 1 + " " + getFormattedDate(current)}`)
    );
  }
  localStorage.removeItem(`${quantity + " " + getFormattedDate(current)}`);
  return true;
}

previousDate.addEventListener("click", () => {
  changeDate(-1);
  clearIntervals();
  loadIntervals();
});

nextDate.addEventListener("click", () => {
  changeDate(1);
  clearIntervals();
  loadIntervals();
});

close.addEventListener("click", () => {
  document.querySelector(".modal").style.display = "none";
  localStorage.setItem("help", false);
});

help.addEventListener("click", () => {
  document.querySelector(".modal").style.display = "flex";
});

theme.addEventListener("click", changeTheme);

function changeTheme() {
  root.classList.contains("light-mode")
    ? root.classList.remove("light-mode")
    : root.classList.add("light-mode");
}
