import express from "express";
import bcrypt from "bcryptjs";
import moment from "moment";
import multer from "multer";

import authController from "../Controller/authController.js"

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

import userService from "../services/user.service.js";

const router = express.Router();




router.post("/register", upload.single("image"), async function (req, res) {
  try {
    const { username, password, phoneNumber, name, dob } = req.body;
    const image = req.file ? req.file.buffer.toString("base64") : null;

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
      permission: "guest",
      deletedAt: null,
      img: image,
    };
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

router.post(
  "/premiumRegister",
  upload.single("image"),
  async function (req, res) {
    try {
      const { username, password, phoneNumber, name, dob } = req.body;
      const image = req.file ? req.file.buffer.toString("base64") : null;

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

      const premiumExpiryDate = moment()
        .add(7, "days")
        .format("YYYY-MM-DD HH:mm:ss");

      const newUser = {
        username: username,
        password: hash_password,
        name: name,
        phoneNumber: phoneNumber,
        dob: formatted_dob,
        permission: "guest",
        deletedAt: null,
        img: image,
        premium_expiry_date: premiumExpiryDate,
      };

      console.log(newUser);
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
  }
);

router.post("/login", upload.none(), async function (req, res) {
  try {
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

    const imgBase64 = user.img
      ? `data:image/png;base64,${Buffer.from(user.img).toString("base64")}`
      : null;

    req.session.auth = true;
    req.session.authUser = {
      id: user.id,
      username: user.username,
      name: user.name,
      phoneNumber: user.phoneNumber,
      dob: user.dob,
      permission: user.permission,
      img: imgBase64, 
    };

    const retUrl = req.session.retUrl || "/";
    req.session.retUrl = null;

    res.json({
      message: "Đăng nhập thành công",
      redirectUrl: retUrl,
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({
      message: "Lỗi server khi đăng nhập",
    });
  }
});


router.post(
  "/sendExtendPremiumRequest",
  upload.none(),
  async function (req, res) {
    try {
      const { userId } = req.body;
      console.log(userId)

      if (!userId) {
        return res.status(400).json({
          message: "userId is required",
        });
      }
      await premium_extension_requestService.addPremium_extension_request(
        userId
      );

      res.json({
        message: "Yêu cầu gia hạn premium đã được gửi thành công",
      });
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu gia hạn premium:", error);
      res.status(500).json({
        message: "Lỗi server khi xử lý yêu cầu",
      });
    }
  }
);




router.get("/is-available", async function (req, res) {
  const username = req.query.username;
  const ret = await userService.findByUsername(username);
  if (!ret) {
    return res.json(true);
  }
  res.json(false);
});

import { isAuth } from "../middlewares/auth.mdw.js";
import premium_extension_requestService from "../services/premium_extension_request.service.js";

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
      const premiumExpiryDate = req.body.premium_expiry_date
        ? new Date(req.body.premium_expiry_date)
        : null;
      const managedCategoryId = req.body.managed_category_id
        ? parseInt(req.body.managed_category_id, 10)
        : null;

      if (!id || !id) {
        return res.status(400).json({ message: "Dữ liệu không hợp lệ!" });
      }
  
      const updated = await userService.updateUser(
        id,
        username,
        name,
        phoneNumber,
        permission,
        premiumExpiryDate,
        managedCategoryId
      );
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

router.post("/extendPremium/:id", async function (req, res) {
  try {
    const requestId = parseInt(req.params.id, 10);
    if (!requestId) {
      return res.status(400).json({ message: "ID yêu cầu không hợp lệ!" });
    }

    const premiumRequest =
      await premium_extension_requestService.getPremium_extension_requestById(
        requestId
      );

    if (!premiumRequest) {
      return res
        .status(404)
        .json({ message: "Yêu cầu gia hạn không tồn tại!" });
    }

    const userId = premiumRequest.user_id;
    const user = await userService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại!" });
    }
    const now = new Date();
    let newExpiryDate;
    if (!user.premium_expiry_date || new Date(user.premium_expiry_date) < now) {
      newExpiryDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); 
    } else {
      newExpiryDate = new Date(
        new Date(user.premium_expiry_date).getTime() + 7 * 24 * 60 * 60 * 1000
      ); 
    }

    await userService.updateUser(userId, null, null, null, null, newExpiryDate);
    await premium_extension_requestService.deletePremium_extension_request(
      requestId
    );

    res.status(200).json({
      message: "Gia hạn premium thành công!",
      newExpiryDate,
    });
  } catch (error) {
    console.error("Lỗi khi gia hạn premium:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
});

router.get("/auth/github", authController.githubLogin);
router.get("/auth/github/callback", authController.githubCallback);




export default router;
