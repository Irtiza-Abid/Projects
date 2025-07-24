const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("."));

// Initialize SQLite database
const db = new sqlite3.Database("./delizio.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("✅ Connected to SQLite database");

    // Create users table if it doesn't exist
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
      (err) => {
        if (err) {
          console.error("Error creating table:", err.message);
        } else {
          console.log("✅ Users table ready");
        }
      }
    );
  }
});

// Routes

// Serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// User signup
app.post("/signup.php", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.json({
        status: "error",
        message: "All fields are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.json({
        status: "error",
        message: "Invalid email format",
      });
    }

    // Check if email already exists
    db.get(
      "SELECT email FROM users WHERE email = ?",
      [email],
      async (err, row) => {
        if (err) {
          console.error("Database error:", err);
          return res.json({
            status: "error",
            message: "Database error",
          });
        }

        if (row) {
          return res.json({
            status: "error",
            message: "Email already registered",
          });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert new user
        db.run(
          "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
          [name.trim(), email.trim().toLowerCase(), hashedPassword],
          function (err) {
            if (err) {
              console.error("Insert error:", err);
              return res.json({
                status: "error",
                message: "Failed to create account",
              });
            }

            res.json({
              status: "success",
              message: "Account created successfully! You can now sign in.",
            });
          }
        );
      }
    );
  } catch (error) {
    console.error("Signup error:", error);
    res.json({
      status: "error",
      message: "Server error",
    });
  }
});

// User login
app.post("/login.php", (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.json({
        status: "error",
        message: "Email and password are required",
      });
    }

    // Find user by email
    db.get(
      "SELECT * FROM users WHERE email = ?",
      [email.trim().toLowerCase()],
      async (err, user) => {
        if (err) {
          console.error("Database error:", err);
          return res.json({
            status: "error",
            message: "Database error",
          });
        }

        if (!user) {
          return res.json({
            status: "error",
            message: "Invalid email or password",
          });
        }

        // Check password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
          res.json({
            status: "success",
            message: "Login successful",
            name: user.name,
          });
        } else {
          res.json({
            status: "error",
            message: "Invalid email or password",
          });
        }
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    res.json({
      status: "error",
      message: "Server error",
    });
  }
});

// Database test endpoint
app.get("/test", (req, res) => {
  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    if (err) {
      res.json({
        status: "error",
        message: err.message,
      });
    } else {
      res.json({
        status: "success",
        message: "Database connection working",
        userCount: row.count,
      });
    }
  });
});

// API to get all users (for testing - remove in production)
app.get("/api/users", (req, res) => {
  db.all("SELECT id, name, email, created_at FROM users", (err, rows) => {
    if (err) {
      res.json({ error: err.message });
    } else {
      res.json({ users: rows });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Delizio Server Running!
📍 http://localhost:${PORT}
🎯 Test endpoint: http://localhost:${PORT}/test
👥 Users endpoint: http://localhost:${PORT}/api/users

To start the server: npm start
To stop the server: Ctrl+C
    `);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...");
  db.close((err) => {
    if (err) {
      console.error("Error closing database:", err.message);
    } else {
      console.log("✅ Database connection closed");
    }
    process.exit(0);
  });
});
