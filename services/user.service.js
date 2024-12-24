import db from "../utils/db.js";

export default {
  getAllUsers() {
  return db("user").whereNull("deletedAt");
},

  add(entity) {
    return db("user").insert(entity);
  },

  findByUsername(username) {
    return db("user").where("username", username).first();
  },

  getUserById(id) {
    return db("user").where("id", id).first();
  },

  updateUser(id, username, name, phoneNumber, permission) {
    const updatedFields = {};

    if (username) updatedFields.username = username;
    if (name) updatedFields.name = name;
    if (phoneNumber) updatedFields.phoneNumber = phoneNumber;
    if (permission) updatedFields.permission = permission;

    return db("user")
      .where("id", id)
      .update(updatedFields)
      .then((count) => count)
      .catch((error) => {
        console.error("Lỗi khi cập nhật người dùng:", error);
        throw new Error("Không thể cập nhật người dùng.");
      });
  },

  deleteById(id) {
    return db("user").where("id", id).update({ deletedAt: db.fn.now() });
  },
};
