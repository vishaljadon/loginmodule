import express from "express";
import * as riskCommentController from "../controllers/riskCommentController.js";

const riskCommentRoutes = express.Router();

riskCommentRoutes.post("/:riskId/create", async (req, res) => {
    var {content} = req.body;
    var data = await riskCommentController.saveComment(req.params.riskId,req.uId, content);
    data.status ? res.json(data) : res.status(404).json(data);
})

riskCommentRoutes.delete("/:riskId/:id", async (req, res) => {
    var id = req.params.id;
    var data = await riskCommentController.deleteComment(req.riskId,id, req.uId);
    data.status ? res.json(data) : res.status(404).json(data);
})

riskCommentRoutes.get("/:riskId", async (req, res) => {
    var riskId = req.params.riskId;
    var data = await riskCommentController.getCommentsByRiskId(riskId);
    data.status ? res.json(data) : res.status(404).json(data);
})

export {riskCommentRoutes};