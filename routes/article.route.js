import express from "express";
import faultFindingService from "../services/faultFinding.service.js";
import { uploadImageBase64 } from "../utils/imageUtils.js";
import articleService from "../services/article.service.js";

const articleRouter = express.Router();

articleRouter.get("/", async function (req, res) {
  const articles = await articleService.getAllArticles();
  res.render("Article/list", {
    articles,
  });
});

articleRouter.get("/add", async function (req, res) {
  res.render("Article/add");
});

articleRouter.post("/addArticle", async function (req, res) {
  const { Title, Description, category_id, TagIDs, ArticleImage } = req.body;
  const base64Image = ArticleImage
    ? Buffer.from(ArticleImage).toString("base64")
    : null;

  const newArticle = {
    title: Title,
    img: base64Image,
    description: Description,
    publishedDay: new Date(),
    category_id: category_id,
  };

  const result = await articleService.addArticle(newArticle);
  const articleId = result[0];

  if (TagIDs && TagIDs.length > 0) {
    await articleService.addTagsToArticle(articleId, TagIDs);
  }

  res.render("Article/add", { message: "Bài viết đã được thêm thành công!" });
});

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

export default articleRouter;
