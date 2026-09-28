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

  if (!Number.isInteger(value) || value < 1) {
    alert("Attendance value must be a positive integer");
    return;
  }

  if (name === "") {
    alert("Enter subject name");
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

  // const value = subject.attendanceValue;

  for (const date in subject.records) {

    const value = subject.records[date];

    if (value > 0)
      present += value;

    total += Math.abs(value);

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

function markToday(subject, value) {
  const date = today();

  if (!subject.records[date]) {
    subject.records[date] = 0;
  }

  subject.records[date] += value;

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

    //todays count  span update (0)
    const todayValue = subject.records[today()] || 0;

    const todayCount = card.querySelector(".today-count"); // class of the "0"
    todayCount.textContent = todayValue;

    if (todayValue > 0) {
      todayCount.style.color = "green";
    } else if (todayValue < 0) {
      todayCount.style.color = "red";
    } else {
      todayCount.style.color = "black";
    }

    //

    card.querySelector(".present-btn")
      .onclick = () =>
        markToday(subject, subject.attendanceValue);

    card.querySelector(".absent-btn")
      .onclick = () =>
        markToday(subject, -subject.attendanceValue);

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

const modal = document.getElementById("calendarModal");

modal.addEventListener("click", function (e) {
  if (e.target === modal) {
    selectedDate = null;
    selectedCell = null;
    closeCalendar();
  }
});

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

    const value = currentSubject.records[date] || 0;

    if (value > 0)
      cls = "present";

    if (value < 0)
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
             onclick="openDayPopup('${date}',this)">
             ${d}
        </div>`;
  }

}

// open popup on date click
let selectedDate = null;
let selectedCell = null;


function openDayPopup(date, cell) {


  selectedDate = date;

  const value = currentSubject.records[date] || 0;

  const popup = document.getElementById("dayPopup");
  const count = document.getElementById("dayCount");

  count.textContent = value;

  if (value > 0)
    count.style.color = "green";
  else if (value < 0)
    count.style.color = "red";
  else
    count.style.color = "black";

  // position below clicked day
  const rect = cell.getBoundingClientRect();

  popup.style.position = "fixed";
  popup.style.left = rect.left + "px";
  popup.style.top = (rect.bottom + 6) + "px";
  popup.style.display = "block";


}

document.getElementById("plusDay").onclick = function () {

  currentSubject.records[selectedDate] =
    (currentSubject.records[selectedDate] || 0)
    + currentSubject.attendanceValue;

  saveData();
  drawCalendar();
  renderSubjects();

  openDayPopup(selectedDate, selectedCell); // refresh number
};


document.getElementById("minusDay").onclick = function () {

  currentSubject.records[selectedDate] =
    (currentSubject.records[selectedDate] || 0)
    - currentSubject.attendanceValue;

  saveData();
  drawCalendar();
  renderSubjects();

  openDayPopup(selectedDate, selectedCell); // refresh number
};

document.addEventListener("click", function (e) {
  const popup = document.getElementById("dayPopup");

  if (
    popup.style.display === "block" &&
    !popup.contains(e.target) &&
    !e.target.closest(".day")
  ) {
    popup.style.display = "none";
  }
});


function prevMonth() {

  current.setMonth(current.getMonth() - 1);

  drawCalendar();

}

function nextMonth() {

  current.setMonth(current.getMonth() + 1);

  drawCalendar();

}

// table column resizable//

let currentTh;
let startX;
let startWidth;

document.querySelectorAll(".resize-handle").forEach(handle => {

  handle.addEventListener("mousedown", function (e) {

    currentTh = this.parentElement;
    startX = e.pageX;
    startWidth = currentTh.offsetWidth;

    document.addEventListener("mousemove", resizeColumn);
    document.addEventListener("mouseup", stopResize);

    e.preventDefault();
  });

});

function resizeColumn(e) {

  const width = startWidth + (e.pageX - startX);

  if (width > 40) {
    currentTh.style.width = width + "px";
  }

}

function stopResize() {

  document.removeEventListener("mousemove", resizeColumn);
  document.removeEventListener("mouseup", stopResize);

}
// 


// ---------- START ----------

renderSubjects();


// ==============================
// BACKUP IN ONLINE DB
// ==============================
// backup button 
const backupBtn = document.getElementById("backupButton");

backupBtn.addEventListener("click", () => {
  window.location.href = "/login.html";

});

// backup to cloud fn >backend
async function backupToCloud() {
  const { data: { user }, error: userError } =
    await supabase.auth.getUser();

  if (userError || !user) {
    console.error("User is not logged in");
    return;
  }

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("attendance_backups")
    .upsert(
      {
        user_id: user.id,
        backup_date: today,
        backup_data: appData
      },
      {
        onConflict: "user_id,backup_date"
      }
    );

  if (error) {
    console.error("Cloud backup failed:", error);
    return;
  }

  console.log("Cloud backup successful");
}