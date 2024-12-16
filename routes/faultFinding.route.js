import express from "express";
import faultfindingService from "../old_folder/old_services/category.service.js";

const router = express.Router();

router.get("/faultfindings", async function (req, res) {
  const faultfindings = await faultfindingService.getAllFaultfindings();
  res.render("Faultfinding/list", { faultfindings });
});

router.post("/faultfindings/add", async function (req, res) {
  const newFaultfinding = {
    description: req.body.description,
    accepted: req.body.accepted,
    user_id: req.body.user_id,
    article_id: req.body.article_id,
  };
  await faultfindingService.addFaultfinding(newFaultfinding);
  res.redirect("/faultfindings");
});

router.post("/faultfindings/delete", async function (req, res) {
  const id = parseInt(req.body.id, 10);
  await faultfindingService.deleteFaultfinding(id);
  res.redirect("/faultfindings");
});

router.post("/faultfindings/update", async function (req, res) {
  const id = parseInt(req.body.id, 10);
  const updatedFaultfinding = {
    description: req.body.description,
    accepted: req.body.accepted,
  };
  await faultfindingService.updateFaultfinding(id, updatedFaultfinding);
  res.redirect("/faultfindings");
});

export default router;
