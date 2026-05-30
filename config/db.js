const mongoose = require("mongoose");
const User = require("../models/User");

const createDefaultAdmin = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const email = "onyeweketerence@gmail.com";
      const password = "Admin@321"; // Strong default password

      const admin = new User({
        email,
        password,
        role: "admin",
      });

      await admin.save();
      console.log(`✅ Default admin user created (${email} / ${password})`);
    } else {
      console.log("👤 Admin already exist. Skipping admin seeding.");
    }
  } catch (err) {
    console.error("❌ Failed to create default admin:", err.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    await createDefaultAdmin(); // Run after DB connection
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
