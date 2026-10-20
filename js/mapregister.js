/* ---------- STUDENT MAP REGISTRATION ---------- */


const SUPABASE_URL =
  "https://dvuhlrjlicimddlastjf.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_pK48pe9oQiCXEvTH6a-eOA_LhDU8Oh4";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const form = document.getElementById("studentRegistrationForm");
const message = document.getElementById("registrationMessage");
const submitButton = form.querySelector('button[type="submit"]');

const nicknameInput = document.getElementById("nickname");
const universityInput = document.getElementById("universitySearch");
const educationLevel = document.getElementById("educationLevel");
const courseSelect = document.getElementById("course");
const branchSelect = document.getElementById("branch");
const studyYear = document.getElementById("studyYear");

let currentUser = null;

const courseOptions = {
  "After 12th": ["Undergraduate degree", "Integrated programme"],
  "Diploma": ["Diploma", "Polytechnic Diploma"],
  "UG": ["B.Tech", "B.E.", "BCA", "B.Sc.", "B.Com.", "B.A.", "BBA", "MBBS", "B.Pharm.", "Other"],
  "PG": ["M.Tech", "M.E.", "MCA", "M.Sc.", "M.Com.", "M.A.", "MBA", "M.Pharm.", "Other"],
  "PhD": ["PhD", "Doctoral programme"]
};

const branchOptions = {
  "B.Tech": ["Computer Science", "Information Technology", "AI / Machine Learning", "Data Science", "Electronics", "Electrical", "Mechanical", "Civil", "Other"],
  "B.E.": ["Computer Science", "Information Technology", "AI / Machine Learning", "Data Science", "Electronics", "Electrical", "Mechanical", "Civil", "Other"],
  "BCA": ["Computer Applications", "Other"],
  "MCA": ["Computer Applications", "Other"],
  "B.Sc.": ["Computer Science", "Mathematics", "Physics", "Chemistry", "Biology", "Other"],
  "M.Sc.": ["Computer Science", "Mathematics", "Physics", "Chemistry", "Biology", "Other"],
  "B.Com.": ["Commerce", "Accounting", "Finance", "Other"],
  "M.Com.": ["Commerce", "Accounting", "Finance", "Other"],
  "B.A.": ["English", "Economics", "History", "Political Science", "Psychology", "Other"],
  "M.A.": ["English", "Economics", "History", "Political Science", "Psychology", "Other"],
  "BBA": ["Business Administration", "Other"],
  "MBA": ["Business Administration", "Finance", "Marketing", "Human Resources", "Other"],
  "M.Tech": ["Computer Science", "AI / Machine Learning", "Data Science", "Electronics", "Electrical", "Mechanical", "Civil", "Other"],
  "M.E.": ["Computer Science", "Electronics", "Electrical", "Mechanical", "Civil", "Other"],
  "B.Pharm.": ["Pharmacy", "Other"],
  "M.Pharm.": ["Pharmacy", "Other"],
  "MBBS": ["Medicine", "Other"],
  "Diploma": ["Computer Engineering", "Mechanical", "Electrical", "Civil", "Other"],
  "Polytechnic Diploma": ["Computer Engineering", "Mechanical", "Electrical", "Civil", "Other"],
  "Undergraduate degree": ["Computer Science", "Engineering", "Science", "Commerce", "Arts", "Other"],
  "Integrated programme": ["Integrated Engineering", "Integrated Science", "Other"],
  "PhD": ["Computer Science", "Engineering", "Science", "Arts", "Commerce", "Other"],
  "Doctoral programme": ["Computer Science", "Engineering", "Science", "Arts", "Commerce", "Other"],
  "Other": ["Other"]
};

function showMessage(text, isError = true) {
  message.textContent = text;
  message.classList.remove("hidden", "text-red-600", "text-green-600");
  message.classList.add(isError ? "text-red-600" : "text-green-600");
}

function fillSelect(select, placeholder, options) {
  select.replaceChildren();

  const firstOption = document.createElement("option");
  firstOption.value = "";
  firstOption.textContent = placeholder;
  select.appendChild(firstOption);

  for (const value of options) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  }

  select.disabled = options.length === 0;
}

educationLevel.addEventListener("change", () => {
  const options = courseOptions[educationLevel.value] || [];
  fillSelect(courseSelect, "Select course", options);
  fillSelect(branchSelect, "Select course first", []);
});

courseSelect.addEventListener("change", () => {
  const options = branchOptions[courseSelect.value] || ["Other"];
  fillSelect(branchSelect, "Select branch / field", options);
});

async function initializeRegistration() {
  const { data, error } = await supabaseClient.auth.getUser();

  if (error || !data.user) {
    window.location.href =
      "login.html?next=mapregister.html";
    return;
  }

  currentUser = data.user;

  const { data: existingProfile, error: profileError } =
    await supabaseClient
      .from("student_profiles")
      .select("user_id")
      .eq("user_id", currentUser.id)
      .maybeSingle();

  if (profileError) {
    console.error(profileError);
    showMessage("Could not check your registration. Please try again.");
    return;
  }

  if (existingProfile) {
    window.location.replace("chat.html");
    return;
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!currentUser) {
    showMessage("Your login session is missing. Please sign in again.");
    return;
  }

  const nickname = nicknameInput.value.trim();
  const universityName = universityInput.value.trim();
  const level = educationLevel.value;
  const course = courseSelect.value;
  const branch = branchSelect.value;
  const year = Number(studyYear.value);

  if (!nickname || !universityName || !level || !course || !branch || !year) {
    showMessage("Please complete every field.");
    return;
  }

  if (nickname.length > 30 || universityName.length > 150) {
    showMessage("Please check the nickname and university name lengths.");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Registering...";

  try {
    // Find the university first.
    const { data: universities, error: universityReadError } =
      await supabaseClient
        .from("universities")
        .select("id, name")
        .eq("name", universityName)
        .limit(1);

    if (universityReadError) throw universityReadError;

    let universityId;

    if (universities && universities.length > 0) {
      universityId = universities[0].id;
    } else {
      // Add it if it doesn't exist yet.
      const { data: newUniversity, error: universityInsertError } =
        await supabaseClient
          .from("universities")
          .insert({ name: universityName })
          .select("id")
          .single();

      if (universityInsertError) throw universityInsertError;
      universityId = newUniversity.id;
    }

    // Save the student's profile using the authenticated account ID.
    const { error: profileInsertError } = await supabaseClient
      .from("student_profiles")
      .insert({
        user_id: currentUser.id,
        university_id: universityId,
        nickname,
        education_level: level,
        course,
        branch,
        study_year: year
      });

    if (profileInsertError) throw profileInsertError;

    showMessage("Registration successful! Opening ChatMap...", false);
    window.location.replace("chat.html");
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === "23505") {
      showMessage("A profile already exists for your account. Opening ChatMap...", false);
      window.location.replace("chat.html");
    } else {
      showMessage(
        error.message || "Registration failed. Please try again."
      );
    }
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Register";
  }
});

initializeRegistration();