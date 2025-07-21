const previousDate = document.getElementById("previousDate")
const nextDate = document.getElementById("nextDate")
const currentDate = document.getElementById("currentDate")
const addActivityButton = document.getElementById("add")
const calculateButton = document.getElementById("calculate")
const result = document.getElementById("result")
const theme = document.getElementById("change-theme")
const root = document.documentElement

let current = new Date()
let lastTotalTime = 0

currentDate.value = getFormattedDate(current)
addActivityButton.addEventListener("click", addActivity)
previousDate.addEventListener("click", () => navigateDate(-1))
nextDate.addEventListener("click", () => navigateDate(1))
theme.addEventListener("click", toggleTheme)
currentDate.addEventListener("change", handleDateChange)

setInterval(calculateTotal, 200)
setInterval(saveTasksInLocalStorage, 500)

function getFormattedDate(date) {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  return `${year}-${month}-${day}`
}

function navigateDate(days) {
  current.setDate(current.getDate() + days)
  currentDate.value = getFormattedDate(current)
  clearIntervals()
  loadIntervals()
}

function handleDateChange() {
  const [year, month, day] = currentDate.value.split("-")
  current = new Date(year, month - 1, day)
  clearIntervals()
  loadIntervals()
}

function parseTime(date, time) {
  const [hours, minutes] = time.split(":")
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hours,
    minutes
  ).getTime()
}

function getTaskTotal(initial, final) {
  const today = new Date()
  initial = parseTime(today, initial)
  final = parseTime(today, final)
  return (final - initial) / 60000
}

function formatTime(time) {
  const hours = parseInt(time / 60)
  const minutes = time - hours * 60
  return [hours, minutes]
}

function calculateTotal() {
  const intervals = document.querySelectorAll(".interval")
  let totalTime = 0

  for (const interval of intervals) {
    const initial = interval.children[1].value
    const final = interval.children[2].value
    const total = interval.children[4]

    if (initial && final) {
      const taskTime = getTaskTotal(initial, final)
      totalTime += taskTime

      const [hours, minutes] = formatTime(taskTime)
      const formattedHours = hours.toString().padStart(2, "0")
      const formattedMinutes = minutes.toString().padStart(2, "0")
      total.value = `${formattedHours}:${formattedMinutes}`
    }
  }

  if (totalTime === lastTotalTime) return
  lastTotalTime = totalTime

  const [hours, minutes] = formatTime(totalTime)
  if (hours < 0 || minutes < 0) {
    addActivityButton.disabled = true
    result.innerText = "horas inválidas"
    return
  }

  addActivityButton.disabled = false
  const formattedHours = hours.toString().padStart(2, "0")
  const formattedMinutes = minutes.toString().padStart(2, "0")
  result.innerText = `${formattedHours}:${formattedMinutes}`
}

function createInputElement(type, readOnly = false) {
  const input = document.createElement("input")
  input.type = type
  if (readOnly) input.readOnly = true
  return input
}

function addActivity() {
  const inside = document.querySelector(".inside")
  const task = document.createElement("div")
  task.classList.add("interval")

  const startTime = createInputElement("time")
  const endTime = createInputElement("time")
  const description = createInputElement("text")
  const totalTime = createInputElement("time", true)

  const deleteButton = document.createElement("button")
  deleteButton.innerText = "✖"
  deleteButton.classList.add("delete")
  deleteButton.addEventListener("click", () => {
    deleteTaskInLocalStorage(task)
    task.remove()
  })

  task.appendChild(deleteButton)
  task.appendChild(startTime)
  task.appendChild(endTime)
  task.appendChild(description)
  task.appendChild(totalTime)

  inside.appendChild(task)
}

function toggleTheme() {
  root.classList.toggle("light-mode")
}

function clearIntervals() {
  const intervals = document.querySelectorAll(".interval")
  intervals.forEach(interval => interval.remove())
}

function getIntervalsQuantity() {
  let i = 0
  while (localStorage.getItem(`${i} ${getFormattedDate(current)}`)) {
    i++
  }
  return i
}

function loadIntervals() {
  const intervalsCount = getIntervalsQuantity()

  if (intervalsCount === 0) {
    addActivity()
    return
  }

  for (let i = 0; i < intervalsCount; i++) {
    addActivity()
  }

  // Populate data
  const intervals = document.querySelectorAll(".interval")
  intervals.forEach((interval, index) => {
    const key = `${index} ${getFormattedDate(current)}`
    const intervalData = JSON.parse(localStorage.getItem(key))

    if (intervalData) {
      interval.children[1].value = intervalData.startTime
      interval.children[2].value = intervalData.endTime
      interval.children[3].value = intervalData.description
      interval.children[4].value = intervalData.totalTime
    }
  })
}

function saveTasksInLocalStorage() {
  const intervals = Array.from(document.querySelectorAll(".interval"))
    .map(interval => ({
      startTime: interval.children[1].value,
      endTime: interval.children[2].value,
      description: interval.children[3].value,
      totalTime: interval.children[4].value
    }))
    .filter(interval =>
      interval.startTime && interval.endTime &&
      interval.description && interval.totalTime
    )

  intervals.forEach((interval, index) => {
    const key = `${index} ${getFormattedDate(current)}`
    localStorage.setItem(key, JSON.stringify(interval))
  })
}

function deleteTaskInLocalStorage() {
  const quantity = getIntervalsQuantity()

  for (let i = 0; i < quantity; i++) {
    const key = `${i} ${getFormattedDate(current)}`
    localStorage.removeItem(key)
  }

  for (let i = 0; i < quantity - 1; i++) {
    const nextKey = `${i + 1} ${getFormattedDate(current)}`
    const currentKey = `${i} ${getFormattedDate(current)}`
    localStorage.setItem(currentKey, localStorage.getItem(nextKey))
  }

  const lastKey = `${quantity - 1} ${getFormattedDate(current)}`
  localStorage.removeItem(lastKey)

  return true
}

loadIntervals()
