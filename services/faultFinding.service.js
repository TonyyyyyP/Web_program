import db from "../utils/db.js";

export default {
  // Function để tìm một faultfinding bằng `where` condition
  findOne(condition) {
    return db("faultfinding").where(condition).first();
  },

  // Function để tạo một faultfinding mới
  create(faultfinding) {
    return db("faultfinding").insert(faultfinding).returning("*");
  },

  getAllFaultfindings() {
    return db("faultfinding");
  },

  getFaultfindingById(id) {
    return db("faultfinding").where("id", id).first();
  },

  addFaultfinding(faultfinding) {
    return db("faultfinding").insert(faultfinding);
  },

  deleteFaultfinding(id) {
    return db("faultfinding").where("id", id).del();
  },

  updateFaultfinding(id, updatedFaultfinding) {
    return db("faultfinding").where("id", id).update(updatedFaultfinding);
  },
};
