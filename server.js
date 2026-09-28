// require("dotenv").config();

// const express = require("express");
// const path = require("path");
// const { createClient } = require("@supabase/supabase-js");

// const app = express();
// const PORT = 3000;

// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_KEY
// );


// app.use(express.json());

// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "index.html"));
// });

// app.get("/login", (req, res) => {
//   res.sendFile(path.join(__dirname, "login.html"));
// });

// app.get("/backup_list", (req, res) => {
//   res.sendFile(path.join(__dirname, "backup_list.html"));
// });



// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });


const express = require("express");
const path = require("path");

const app = express();

const publicFolder = __dirname;

console.log("Serving folder:", publicFolder);

app.use(express.static(publicFolder));

app.listen(3000, () => {
  console.log("http://localhost:3000");
});