import express from "express";
import categoryService from "../services/category.service.js";

import multer from "multer";
const upload = multer();
const router = express.Router();

router.get("/", async function (req, res) {
  const categories = await categoryService.getAllCategories();
  res.render("Category/list", {
    categories,
  });
});

router.post("/addCategory", upload.none(), async function (req, res) {
  try {
    const { Name } = req.body;
    console.log(Name);
    await categoryService.addCategory(Name);
    res.status(201).json({ message: "Danh mục đã được thêm thành công!" });
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({ message: "Lỗi khi thêm danh mục.", error });
  }
});

router.delete("/delete/:id", async function (req, res) {
  try {
      const id = parseInt(req.params.id, 10); 
      if (!id) {
        return res.status(400).json({ message: "ID không hợp lệ!" });
      }
      await categoryService.deleteCategory(id);
      res.status(200).json({ message: "Xóa danh mục thành công!" });
    } catch (error) {
      console.error("Lỗi khi xóa tag:", error);
      res.status(500).json({ message: "Lỗi server!" });
    }
});

router.post("/update", upload.none(), async function (req, res) {
  try {
  const id = parseInt(req.body.id, 10);
  const Name = req.body.Name;

  if (!id || !id) {
    return res.status(400).json({ message: "Dữ liệu không hợp lệ!" });
  }

  const updated = await categoryService.updateCategory(id, Name);
      if (updated === 0) {
        return res
          .status(404)
          .json({ message: "Danh mục không tồn tại hoặc không được cập nhật!" });
      }
  
      res.status(200).json({ message: "Cập nhật danh mục thành công!" });
    } catch (error) {
      console.error("Lỗi khi cập nhật tag:", error);
      res.status(500).json({ message: "Lỗi server khi cập nhật danh mục." });
    }
});

router.get("/:id", async function (req, res) {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(id);
    res.json(category);
  } catch (error) {
    console.error("Lỗi khi lấy bài viết:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;
