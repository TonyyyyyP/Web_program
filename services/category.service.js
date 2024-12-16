import db from "../utils/db.js";

export default {
  getAllCategories() {
    return db("category");
  },

  getCategoryById(categoryId) {
    return db("category").where("id", categoryId).first();
  },

  addCategory(category) {
    return db("category").insert(category);
  },

  deleteCategory(categoryId) {
    return db("category").where("id", categoryId).del();
  },

  updateCategory(categoryId, updatedCategory) {
    return db("category").where("id", categoryId).update(updatedCategory);
  },
};
