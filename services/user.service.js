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
  findByGitHubID(githubid) {
    return db("user").where("githubID", githubid).first()
  },
  getUserById(id) {
    return db("user").where("id", id).first();
  },

  updateUser(id, username, name, phoneNumber, permission, premiumExpiryDate, managedCategoryId) {
  const updatedFields = {};

  if (username !== null && username !== undefined) updatedFields.username = username;
  if (name !== null && name !== undefined) updatedFields.name = name;
  if (phoneNumber !== null && phoneNumber !== undefined) updatedFields.phoneNumber = phoneNumber;
  if (permission !== null && permission !== undefined) updatedFields.permission = permission;
  if (premiumExpiryDate !== null && premiumExpiryDate !== undefined)
    updatedFields.premium_expiry_date = premiumExpiryDate;
  if (managedCategoryId !== null && managedCategoryId !== undefined)
    updatedFields.managed_category_id = managedCategoryId;

  if (Object.keys(updatedFields).length === 0) {
    throw new Error("Không có trường nào để cập nhật.");
  }

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
