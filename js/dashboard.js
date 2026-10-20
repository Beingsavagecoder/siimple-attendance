
const SUPABASE_URL = "https://dvuhlrjlicimddlastjf.supabase.co";
const SUPABASE_KEY = "sb_publishable_pK48pe9oQiCXEvTH6a-eOA_LhDU8Oh4";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const welcomeMessage = document.getElementById("welcomeMessage");
const statusMessage = document.getElementById("statusMessage");
const backupButton = document.getElementById("backupButton");
const mapButton = document.getElementById("mapButton");
const logoutButton = document.getElementById("logoutButton");

let currentUser = null;

async function initializeDashboard() {
  const { data, error } = await supabaseClient.auth.getUser();

  if (error || !data.user) {
    // Login page must return the user here after OAuth.
    window.location.replace("login.html?next=dashboard.html");
    return;
  }

  currentUser = data.user;

  welcomeMessage.textContent =
    `Signed in as ${currentUser.email || "student"}`;
}

backupButton.addEventListener("click", () => {
  // Existing attendance backup page.
  window.location.href = "backup_list.html";
});

mapButton.addEventListener("click", async () => {
  if (!currentUser) {
    window.location.href = "login.html?next=dashboard.html";
    return;
  }

  mapButton.disabled = true;
  statusMessage.textContent = "Checking your student registration...";

  try {
    const { data: profile, error } = await supabaseClient
      .from("student_profiles")
      .select("user_id")
      .eq("user_id", currentUser.id)
      .maybeSingle();

    if (error) throw error;

    if (profile) {
      window.location.href = "chat.html";
    } else {
      window.location.href = "mapregister.html";
    }
  } catch (error) {
    console.error("Registration check failed:", error);
    statusMessage.textContent =
      "Could not check registration. Please try again.";
    mapButton.disabled = false;
  }
});

logoutButton.addEventListener("click", async () => {
  logoutButton.disabled = true;

  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    statusMessage.textContent = "Could not sign out. Please try again.";
    logoutButton.disabled = false;
    return;
  }

  window.location.href = "login.html";
});

initializeDashboard();
