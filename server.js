require("dotenv").config();

const express = require("express");

const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const multer = require("multer");
const sendEmailRoute = require("./routes/sendEmailRoute");
const faqRoutes = require("./routes/faqRoutes");
const chatRoutes = require("./routes/chatRoutes");

const session = require("express-session");
const flash = require("connect-flash");

const connectDB = require("./config/db");

// Connect to MongoDB
connectDB();

const app = express();

app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: true,
  }),
);

app.use(flash());

// Make flash messages available in all views
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

// Middleware

//ALLOW THE MAIN DOMAIN TO PASS CORS
app.use(cors());
// app.use(morgan("dev"));
app.use(express.json());
app.use("/uploads", express.static(process.env.UPLOAD_PATH || "uploads"));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(
  "/uploadedNewsImages",
  express.static(path.join(__dirname, "uploadedNewsImages")),
);

app.use(express.static(path.join(__dirname, "public")));

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// pages routes

app.use("/", require("./routes/pagesRoutes"));

// DASHBOARD ROUTES
app.use("/", require("./routes/dashboardRoutes"));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/schools", require("./routes/facultyRoutes"));
app.use("/api/departments", require("./routes/departmentRoutes"));
app.use("/api/program-types", require("./routes/programsTypeRoutes"));
app.use("/api/programs", require("./routes/programRoutes"));
app.use("/api/staff", require("./routes/staffRoutes"));

app.get("/CHAT-ai", (req, res) => {
  res.render("chat-ai");
});

// Use API routes
app.use("/api/v1", faqRoutes);
app.use("/api/v1", chatRoutes);
app.use("/", sendEmailRoute);

//News Management
app.use("/", require("./routes/newsManangement"));

app.use("/", require("./routes/eventsRoute"));

app.use("/", require("./routes/galleryRoutes"));

app.use("/", require("./routes/heroImagesRoutes"));

app.use("/", require("./routes/authRoutes"));

app.use("/api/v1", require("./routes/accountDeletionRoutes"));

app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is healthy",
    timestamp: new Date(),
  });
});

// Error handler middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size exceeds the 250KB limit.",
      });
    }
    return res.status(400).json({ success: false, message: err.message });
  } else if (err) {
    // Other errors
    return res.status(500).json({ success: false, message: err.message });
  }
  next();
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
