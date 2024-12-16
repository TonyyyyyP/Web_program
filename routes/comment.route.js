import express from "express";
import commentService from "../old_folder/old_services/category.service.js";

const router = express.Router();

router.get("/comments", async function (req, res) {
  const comments = await commentService.getAllComments();
  res.render("Comment/list", { comments });
});

router.post("/comments/add", async function (req, res) {
  const newComment = {
    comment: req.body.comment,
    publishedDay: req.body.publishedDay,
    user_id: req.body.user_id,
    article_id: req.body.article_id,
  };
  await commentService.addComment(newComment);
  res.redirect("/comments");
});

router.post("/comments/delete", async function (req, res) {
  const id = parseInt(req.body.id, 10);
  await commentService.deleteComment(id);
  res.redirect("/comments");
});

export default router;
