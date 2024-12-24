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
    return db("faultfindings");
    return db("faultfinding");
},

  getFaultfindingById(faultfindingId) {
    return db("faultfindings").where("FaultFindingID", faultfindingId).first();
  getFaultfindingById(id) {
    return db("faultfinding").where("id", id).first();
},

addFaultfinding(faultfinding) {
    return db("faultfindings").insert(faultfinding);
    return db("faultfinding").insert(faultfinding);
},

  deleteFaultfinding(faultfindingId) {
    return db("faultfindings").where("FaultFindingID", faultfindingId).del();
  deleteFaultfinding(id) {
    return db("faultfinding").where("id", id).del();
},

  updateFaultfinding(faultfindingId, updatedFaultfinding) {
    return db("faultfindings")
      .where("FaultFindingID", faultfindingId)
      .update(updatedFaultfinding);
  updateFaultfinding(id, updatedFaultfinding) {
    return db("faultfinding").where("id", id).update(updatedFaultfinding);
},
};
