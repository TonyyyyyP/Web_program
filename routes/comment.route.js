import express from "express";
import commentService from "../services/comment.service.js";
import multer from "multer";
const upload = multer();

const router = express.Router();

router.get("/comments", async function (req, res) {
  const comments = await commentService.getAllComments();
  res.render("Comment/list", { comments });
});

router.post("/addComment", upload.none(), async function (req, res) {
  try {
    const { userId, articleId, comment } = req.body;
    console.log(userId);
    console.log(articleId);
    console.log(comment);
    if (!userId || !articleId || !comment) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp đầy đủ thông tin!" });
    }

    const newComment = {
      comment,
      publishedDay: new Date(),
      user_id: userId,
      article_id: articleId,
    };

    const addedCommentId = await commentService.addComment(newComment);

    res.status(201).json({
      message: "Bình luận đã được thêm thành công!",
      commentId: addedCommentId[0],
    });
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({ message: "Lỗi khi thêm bình luận.", error });
  }
});


router.post("/comments/delete", async function (req, res) {
  const id = parseInt(req.body.id, 10);
  await commentService.deleteComment(id);
  res.redirect("/comments");
});

export default router;
