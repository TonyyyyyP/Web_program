import db from "../utils/db.js";

export default {
  getAllTags() {
    return db("tag");
  },

  getTagById(tagId) {
    return db("tag").where("id", tagId).first();
  },

  addTag(tag) {
    return db("tag").insert(tag);
  },

  deleteTag(tagId) {
    return db("tag").where("id", tagId).del();
  },

  updateTag(tagId, updatedTag) {
    return db("tag").where("id", tagId).update(updatedTag);
  },
};
