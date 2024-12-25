import express from "express";
import articleService from "../services/article.service.js";
import faultFindingService from "../services/faultFinding.service.js";
import multer from "multer";

const articleRouter = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

articleRouter.get("/", async function (req, res) {
  const articles = await articleService.getAllArticles();
  res.render("Article/list", {
    articles,
  });
});

articleRouter.post("/addArticle", upload.single("image"), async (req, res) => {
  try {
    const { title, description, category_id, tags, userId, premium, abstract } =
      req.body;
    const image = req.file ? req.file.buffer.toString("base64") : null;

    console.log(tags);

    const tagIds = tags ? JSON.parse(tags) : [];
    const newArticle = {
      title,
      description,
      category_id,
      img: image,
      publishedDay: new Date(),
      user_id: userId,
      premium: premium === "true" ? true : false,
      abstract,
    };
    const articleId = await articleService.addArticle(newArticle);

    if (tagIds.length > 0) {
      console.log("Tag IDs:", tagIds);
      articleService.addTagsToArticle(articleId, tagIds);
      console.log("Tags đã được thêm thành công!");
    } else {
      console.log("Không có tags để thêm.");
    }

    res.status(201).json({ message: "Bài viết đã được thêm thành công!" });
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({ message: "Lỗi khi thêm bài viết.", error });
  }
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
      const tagIds = tags ? JSON.parse(tags) : [];
      const updatedArticle = {
        title,
        description,
        category_id,
        img: image || undefined,
      };

      await articleService.updateArticle(articleId, updatedArticle);
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

articleRouter.post("/rejectArticle", upload.none(), async function (req, res) {
  try {
    const { articleId, userId, description } = req.body;
    if (!articleId || !userId || !description) {
      return res.status(400).json({ message: "Thiếu dữ liệu cần thiết." });
    }
    const existingFaultFinding = await faultFindingService.findOne({
      article_id: articleId,
    });

    if (existingFaultFinding) {
      await faultFindingService.updateFaultfinding(existingFaultFinding.id, {
        description,
      });
      return res.status(200).json({
        message: "Lí do từ chối đã được cập nhật thành công!",
        faultFinding: existingFaultFinding,
      });
    } else {
      const newFaultFinding = await faultFindingService.create({
        description,
        user_id: userId,
        article_id: articleId,
      });

      return res.status(201).json({
        message: "Từ chối thành công!",
        faultFinding: newFaultFinding,
      });
    }
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({ message: "Lỗi khi xử lý yêu cầu.", error });
  }
});

articleRouter.post(
  "/acceptedArticle/:articleId/:userId",
  upload.none(),
  async (req, res) => {
    try {
      const { articleId, userId } = req.params;
      const { publishTime } = req.body;

      console.log("Article ID:", articleId);
      console.log("User ID:", userId);
      console.log("Publish Time:", publishTime);

      const article = await articleService.getArticleById(articleId);
      if (!article) {
        return res.status(404).json({ message: "Bài viết không tồn tại." });
      }

      let faultFinding = await faultFindingService.findOne({
        article_id: articleId,
      });

      if (!faultFinding) {
        faultFinding = await faultFindingService.create({
          article_id: articleId,
          user_id: userId,
          description: "Đã duyệt bài viết",
          accepted: new Date(publishTime),
        });
        console.log("FaultFinding created:", faultFinding);
      }

      if (faultFinding && faultFinding.id) {
        const updatedFaultFinding =
          await faultFindingService.updateFaultfinding(faultFinding.id, {
            accepted: new Date(publishTime),
            user_id: userId,
          });

        return res.status(200).json({
          message: "Bài viết đã được duyệt thành công!",
          faultFinding: updatedFaultFinding,
        });
      } else {
        return res
          .status(400)
          .json({ message: "Không thể cập nhật lỗi tìm kiếm." });
      }
    } catch (error) {
      console.error("Lỗi khi xử lý bài viết:", error);
      return res.status(500).json({ message: "Lỗi server", error });
    }
  }
);


export default articleRouter;
