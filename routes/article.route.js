import express from "express";
import articleService from "../services/article.service.js";
import multer from "multer";

const articleRouter = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

articleRouter.get("/", async function (req, res) {
  const articles = await articleService.getAllArticles();
  res.render("Article/list", {
    articles,
  });
});

articleRouter.get("/add", async function (req, res) {
  res.render("Article/add");
});

articleRouter.delete("/deleteArticle/:articleId", async (req, res) => {
  try {
    const { articleId } = req.params;
    const result = await articleService.deleteArticle(articleId);

    if (result) {
      res.status(200).json({ message: "Bài viết đã được xóa thành công!" });
    } else {
      res.status(404).json({ message: "Không tìm thấy bài viết để xóa." });
    }
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({ message: "Lỗi khi xóa bài viết.", error });
  }
});

articleRouter.post(
  "/updateArticle",
  upload.single("image"),
  async (req, res) => {
    try {
      const { articleId, title, description, category_id, tags } = req.body;
      const image = req.file ? req.file.buffer.toString("base64") : null;

      console.log(tags);

      // Parse tags if provided
      const tagIds = tags ? JSON.parse(tags) : [];

      // Prepare updated article data
      const updatedArticle = {
        title,
        description,
        category_id,
        img: image || undefined, // Only update the image if a new one is provided
      };

      // Update the article
      await articleService.updateArticle(articleId, updatedArticle);

      // Update tags if provided
      if (tagIds.length > 0) {
        await articleService.updateTagsForArticle(articleId, tagIds);
      }

      res
        .status(200)
        .json({ message: "Bài viết đã được cập nhật thành công!" });
    } catch (error) {
      console.error("Error details:", error);
      res.status(500).json({ message: "Lỗi khi cập nhật bài viết.", error });
    }
  }
);

articleRouter.post("/delete", async function (req, res) {
  const articleId = parseInt(req.body.ArticleID);
  await articleService.deleteArticle(articleId);
  res.redirect("/admin/articles");
});

articleRouter.post("/update", async function (req, res) {
  const articleId = parseInt(req.body.ArticleID);
  const updatedArticle = {
    Title: req.body.Title,
    Img: req.body.Img,
    Description: req.body.Description,
    PublishedDay: req.body.PublishedDay,
    CategoryID: req.body.CategoryID,
    TagID: req.body.TagID,
  };
  await articleService.updateArticle(articleId, updatedArticle);
  res.redirect("/admin/articles");
});

articleRouter.get("/top", async function (req, res) {
  const topArticles = await articleService.getTopArticles();
  res.json(topArticles);
});

articleRouter.get("/:articleId", async (req, res) => {
  try {
    const { articleId } = req.params;
    const article = await articleService.getArticleById(articleId);
    if (article.img) {
      article.img = article.img.toString("base64");
    }
    if (!article) {
      return res.status(404).json({ message: "Bài viết không tồn tại" });
    }

    res.json(article);
  } catch (error) {
    console.error("Lỗi khi lấy bài viết:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default articleRouter;
