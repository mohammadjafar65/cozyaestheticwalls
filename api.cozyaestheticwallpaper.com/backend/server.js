const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const mysql = require("mysql2");
const sharp = require("sharp");
const fs = require("fs");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;

// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    process.exit(1); // Exit if connection fails
  }
  console.log("Connected to MySQL");
});

// Ensure uploads directory exists
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

// Middleware
app.use(
  cors({
    origin: [
      process.env.ORIGIN,
      process.env.ORIGINTWO,
      // "https://cozyaestheticwallpaper.com",
      // "https://admin.cozyaestheticwallpaper.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use("/uploads", express.static("uploads"));
app.use(express.json()); // For parsing application/json

// Multer storage configuration
const storage = multer.diskStorage({
  destination: "../../frontend/public/uploads",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


const upload = multer({ storage: storage });

// Upload wallpaper with category and store metadata in MySQL
app.post(
  "/api/wallpapers/upload-multiple",
  upload.array("wallpaperImages", 20), // Limit the number of files to 10 or adjust as needed
  async (req, res) => {
    const { title, description, category } = req.body;
    const uploadedFiles = req.files; // Access all uploaded files

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    try {
      // Array to hold results for each file uploaded
      const uploadResults = [];

      for (const file of uploadedFiles) {
        const originalImageUrl = `/uploads/${file.filename}`;
        const thumbnailFilename = `thumbnail-${Date.now()}-${file.filename}.webp`;
        const thumbnailUrl = `/uploads/${thumbnailFilename}`;

        // Set width based on category
        let width;
        switch (category) {
          case "Phone":
            width = 250; // Width for phone category
            break;
          case "Desktop":
            width = 800; // Width for desktop category
            break;
          case "Tablet":
            width = 500; // Width for tablet category
            break;
          default:
            width = 250; // Default width if no category is specified
        }

        // Create a compressed thumbnail for each file
        await sharp(file.path)
          .resize({ width })
          .webp({ quality: 100 })
          .toFile(path.join(__dirname, "uploads", thumbnailFilename));

        // Store original and thumbnail URLs along with the category in MySQL
        const query =
          "INSERT INTO wallpapers (title, url, description, thumbnailUrl, category, isNew) VALUES (?, ?, ?, ?, ?, ?)";
        const [result] = await connection.promise().query(query, [
          title,
          originalImageUrl,
          description,
          thumbnailUrl,
          category,
          true, // Set isNew to true
        ]);

        uploadResults.push({
          id: result.insertId,
          message: "Wallpaper and thumbnail uploaded successfully",
          originalImageUrl,
          thumbnailUrl,
        });
      }

      res.json({
        message: "Wallpapers uploaded successfully",
        files: uploadResults,
      });
    } catch (error) {
      console.error("Error creating thumbnails or uploading:", error);
      res.status(500).json({ error: "Failed to upload wallpapers" });
    }
  }
);


// app.post(
//   "/api/wallpapers/upload",
//   upload.single("wallpaperImage"),
//   (req, res) => {
//     const { title, description } = req.body;
//     const imageUrl = `/uploads/${req.file.filename}`;

//     const query =
//       "INSERT INTO wallpapers (title, url, description) VALUES (?, ?, ?)";
//     connection.query(query, [title, imageUrl, description], (err, result) => {
//       if (err) {
//         console.error("Error inserting wallpaper into MySQL:", err);
//         return res.status(500).json({ error: "Failed to upload wallpaper" });
//       }
//       res.json({
//         message: "Wallpaper uploaded successfully",
//         id: result.insertId,
//       });
//     });
//   }
// );

function removeNewTag() {
  const query = "UPDATE wallpapers SET isNew = FALSE WHERE isNew = TRUE AND createdAt <= NOW() - INTERVAL 10 MINUTE";
  connection.query(query, (err, result) => {
    if (err) {
      console.error("Error updating isNew status:", err);
    }
  });
}

// Run every minute
setInterval(removeNewTag, 60000);

// Fetch wallpapers by category
app.get("/api/wallpapers/category/:category", (req, res) => {
  const { category } = req.params;
  const query =
    "SELECT * FROM wallpapers WHERE category = ? ORDER BY createdAt DESC";
  connection.query(query, [category], (err, results) => {
    if (err) {
      console.error("Error fetching wallpapers by category from MySQL:", err);
      return res.status(500).json({ error: "Failed to fetch wallpapers" });
    }
    res.json(results);
  });
});

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

app.get("/api/wallpapers/download/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "uploads", filename);

  // Update isNew status in database for downloaded wallpaper
  const updateQuery = "UPDATE wallpapers SET isNew = FALSE WHERE url = ?";
  connection.query(updateQuery, [`/uploads/${filename}`], (err) => {
    if (err) {
      console.error("Error updating isNew status on download:", err);
    }
  });

  res.download(filePath, filename, (err) => {
    if (err) {
      console.error("Error downloading the file:", err);
      res.status(500).send("Could not download the file.");
    }
  });
});


// Middleware to handle errors globally
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
