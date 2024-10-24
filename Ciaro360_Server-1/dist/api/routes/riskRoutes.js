var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from "express";
import * as riskController from "../controllers/riskController.js";
import isEmpty from "../../utils/functions.js";
import { getTagRisks } from "../controllers/tagsController.js";
import { mapOneRiskToManyControls, mapOneRiskToManyProject } from "../../utils/mappingFuncs.js";
import { unMapOneRiskToManyControls, unMapOneRiskToManyProject } from "../../utils/unMappingFuncs.js";
const riskRouter = Router();
// CREATE
riskRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, content, category, likelihood, impact, project, risk } = req.body;
    const data = yield riskController.saveRisk(req.uId, {
        title, description, content, category, likelihood, impact, project, risk
    });
    data.status ? res.json(data) : res.status(404).json(data);
}));
riskRouter.post('/comment/:riskId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var riskId = req.params.riskId;
    const { content, images } = req.body;
    const data = yield riskController.saveComment(riskId, req.uId, content, images);
    data.status ? res.json(data) : res.status(404).json(data);
}));
riskRouter.post('/tags/:riskId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const riskId = req.params.riskId;
    const { tags } = req.body;
    const data = yield riskController.addRiskTag(riskId, req.uId, tags);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
riskRouter.post("/:id/version/:name", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { id, name } = req.params;
    var data = yield riskController.saveVersion(id, name, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// MAP
riskRouter.post("/:id/projects", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var projects = req.body.projects;
    var data = yield mapOneRiskToManyProject(id, projects, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
riskRouter.post("/:id/controls", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var controls = req.body.controls;
    var data = yield mapOneRiskToManyControls(id, controls, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// RETRIVE
riskRouter.get('/comment/:riskId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { riskId } = req.params;
    var { page: _page, count: _count } = req.query;
    if (isEmpty(_page, _count))
        return res.sendStatus(404);
    var page = parseInt(_page);
    var count = parseInt(_count);
    const data = yield riskController.getRiskComments(riskId, page, count, req.uId);
    data.status ? res.json(data) : res.status(404).json(data);
}));
riskRouter.get("/tags/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var { page: _page, count: _count } = req.query;
    if (isEmpty(_page, _count))
        return res.sendStatus(404);
    var page = parseInt(_page);
    var count = parseInt(_count);
    var data = yield getTagRisks(id, page, count);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
riskRouter.get("/metadata", (req, res) => {
    res.json(global.masterData.risk);
});
riskRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { page: _page, count: _count } = req.query;
    if (isEmpty(_page, _count))
        return res.sendStatus(404);
    var page = parseInt(_page);
    var count = parseInt(_count);
    const data = yield riskController.getAllRisks(page, count, req.uId);
    data.status ? res.json(data) : res.status(404).json(data);
}));
riskRouter.get('/:riskId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var riskId = req.params.riskId;
    const data = yield riskController.getRisk(riskId, req.uId);
    data.status ? res.json(data) : res.status(404).json(data);
}));
riskRouter.get("/export/:type", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var type = req.params.type;
    var data = yield riskController.exportRisks(type, req.uId);
    if (data.status && data.contentType) {
        res.setHeader('Content-Type', data.contentType);
        res.setHeader('Content-Disposition', `attachment; filename=${data.filename}`);
        res.send(data.data);
    }
    else {
        res.status(404).json(data);
    }
}));
riskRouter.get("/version/:versionId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { versionId } = req.params;
    var data = yield riskController.getVersion(versionId, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// UPDATE
riskRouter.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const content = req.body;
    const data = yield riskController.updateRisk(id, req.uId, content);
    data.status ? res.json(data) : res.status(404).json(data);
}));
riskRouter.put("/:id/assignUser", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    try {
        var body = req.body;
        var data = yield riskController.assignUserToRisk(id, req.uId, body);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
    catch (error) {
        res.sendStatus(404);
    }
}));
riskRouter.put("/:id/status/:type", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { id, type } = req.params;
    try {
        var data = yield riskController.changeRiskStatus(id, req.uId, type);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
    catch (error) {
        res.sendStatus(404);
    }
}));
// DELETE
riskRouter.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const data = yield riskController.deleteRisk(id, req.uId);
    data.status ? res.json(data) : res.status(404).json(data);
}));
riskRouter.delete("/:id/unAssignUser", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    try {
        var body = req.body;
        var data = yield riskController.unAssignUserToRisk(id, req.uId, body);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
    catch (error) {
        res.sendStatus(404);
    }
}));
riskRouter.delete('/:riskId/comments/:commentId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { riskId, commentId } = req.params;
    const data = yield riskController.deleteComment(riskId, commentId, req.uId);
    data.status ? res.json(data) : res.status(404).json(data);
}));
riskRouter.delete("/tags/:riskId/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { riskId } = req.params;
    const { tags } = req.body;
    var data = yield riskController.deleteTagsFromRisk(riskId, tags, req.uId);
    // var data = await rmOneTagFromManyRisks(riskId, tags, req.uId)
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
riskRouter.delete("/:id/projects", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var projects = req.body.projects;
    var data = yield unMapOneRiskToManyProject(id, projects, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
riskRouter.delete("/:id/controls", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var controls = req.body.controls;
    var data = yield unMapOneRiskToManyControls(id, controls, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
riskRouter.delete("/:id/version/:versionId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { id, versionId } = req.params;
    var data = yield riskController.deleteVersion(id, versionId, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
export default riskRouter;
