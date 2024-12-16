import db from "../utils/db.js";

export default {
  getAllFaultfindings() {
    return db("faultfindings");
  },

  getFaultfindingById(faultfindingId) {
    return db("faultfindings").where("FaultFindingID", faultfindingId).first();
  },

  addFaultfinding(faultfinding) {
    return db("faultfindings").insert(faultfinding);
  },

  deleteFaultfinding(faultfindingId) {
    return db("faultfindings").where("FaultFindingID", faultfindingId).del();
  },

  updateFaultfinding(faultfindingId, updatedFaultfinding) {
    return db("faultfindings")
      .where("FaultFindingID", faultfindingId)
      .update(updatedFaultfinding);
  },
};
