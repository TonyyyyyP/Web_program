import db from "../utils/db.js";

export default {
  getAllComments() {
    return db("comments");
  },

  getCommentById(commentId) {
    return db("comments").where("CommentID", commentId).first();
  },

  addComment(comment) {
    return db("comments").insert(comment);
  },

  deleteComment(commentId) {
    return db("comments").where("CommentID", commentId).del();
  },

  updateComment(commentId, updatedComment) {
    return db("comments").where("CommentID", commentId).update(updatedComment);
  },
};
