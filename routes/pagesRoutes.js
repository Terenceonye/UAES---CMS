const express = require("express");
const router = express.Router();

// WEBSITE PAGES
// router.get("/", (req, res) => {
//   res.render("index");
// });

// router.get("/bursar", (req, res) => {
//   res.render("bursar");
// });

// router.get("/contact", (req, res) => {
//   res.render("contact");
// });

// router.get("/deputy-rector-academics", (req, res) => {
//   res.render("deputy-rector-academics");
// });

// router.get("/rector", (req, res) => {
//   res.render("rector");
// });

// router.get("/deputy-rector-admin", (req, res) => {
//   res.render("deputy-rector-admin");
// });

// router.get("/events", (req, res) => { //Check this route in events route file
//   res.render("events");
// });

// router.get("/faculty-staff", (req, res) => {
//   res.render("faculty-staff");
// });

// router.get("/gallery", (req, res) => {
//   res.render("gallery");
// });

// router.get("/gender-studies", (req, res) => {
//   res.render("gender-studies");
// });

// router.get("/governing-council", (req, res) => {
//   res.render("governing-council");
// });

// router.get("/history", (req, res) => {
//   res.render("history");
// });

// router.get("/ict-directorate", (req, res) => {
//   res.render("ict-directorate");
// });

// router.get("/librarian", (req, res) => {
//   res.render("librarian");
// });

// router.get("/mission-vision-objectives", (req, res) => {
//   res.render("mission-vision-objectives");
// });

// router.get("/news", (req, res) => {
//   res.render("news");
// });

// router.get("/news-details", (req, res) => {
//   res.render("news-details");
// });

// router.get("/profile", (req, res) => {
//   const { id } = req.query;
//   if (!id)
//     return res
//       .status(400)
//       .json({ success: false, message: "Invalid profile id" });

//   res.render("profile");
// });

// router.get("/rector-message", (req, res) => {
//   res.render("rector-message");
// });

// router.get("/registrar", (req, res) => {
//   res.render("registrar");
// });

// router.get("/students-life", (req, res) => {
//   res.render("students-life");
// });

// router.get("/UISTO-tad", (req, res) => {
//   res.render("UISTO-tad-device");
// });

// router.get("/privacy-policy", (req, res) => {
//   res.render("privacy-policy");
// });

// ADMIN DASHBOARD PAGES

router.get("/adminlogin", (req, res) => {
  res.render("login");
});

router.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

router.get("/schools", (req, res) => {
  res.render("schools");
});

router.get("/departments", (req, res) => {
  res.render("departments");
});

// router.get("/program-types", (req, res) => {
//   res.render("programtypes");
// });

// router.get("/programs", (req, res) => {
//   res.render("programs");
// });

// router.get("/staff", (req, res) => {
//   res.render("staff");
// });

router.get("/uprofile", (req, res) => {
  res.render("uprofile");
});

// router.get("/admission-requirements", (req, res) => {
//   res.render("admission-requirements");
// });

// router.get("/sports-directorate", (req, res) => {
//   res.render("sports-directorate");
// });

// router.get("/key-institutional-data", (req, res) => {
//   res.render("key-institutional-data");
// });

// router.get("/request-account-deletion", (req, res) => {
//   res.render("request-account-deletion");
// });

module.exports = router;
