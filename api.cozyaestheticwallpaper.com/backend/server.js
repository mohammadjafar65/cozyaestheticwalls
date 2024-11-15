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
      SELECT w.*, GROUP_CONCAT(t.name) AS tags
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

// Middleware to handle errors globally
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
