import express from "express";
import tagService from "../services/tag.service.js";

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

tagRouter.post("/add", async function (req, res) {
  const newTag = {
    TagName: req.body.TagName,
  };
  const result = await tagService.addTag(newTag);
  console.log(result);
  res.render("Tag/add");
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

tagRouter.post("/delete", async function (req, res) {
  const tagId = parseInt(req.body.TagID);
  await tagService.deleteTag(tagId);
  res.redirect("/admin/tags");
});

tagRouter.post("/update", async function (req, res) {
  const tagId = parseInt(req.body.TagID);
  const updatedTag = {
    TagName: req.body.TagName,
  };
  await tagService.updateTag(tagId, updatedTag);
  res.redirect("/admin/tags");
});

export default tagRouter;
