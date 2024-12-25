import express from "express";
import tagService from "../services/tag.service.js";
import multer from "multer";
const upload = multer();

const tagRouter = express.Router();

tagRouter.get("/", async function (req, res) {
  const tags = await tagService.getAllTags();
  res.render("Tag/list", {
    tags,
  });
});

tagRouter.get("/add", async function (req, res) {
  res.render("Tag/add");
});

tagRouter.post("/addTag", upload.none(), async function (req, res) {
  try {
    const { name } = req.body;
    console.log(name);
    await tagService.addTag(name);
    res.status(201).json({ message: "Danh mục đã được thêm thành công!" });
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({ message: "Lỗi khi thêm danh mục.", error });
  }
});

tagRouter.get("/edit", async function (req, res) {
  const tagId = parseInt(req.query.id) || 0;
  const tag = await tagService.getTagById(tagId);
  if (!tag) {
    return res.redirect("/admin/tags");
  }

  res.render("Tag/edit", {
    tag,
  });
});

tagRouter.delete("/delete/:id", async function (req, res) {
  try {
    const id = parseInt(req.params.id, 10); 
    if (!id) {
      return res.status(400).json({ message: "ID không hợp lệ!" });
    }
    await tagService.deleteTag(id);
    res.status(200).json({ message: "Xóa Tag thành công!" });
  } catch (error) {
    console.error("Lỗi khi xóa tag:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
});

tagRouter.post("/update", upload.none(), async function (req, res) {
  try {
    const id = parseInt(req.body.id, 10);
    const name = req.body.name;

    if (!id || !id) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ!" });
    }

    const updated = await tagService.updateTag(id, name);
    if (updated === 0) {
      return res
        .status(404)
        .json({ message: "Tag không tồn tại hoặc không được cập nhật!" });
    }

    res.status(200).json({ message: "Cập nhật tag thành công!" });
  } catch (error) {
    console.error("Lỗi khi cập nhật tag:", error);
    res.status(500).json({ message: "Lỗi server khi cập nhật tag." });
  }
});


tagRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const tag = await tagService.getTagById(id);

    res.json(tag);
  } catch (error) {
    console.error("Lỗi khi lấy bài viết:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default tagRouter;
