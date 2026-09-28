// for backup efectiveness
// html rendering of all backups in history
// a bacup button
const supabaseUrl = "https://dvuhlrjlicimddlastjf.supabase.co";
const supabaseKey = "sb_publishable_pK48pe9oQiCXEvTH6a-eOA_LhDU8Oh4";

const supabaseClient = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);

const STORAGE_KEY = "attendanceTrackerV1";

const backupNowBtn = document.getElementById("backupNowBtn");
const backupStatus = document.getElementById("backupStatus");
const backupList = document.getElementById("backupList");


// ==========================================
// CHECK LOGIN
// ==========================================

async function checkUser() {

  const {
    data: { user },
    error
  } = await supabaseClient.auth.getUser();

  if (error || !user) {

    // Not logged in
    window.location.href = "/login.html";

    return null;
  }

  return user;
}


// ==========================================
// BACKUP NOW
// ==========================================

backupNowBtn.addEventListener("click", async function () {

  backupStatus.textContent = "Creating backup...";

  const user = await checkUser();

  if (!user) {
    return;
  }


  // Get complete appData from localStorage

  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {

    backupStatus.textContent =
      "No attendance data found on this device.";

    return;
  }


  const appData = JSON.parse(saved);


  // Today's date

  const today = new Date()
    .toISOString()
    .split("T")[0];


  // Upload complete appData

  const { error } = await supabaseClient
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

    console.error("Backup failed:", error);

    backupStatus.textContent =
      "Backup failed.";

    return;
  }


  backupStatus.textContent =
    "Backup successful!";


  // Refresh backup list

  loadBackups();

});


// ==========================================
// LOAD PREVIOUS BACKUPS
// ==========================================

async function loadBackups() {

  const user = await checkUser();

  if (!user) {
    return;
  }


  const { data, error } = await supabaseClient
    .from("attendance_backups")
    .select("id, backup_date, created_at")
    .eq("user_id", user.id)
    .order("backup_date", {
      ascending: false
    });


  if (error) {

    console.error("Could not load backups:", error);

    return;
  }


  backupList.innerHTML = "";


  data.forEach((backup, index) => {

    const row = document.createElement("tr");


    const numberCell = document.createElement("td");

    numberCell.textContent = index + 1;


    const dateCell = document.createElement("td");

    dateCell.textContent = backup.backup_date;


    const timeCell = document.createElement("td");

    timeCell.textContent =
      new Date(backup.created_at)
        .toLocaleString();


    const restoreCell = document.createElement("td");

    const restoreButton =
      document.createElement("button");

    restoreButton.textContent = "Restore";


    restoreButton.addEventListener(
      "click",
      function () {

        restoreBackup(backup.id);

      }
    );


    restoreCell.appendChild(restoreButton);


    row.appendChild(numberCell);

    row.appendChild(dateCell);

    row.appendChild(timeCell);

    row.appendChild(restoreCell);


    backupList.appendChild(row);

  });

}


// ==========================================
// RESTORE
// ==========================================

async function restoreBackup(backupId) {

  const user = await checkUser();

  if (!user) {
    return;
  }


  const { data, error } = await supabaseClient
    .from("attendance_backups")
    .select("backup_data")
    .eq("id", backupId)
    .eq("user_id", user.id)
    .single();


  if (error) {

    console.error("Restore failed:", error);

    alert("Restore failed.");

    return;
  }


  // Put backup back into localStorage

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data.backup_data)
  );


  alert("Backup restored successfully.");

}


// ==========================================
// START
// ==========================================

loadBackups();