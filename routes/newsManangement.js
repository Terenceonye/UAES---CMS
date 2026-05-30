const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const acceptNewsFile = require("../config/multerConfigNews");
const News = require("../models/newsModel");
const path = require("path");
const fs = require("fs");

const htmlTruncate = require("html-truncate");

router.get("/news-management", (req, res) => {
  res.render("news-management");
});

router.get("/add-news", (req, res) => {
  const formData = req.flash("formData")[0] || {};
  res.render("add-news", { formData });
});

function cleanQuillHtml(html) {
  // Removes empty <p> tags only at the start and end of the string
  return html.replace(
    /^(<p>(<br>|&nbsp;|\s)*<\/p>)+|(<p>(<br>|&nbsp;|\s)*<\/p>)+$/g,
    "",
  );
}

router.post("/add-news", protect, (req, res) => {
  acceptNewsFile.array("upload", 10)(req, res, async function (err) {
    if (err) {
      req.flash("error_msg", err.message);
      req.flash("formData", {
        newsTitle: req.body.newsTitle,
        content: req.body.NewsContent,
        newsTag: req.body.newsTag,
        isActive: req.body.isActive === "true",
      });
      return res.redirect("/add-news");
    }

    try {
      const { newsTitle, NewsContent, newsTag, isActive } = req.body;

      if (!newsTitle || !NewsContent) {
        req.flash("error_msg", "Title and content are required.");
        return res.redirect("/add-news");
      }

      if (!req.files || req.files.length === 0) {
        req.flash("error_msg", "No files uploaded.");
        return res.redirect("/add-news");
      }

      // Clean the Quill HTML content here
      const cleanedContent = cleanQuillHtml(NewsContent);

      const images = req.files.map((file) => ({
        filename: file.filename,
        url: `/uploadedNewsImages/${file.filename}`,
        originalName: file.originalname,
      }));

      const newsItem = new News({
        title: newsTitle.toUpperCase(),
        content: cleanedContent,
        newsTag: newsTag.toUpperCase(),
        images,
        isActive: isActive === "true",
      });

      await newsItem.save();

      req.flash("success_msg", "News uploaded successfully.");
      return res.redirect("/add-news");
    } catch (error) {
      console.error("Error uploading news:", error);
      req.flash("error_msg", "Internal server error while uploading news.");
      return res.redirect("/add-news");
    }
  });
});

router.get("/news/:id/edit", async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      req.flash("error_msg", "News not found.");
      return res.redirect("/news-list");
    }
    console.log("Flash success:", req.flash("success_msg"));
    console.log("Flash error:", req.flash("error_msg"));

    res.render("editNews", {
      news,
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg"),
    });
  } catch (error) {
    console.error("Error loading edit page:", error);
    req.flash("error_msg", "Server error while loading edit page.");
    res.redirect("/news-list");
  }
});

router.patch("/api/news/:id/status", async (req, res) => {
  try {
    await News.findByIdAndUpdate(req.params.id, {
      isActive: req.body.isActive,
    });
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.post("/news/:id/edit", (req, res) => {
  acceptNewsFile.array("upload", 10)(req, res, async function (err) {
    if (err) {
      req.flash("error_msg", err.message || "File upload error.");
      console.log("Edit request", req.body);

      req.flash("formData", {
        newsTitle: req.body.newsTitle,
        content: req.body.NewsContent,
        tag: req.body.newsTag,
        isActive: req.body.isActive === "true",
      });

      return res.redirect(`/news/${req.params.id}/edit`);
    }

    try {
      const { newsTitle, NewsContent, newsTag } = req.body;
      const news = await News.findById(req.params.id);
      if (!news) {
        req.flash("error_msg", "News not found.");
        return res.redirect("/news-list");
      }

      // Clean the Quill content here
      const cleanedContent = cleanQuillHtml(NewsContent);

      news.title = newsTitle.toUpperCase() || news.title;
      news.content = cleanedContent || news.content;
      news.newsTag = newsTag || news.newsTag;
      news.isActive = !!req.body.isActive;

      if (req.files && req.files.length > 0) {
        // Delete old images
        news.images.forEach((img) => {
          const filePath = path.join(__dirname, img.url);
          fs.unlink(filePath, (err) => {
            if (err) console.warn("Failed to delete old image:", filePath);
          });
        });

        news.images = req.files.map((file) => ({
          filename: file.filename,
          url: `/uploadedNewsImages/${file.filename}`,
          originalName: file.originalname,
        }));
      }

      await news.save();
      req.flash("success_msg", "News updated successfully.");
      res.redirect("/news-list");
    } catch (error) {
      console.error("Error editing news:", error);
      req.flash("error_msg", "Internal server error while editing news.");
      res.redirect(`/news/${req.params.id}/edit`);
    }
  });
});

router.post("/news/:id/delete", protect, async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      req.flash("error_msg", "News not found.");
      return res.redirect("/news-list");
    }

    // Loop through all images and delete them from the filesystem
    news.images.forEach((img) => {
      const filePath = path.resolve(
        "uploadedNewsImages",
        path.basename(img.url),
      );

      fs.unlink(filePath, (err) => {
        if (err) {
          console.warn("Failed to delete file:", filePath, err);
        } else {
          console.log("Deleted file:", filePath);
        }
      });
    });

    await News.findByIdAndDelete(req.params.id);
    req.flash("success_msg", "News deleted successfully.");
    res.redirect("/news-list");
  } catch (error) {
    console.error("Error deleting news:", error);
    req.flash("error_msg", "Internal server error while deleting news.");
    res.redirect("/news-list");
  }
});

router.get("/news-list", async (req, res) => {
  try {
    const perPage = 9;
    const page = parseInt(req.query.page) || 1;

    const totalNews = await News.countDocuments();
    const allNews = await News.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);

    const newsList = allNews.map((news) => ({
      ...news.toObject(),
      truncatedContent: htmlTruncate(news.content || "", 150, {
        ellipsis: "...",
      }),
    }));

    res.render("news-list", {
      newsList,
      currentPage: page,
      totalPages: Math.ceil(totalNews / perPage),
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    req.flash("error_msg", "Failed to load news.");
    res.redirect("/dashboard");
  }
});

router.get("/api/v1/news", async (req, res) => {
  try {
    const { id, page = 1, limit = 6, filter, search } = req.query;

    if (id) {
      const newsItem = await News.findById(id);
      if (!newsItem)
        return res
          .status(404)
          .json({ success: false, message: "News not found" });
      return res.json({ news: newsItem });
    }

    const query = {};
    if (filter === "active") {
      query.isActive = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const [total, news] = await Promise.all([
      News.countDocuments(),
      News.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    ]);

    res.json({ success: true, total, page: Number(page), news });
  } catch (error) {
    console.error("Error fetching news (API):", error);
    res.status(500).json({ success: false, message: "Failed to fetch news" });
  }
});

router.get("/api/v1/news", async (req, res) => {
  try {
    const { id, page = 1, limit = 10 } = req.query;

    if (id) {
      const newsItem = await News.findById(id);
      if (!newsItem)
        return res
          .status(404)
          .json({ success: false, message: "News not found" });
      return res.json({ news: newsItem });
    }

    const skip = (page - 1) * limit;
    const [total, news] = await Promise.all([
      News.countDocuments(),
      News.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    ]);

    res.json({ success: true, total, page: Number(page), news });
  } catch (error) {
    console.error("Error fetching news (API):", error);
    res.status(500).json({ success: false, message: "Failed to fetch news" });
  }
});

//=====================================================================
//Public API to get all news
//=====================================================================

router.get("/api/v1/news/active", async (req, res) => {
  try {
    const { id, page = 1, limit = 10, filter } = req.query;

    if (id) {
      const newsItem = await News.findById(id);
      if (!newsItem)
        return res
          .status(404)
          .json({ success: false, message: "News not found" });
      return res.json({ news: newsItem });
    }

    const query = { isActive: true };

    const skip = (page - 1) * limit;
    const [total, news] = await Promise.all([
      News.countDocuments(),
      News.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    ]);

    res.json({ success: true, total, page: Number(page), news });
  } catch (error) {
    console.error("Error fetching news (API):", error);
    res.status(500).json({ success: false, message: "Failed to fetch news" });
  }
});

module.exports = router;
