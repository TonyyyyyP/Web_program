import db from "../utils/db.js";

export default {
  getAllComments() {
    return db("comment");
  },

  getCommentById(commentId) {
    return db("comment").where("CommentID", commentId).first();
  },

  addComment(comment) {
    return db("comment").insert(comment).returning("id");
  },

  deleteComment(commentId) {
    return db("comment").where("CommentID", commentId).del();
  },

  updateComment(commentId, updatedComment) {
    return db("comment").where("CommentID", commentId).update(updatedComment);
  },

  getCommentsByArticleIdWithUser(articleId) {
    return db("comment")
      .join("user", "comment.user_id", "=", "user.id")
      .select(
        "comment.id as commentId",
        "comment.comment as commentContent",
        "comment.publishedDay as commentDate",
        "user.id as userId",
        "user.name as userName",
        "user.username as userUsername",
        "user.phoneNumber as userPhoneNumber",
        "user.img as userimg"
      )
      .where("comment.article_id", articleId);
  },
};
