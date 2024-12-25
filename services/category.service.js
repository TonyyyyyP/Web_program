import db from "../utils/db.js";

export default {
  getAllCategories() {
    return db("category");
  },

  getCategoryById(id) {
    return db("category").where("id", id).first();
  },

  addCategory(Name) {
    return db("category").insert({ Name: Name });
  },

  deleteCategory(id) {
    return db("category").where("id", id).del();
  },

  updateCategory(id, Name) {
    return db("category").where("id", id).update({Name : Name});
  },
};
