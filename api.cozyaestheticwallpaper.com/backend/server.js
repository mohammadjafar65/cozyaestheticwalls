const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const mysql = require("mysql2");
const sharp = require("sharp");
const fs = require("fs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Database Connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    return;
  }
  console.log("Connected to the database");
});

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../../frontend/public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Secret Key and Admin Credentials
const SECRET_KEY = "yellow";
const USERNAME = "Admin";
const PASSWORD = "Zafar12@#";

// Middleware
app.use(
  cors({
    origin: [process.env.ORIGIN, process.env.ORIGINWWW, process.env.ORIGINTWO],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use("/uploads", express.static("uploads"));
app.use(express.json()); // Parse JSON requests

// Login Endpoint
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === USERNAME && password === PASSWORD) {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

// Verify Token
app.get("/api/verify-token", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    res.json({ user });
  });
});

// Multer Storage
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});
const upload = multer({ storage });

// Upload wallpaper with category, tags, and store metadata in MySQL
app.post(
  "/api/wallpapers/upload-multiple",
  upload.array("wallpaperImages", 20),
  async (req, res) => {
    const { title, description, category, tags } = req.body;
    const uploadedFiles = req.files;

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    try {
      const parsedTags = JSON.parse(tags); // Parse tags from request (they’re sent as JSON)
      const uploadResults = [];

      for (const file of uploadedFiles) {
        const originalImageUrl = `/uploads/${file.filename}`;
        const thumbnailFilename = `thumbnail-${Date.now()}-${
          file.filename
        }.webp`;
        const thumbnailUrl = `/uploads/${thumbnailFilename}`;

        let width;
        switch (category) {
          case "Phone":
            width = 250;
            break;
          case "Desktop":
            width = 800;
            break;
          case "Tablet":
            width = 500;
            break;
          default:
            width = 250;
        }

        // Create a compressed thumbnail for each file
        await sharp(file.path)
          .resize({ width })
          .webp({ quality: 100 })
          .toFile(path.join(__dirname, "uploads", thumbnailFilename));

        // Insert wallpaper details into the wallpapers table
        const query =
          "INSERT INTO wallpapers (title, url, description, thumbnailUrl, category, isNew, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)";
        const [result] = await connection
          .promise()
          .query(query, [
            title,
            originalImageUrl,
            description,
            thumbnailUrl,
            category,
            true,
            new Date(),
          ]);

        const wallpaperId = result.insertId;

        // Insert or retrieve each tag and create an association in wallpaper_tags table
        for (const tagName of parsedTags) {
          let tagId;

          // Check if tag already exists
          const [existingTag] = await connection
            .promise()
            .query("SELECT id FROM tags WHERE name = ?", [tagName]);

          if (existingTag.length > 0) {
            tagId = existingTag[0].id;
          } else {
            // Insert new tag into tags table if it doesn't exist
            const [newTagResult] = await connection
              .promise()
              .query("INSERT INTO tags (name) VALUES (?)", [tagName]);
            tagId = newTagResult.insertId;
          }

          // Associate the tag with the wallpaper
          await connection
            .promise()
            .query(
              "INSERT INTO wallpaper_tags (wallpaper_id, tag_id) VALUES (?, ?)",
              [wallpaperId, tagId]
            );
        }

        uploadResults.push({
          id: wallpaperId,
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

app.get("/api/tags", async (req, res) => {
  try {
    const [results] = await connection
      .promise()
      .query("SELECT DISTINCT name FROM tags");
    const tags = results.map((row) => row.name);
    res.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
});

function removeNewTag() {
  const query =
    "UPDATE wallpapers SET isNew = FALSE WHERE isNew = TRUE AND createdAt <= NOW() - INTERVAL 10 MINUTE";
  connection.query(query, (err, result) => {
    if (err) {
      console.error("Error updating isNew status:", err);
    }
  });
}

// Run every minute
setInterval(removeNewTag, 60000);

// Fetch wallpapers by category
app.get("/api/wallpapers/category/:category", async (req, res) => {
  const { category } = req.params;
  try {
    const [wallpapers] = await connection.promise().query(
      `
      SELECT w.*, GROUP_CONCAT(t.name) AS tags
      FROM wallpapers AS w
      LEFT JOIN wallpaper_tags AS wt ON w.id = wt.wallpaper_id
      LEFT JOIN tags AS t ON wt.tag_id = t.id
      WHERE w.category = ?
      GROUP BY w.id
      ORDER BY w.createdAt DESC
    `,
      [category]
    );

    const wallpapersWithTags = wallpapers.map((wallpaper) => ({
      ...wallpaper,
      tags: wallpaper.tags ? wallpaper.tags.split(",") : [],
    }));

    res.json(wallpapersWithTags);
  } catch (error) {
    console.error("Error fetching wallpapers by category:", error);
    res.status(500).json({ error: "Failed to fetch wallpapers" });
  }
});

// Fetch all wallpapers
app.get("/api/wallpapers", async (req, res) => {
  try {
    const [wallpapers] = await connection.promise().query(`
      SELECT w.*, GROUP_CONCAT(t.name) AS tags, w.downloadCount
      FROM wallpapers AS w
      LEFT JOIN wallpaper_tags AS wt ON w.id = wt.wallpaper_id
      LEFT JOIN tags AS t ON wt.tag_id = t.id
      GROUP BY w.id
      ORDER BY w.createdAt DESC
    `);

    const wallpapersWithTags = wallpapers.map((wallpaper) => ({
      ...wallpaper,
      tags: wallpaper.tags ? wallpaper.tags.split(",") : [],
    }));

    res.json(wallpapersWithTags);
  } catch (error) {
    console.error("Error fetching wallpapers:", error);
    res.status(500).json({ error: "Failed to fetch wallpapers" });
  }
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

  // Adjust path based on actual upload directory
  const filePath = path.join(
    __dirname,
    "../../frontend/public/uploads",
    filename
  );

  console.log("File path:", filePath); // Debug file path

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    return res.status(404).send("File not found.");
  }

  // Update isNew status in the database
  const updateQuery = "UPDATE wallpapers SET isNew = FALSE WHERE url = ?";
  connection.query(updateQuery, [`/uploads/${filename}`], (err) => {
    if (err) {
      console.error("Error updating isNew status on download:", err);
    }
  });

  // Serve the file
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.download(filePath, filename, (err) => {
    if (err) {
      console.error("Error downloading the file:", err);
      res.status(500).send("Could not download the file.");
    }
  });
});

app.get("/api/wallpapers/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await connection
      .promise()
      .query("SELECT * FROM wallpapers WHERE id = ?", [id]);
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ error: "Wallpaper not found" });
    }
  } catch (error) {
    console.error("Error fetching wallpaper details:", error);
    res.status(500).json({ error: "Failed to fetch wallpaper details" });
  }
});

app.post("/api/wallpapers/download/:id/increment", async (req, res) => {
  const { id } = req.params;
  try {
    const query =
      "UPDATE wallpapers SET downloadCount = downloadCount + 1 WHERE id = ?";
    await connection.promise().query(query, [id]);
    res.status(200).send({ success: true });
  } catch (error) {
    console.error("Error incrementing download count:", error);
    res.status(500).send({ success: false });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).send("Something went wrong!");
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
