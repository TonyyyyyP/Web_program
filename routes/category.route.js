import express from "express";
import categoryService from "../old_folder/old_services/category.service.js";

const router = express.Router();

router.get("/", async function (req, res) {
  const categories = await categoryService.getAllCategories();
  res.render("Category/list", {
    categories,
  });
});

router.get("/add", async function (req, res) {
  res.render("Category/add");
});

router.post("/add", async function (req, res) {
  const newCategory = {
    CatName: req.body.CatName,
  };
  const result = await categoryService.addCategory(newCategory);
  console.log(result);
  res.render("Category/add");
});

router.get("/edit", async function (req, res) {
  const categoryId = parseInt(req.query.id) || 0;
  const category = await categoryService.getCategoryById(categoryId);
  if (!category) {
    return res.redirect("/admin/categories");
  }

  res.render("Category/edit", {
    category,
  });
});

router.post("/delete", async function (req, res) {
  const categoryId = parseInt(req.body.CatID);
  await categoryService.deleteCategory(categoryId);
  res.redirect("/admin/categories");
});

router.post("/update", async function (req, res) {
  const categoryId = parseInt(req.body.CatID);
  const updatedCategory = {
    CatName: req.body.CatName,
  };
  await categoryService.updateCategory(categoryId, updatedCategory);
  res.redirect("/admin/categories");
});

export default router;
