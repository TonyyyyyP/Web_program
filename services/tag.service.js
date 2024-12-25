import db from "../utils/db.js";

export default {
  getAllTags() {
    return db("tag");
  },

  getTagById(tagId) {
    return db("tag").where("id", tagId).first();
  },

  addTag(name) {
    return db("Tag").insert({ name: name });
  },

  deleteTag(id) {
    return db("tag").where("id", id).del();
  },

  updateTag(id, name) {
    return db("Tag").where("id", id).update({name : name});
  },
};
