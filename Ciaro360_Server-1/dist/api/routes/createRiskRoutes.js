import express from "express";
import * as createRiskController from "../controllers/createRiskController.js";
import { create } from "domain";

const riskRoutes = express.Router();

riskRoutes.post("/create", async (req, res) => {
    var content = req.body
    var data = await createRiskController.saveRisk(req.uId, content);
    data.status ? res.json(data) : res.status(404).json(data);
})

riskRoutes.put("/:id", async (req, res) => {
    var id = req.params.id;
    var {content} = req.body;
    var data = await createRiskController.updateRisk(id, req.uId, content);
    data.status ? res.json(data) : res.status(404).json(data);
})

riskRoutes.delete("/:id", async (req, res) => {
    var id = req.params.id;
    var data = await createRiskController.deleteRisk(id, req.uId);
    data.status ? res.json(data) : res.status(404).json(data);
})

riskRoutes.get("/all", async (req, res) => {
    var data = await createRiskController.getAllRisks();
    data.status ? res.json(data) : res.status(404).json(data);
});

// riskRoutes
//     .route("/all")
//     .get(createRiskController.getAllPosts)
//     // .post(postController.createPost);

// riskRoutes
//     .route("/all/:id")
//     .get(createRiskController.getOnePost)
//     // .patch(postController.updatePost)
//     // .delete(postController.deletePost);

export { riskRoutes };
