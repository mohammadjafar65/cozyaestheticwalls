const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const mysql = require("mysql2");
const app = express();
const PORT = 3002;

// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: "localhost",
  user: "webifzwu_cozywallpaper", // use your MySQL root user or any other MySQL user you created
  password: "cozywallpaper12@", // use your MySQL password
  database: "webifzwu_wallpapersdb", // name of your MySQL database
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL");
});

// Middleware
// app.use(cors()); // Enable CORS for all routes
const cors = require("cors");
app.use(
  cors({
    origin: "http://cozyaestheticwallpaper.com", // Your frontend domain
  })
);
app.use(express.json()); // For parsing application/json
app.use("/uploads", express.static("uploads")); // Serve static files from the "uploads" folder

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, "client/build")));

// Handles any requests that don't match the ones above (fallback to React)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

// Multer storage configuration
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

// Upload wallpaper and store metadata in MySQL
app.post(
  "/api/wallpapers/upload",
  upload.single("wallpaperImage"),
  (req, res) => {
    const { title, description } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;

    const query =
      "INSERT INTO wallpapers (title, url, description) VALUES (?, ?, ?)";
    connection.query(query, [title, imageUrl, description], (err, result) => {
      if (err) {
        console.error("Error inserting wallpaper into MySQL:", err);
        return res.status(500).json({ error: "Failed to upload wallpaper" });
      }
      res.json({
        message: "Wallpaper uploaded successfully",
        id: result.insertId,
      });
    });
  }
);

// Fetch all wallpapers
app.get("/api/wallpapers", (req, res) => {
  const query = "SELECT * FROM wallpapers";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching wallpapers from MySQL:", err);
      return res.status(500).json({ error: "Failed to fetch wallpapers" });
    }
    res.json(results);
  });
});

app.delete("/api/wallpapers/:id", (req, res) => {
  const { id } = req.params;

  // Debugging logs
  console.log("Attempting to delete wallpaper with ID:", id);

  const query = "DELETE FROM wallpapers WHERE id = ?";
  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting wallpaper:", err);
      return res.status(500).json({ error: "Failed to delete wallpaper" });
    }

    console.log("Delete result:", result); // Log MySQL result
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Wallpaper deleted successfully" });
    } else {
      res.status(404).json({ error: "Wallpaper not found" });
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
