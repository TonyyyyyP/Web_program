import express from "express";
import bcrypt from "bcryptjs";
import moment from "moment";
import multer from "multer";
const upload = multer();

import userService from "../services/user.service.js";

const router = express.Router();

router.get("/register", function (req, res) {
  res.render("vwAccount/register");
});

router.post("/register", upload.none(), async function (req, res) {
  try {
    const { username, password, phoneNumber, name, dob } = req.body;

    if (
      !username?.trim() ||
      !password?.trim() ||
      !phoneNumber?.trim() ||
      !name?.trim() ||
      !dob?.trim()
    ) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ!" });
    }
    const hash_password = bcrypt.hashSync(password, 8);
    const formatted_dob = moment(dob, "YYYY-MM-DD", true).isValid()
      ? moment(dob).format("YYYY-MM-DD")
      : null;

    if (!formatted_dob) {
      return res.status(400).json({ message: "Ngày sinh không hợp lệ!" });
    }

    const newUser = {
      username: username,
      password: hash_password,
      name: name,
      phoneNumber: phoneNumber,
      dob: formatted_dob,
      permission: "user",
      deletedAt: null,
    };
    console.log(newUser)
    const result = await userService.add(newUser);

    if (result) {
      res.status(201).json({ message: "Đăng ký thành công!" });
    } else {
      res.status(500).json({ message: "Không thể tạo người dùng!" });
    }
  } catch (error) {
    console.error("Lỗi khi đăng ký người dùng:", error);
    res.status(500).json({ message: "Lỗi server khi đăng ký người dùng." });
  }
});

router.get("/login", function (req, res) {
  res.render("vwAccount/login");
});

router.post("/login", upload.none(), async function (req, res) {
  const user = await userService.findByUsername(req.body.username);
  if (!user) {
    return res.status(400).json({
      message: "Không tìm thấy tên đăng nhập",
    });
  }
  if (!bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(400).json({
      message: "Mật khẩu sai",
    });
  }

  req.session.auth = true;
  req.session.authUser = user;

  const retUrl = req.session.retUrl || "/";
  req.session.retUrl = null;
  res.json({
    message: "Đăng nhập thành công",
    redirectUrl: retUrl,
  });
});


router.get("/is-available", async function (req, res) {
  const username = req.query.username;
  const ret = await userService.findByUsername(username);
  if (!ret) {
    return res.json(true);
  }
  res.json(false);
});

import { isAuth } from "../middlewares/auth.mdw.js";

router.get("/profile", isAuth, function (req, res) {
  res.render("vwAccount/profile", {
    user: req.session.authUser,
  });
});

router.get("/update-password", isAuth, function (req, res) {
  res.render("vwAccount/update-password", {
    user: req.session.authUser,
  });
});

router.post("/logout", function (req, res) {
  req.session.auth = false;
  req.session.authUser = null;
  req.session.retUrl = null;
  res.redirect("/");
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    res.json(user);
  } catch (error) {
    console.error("Lỗi khi lấy người dùng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

router.post("/update", upload.none(), async function (req, res) {
  try {
      const id = parseInt(req.body.id, 10);
      const username = req.body.username;
      const name = req.body.name;
      const phoneNumber = req.body.phoneNumber;
      const permission = req.body.permission;
  
      if (!id || !id) {
        return res.status(400).json({ message: "Dữ liệu không hợp lệ!" });
      }
  
      const updated = await userService.updateUser(id, username, name, phoneNumber, permission);
      if (updated === 0) {
        return res
          .status(404)
          .json({ message: "Người dùng không tồn tại hoặc không được cập nhật!" });
      }
  
      res.status(200).json({ message: "Cập nhật người dùng thành công!" });
    } catch (error) {
      console.error("Lỗi khi cập nhật tag:", error);
      res.status(500).json({ message: "Lỗi server khi cập nhật tag." });
    }
});

router.delete("/delete/:id", async function (req, res) {
  try {
      const id = parseInt(req.params.id, 10); 
      if (!id) {
        return res.status(400).json({ message: "ID không hợp lệ!" });
      }
      await userService.deleteById(id);
      res.status(200).json({ message: "Xóa người dùng thành công!" });
    } catch (error) {
      console.error("Lỗi khi xóa tag:", error);
      res.status(500).json({ message: "Lỗi server!" });
    }
});

export default router;
