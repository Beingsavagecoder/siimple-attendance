// ==========================================
// Attendance Tracker - Part 1
// Core + Subject Management
// ==========================================

// ---------- STORAGE ----------

const STORAGE_KEY = "attendanceTrackerV1";

let appData = {
  subjects: []
};

loadData();

// ---------- DOM ----------

const subjectContainer = document.getElementById("subjectContainer");

const subjectNameInput = document.getElementById("subjectName");

const attendanceValueInput =
  document.getElementById("attendanceValue");

const addSubjectBtn =
  document.getElementById("addSubjectBtn");

const template =
  document.getElementById("subjectTemplate");

// ---------- LOAD ----------

function loadData() {

  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {

    appData = JSON.parse(saved);

  }

}

// ---------- SAVE ----------

function saveData() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(appData)
  );

}

// ---------- DATE ----------

function today() {

  return new Date().toISOString().split("T")[0];

}

// ---------- FIND SUBJECT ----------

function getSubject(name) {

  return appData.subjects.find(s => s.name === name);

}

// ---------- ADD SUBJECT ----------

addSubjectBtn.addEventListener("click", function () {

  const name = subjectNameInput.value.trim();

  const value = Number(attendanceValueInput.value);

  if (name === "") {

    alert("Enter subject name");

    return;

  }

  if (value <= 0) {

    alert("Attendance value must be greater than zero");

    return;

  }

  if (getSubject(name)) {

    alert("Subject already exists");

    return;

  }

  appData.subjects.push({

    name,

    attendanceValue: value,

    records: {}

  });

  saveData();

  renderSubjects();

  subjectNameInput.value = "";

});

// ---------- DELETE ----------

function deleteSubject(name) {

  if (!confirm("Delete " + name + "?"))
    return;

  appData.subjects =
    appData.subjects.filter(s => s.name !== name);

  saveData();

  renderSubjects();

}

// ---------- CALCULATE ----------

function calculate(subject) {

  let total = 0;

  let present = 0;

  const value = subject.attendanceValue;

  for (const date in subject.records) {

    const status = subject.records[date];

    if (status === "P") {

      present += value;

      total += value;

    }

    if (status === "A") {

      total += value;

    }

  }

  return {

    total,

    present,

    percentage:
      total === 0
        ? 0
        : ((present / total) * 100).toFixed(1)

  };

}

// ---------- OVERALL ----------

function updateOverall() {

  let total = 0;

  let present = 0;

  appData.subjects.forEach(subject => {

    const data = calculate(subject);

    total += data.total;

    present += data.present;

  });

  document.getElementById("overallPresent").textContent =
    present;

  document.getElementById("overallTotal").textContent =
    total;

  document.getElementById("overallPercentage").textContent =
    total === 0
      ? "0%"
      : ((present / total) * 100).toFixed(1) + "%";

}

// ---------- TODAY BUTTONS ----------

function markToday(subject, status) {

  subject.records[today()] = status;

  saveData();

  renderSubjects();

}

// ---------- RENDER ----------

function renderSubjects() {

  subjectContainer.innerHTML = "";

  appData.subjects.forEach(subject => {

    const card =
      template.content.cloneNode(true);

    const stats =
      calculate(subject);

    card.querySelector(".subject-title")
      .textContent = subject.name;

    card.querySelector(".attendance-value")
      .textContent = subject.attendanceValue;

    card.querySelector(".present-count")
      .textContent = stats.present;

    card.querySelector(".total-count")
      .textContent = stats.total;

    card.querySelector(".percentage")
      .textContent = stats.percentage + "%";

    card.querySelector(".present-btn")
      .onclick = () =>
        markToday(subject, "P");

    card.querySelector(".absent-btn")
      .onclick = () =>
        markToday(subject, "A");

    card.querySelector(".delete-btn")
      .onclick = () =>
        deleteSubject(subject.name);

    // Placeholder
    card.querySelector(".calendar-btn")
      .onclick = () =>
        openCalendar(subject);



    subjectContainer.appendChild(card);

  });

  updateOverall();

}

// ---------- CALENDAR ----------
// ---------- CALENDAR ----------

let current = new Date();
let currentSubject = null;

const monthYear = document.getElementById("monthYear");
const calendar = document.getElementById("calendar");

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function openCalendar(subject) {

  currentSubject = subject;

  drawCalendar();

  document.getElementById("calendarModal").style.display = "block";

}

function closeCalendar() {

  document.getElementById("calendarModal").style.display = "none";

}

function drawCalendar() {

  const year = current.getFullYear();
  const month = current.getMonth();

  monthYear.textContent =
    months[month] + " " + year;

  calendar.innerHTML = "";

  const first =
    new Date(year, month, 1).getDay();

  const total =
    new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < first; i++) {

    calendar.innerHTML += "<div></div>";

  }

  for (let d = 1; d <= total; d++) {

    const date =
      `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    let cls = "";

    const status = currentSubject.records[date];

    if (status === "P")
      cls = "present";

    if (status === "A")
      cls = "absent";

    const now = new Date();

    if (
      now.getDate() == d &&
      now.getMonth() == month &&
      now.getFullYear() == year
    ) {
      cls += " today";
    }

    calendar.innerHTML += `
        <div class="day ${cls}"
             onclick="toggleAttendance('${date}')">
             ${d}
        </div>`;
  }

}

function toggleAttendance(date) {

  const currentStatus = currentSubject.records[date];

  if (currentStatus === "P") {

    currentSubject.records[date] = "A";

  } else if (currentStatus === "A") {

    delete currentSubject.records[date];   // Remove attendance completely

  } else {

    currentSubject.records[date] = "P";

  }

  saveData();
  drawCalendar();
  renderSubjects();
}

function prevMonth() {

  current.setMonth(current.getMonth() - 1);

  drawCalendar();

}

function nextMonth() {

  current.setMonth(current.getMonth() + 1);

  drawCalendar();

}


// ---------- START ----------

renderSubjects();


