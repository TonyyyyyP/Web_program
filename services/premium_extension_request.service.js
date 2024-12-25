import db from "../utils/db.js";

export default {
  getAllPremium_extension_request() {
    return db("premium_extension_request")
        .join("user", "premium_extension_request.user_id", "=", "user.id")
        .select(
            "premium_extension_request.id as requestId",
            "user.id as userId",
            "user.name as userName"
        );
},

  getPremium_extension_requestById(id) {
    return db("premium_extension_request").where("id", id).first();
  },

  addPremium_extension_request(userId) {
    return db("premium_extension_request").insert({
        user_id: userId,
    });
},

  deletePremium_extension_request(id) {
    return db("premium_extension_request").where("id", id).del();
  },

  updatePremium_extension_request(id, name) {
    return db("premium_extension_request")
      .where("id", id)
      .update({ name: name });
  },
};
