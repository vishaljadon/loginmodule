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
import * as evidencesController from "../controllers/evidencesController.js";
const evidencesRoutes = Router();
// CREATE
evidencesRoutes.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var data = yield evidencesController.createEvidence(req.body, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// RETRIVE
evidencesRoutes.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    var page = parseInt((_a = req.query.page) === null || _a === void 0 ? void 0 : _a.toString());
    var count = parseInt((_b = req.query.count) === null || _b === void 0 ? void 0 : _b.toString());
    var name = (_c = req.query.evidenceName) === null || _c === void 0 ? void 0 : _c.toString();
    var data = yield evidencesController.getAllEvidences({ page, count, name }, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
evidencesRoutes.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var evidenceId = req.params.id;
    var data = yield evidencesController.getEvidence(evidenceId, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// UPDATE
evidencesRoutes.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var evidenceId = req.params.id;
    var { name, frequency, url } = req.body;
    var data = yield evidencesController.updateBasicEvidence({ name, frequency, url, evidenceId }, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// LINK
evidencesRoutes.put("/:id/risks", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var evidenceId = req.params.id;
    var { risks } = req.body;
    var data = yield evidencesController.addOneEvidenceToManyRisk({ evidenceId, risks }, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
evidencesRoutes.put("/:id/controls", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var evidenceId = req.params.id;
    var { controls } = req.body;
    var data = yield evidencesController.addOneEvidenceToManyControls({ evidenceId, controls }, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
evidencesRoutes.put("/:id/assignee", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var evidenceId = req.params.id;
    var { assignee } = req.body;
    var data = yield evidencesController.addEvidenceAssignee({ evidenceId, assignee }, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
evidencesRoutes.put("/:id/files", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var evidenceId = req.params.id;
    var { files } = req.body;
    var data = yield evidencesController.addEvidenceFiles({ evidenceId, files }, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// DELETE
evidencesRoutes.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var data = yield evidencesController.deleteEvidence(id, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
evidencesRoutes.delete("/:id/risks", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var evidenceId = req.params.id;
    var risks = req.body.risks;
    var data = yield evidencesController.rmOneEvidenceFromManyRisks({ evidenceId, risks }, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
evidencesRoutes.delete("/:id/controls", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var evidenceId = req.params.id;
    var controls = req.body.controls;
    var data = yield evidencesController.rmOneEvidenceFromManyControls({ evidenceId, controls }, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
evidencesRoutes.delete("/:id/assignee", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var evidenceId = req.params.id;
    var assignee = req.body.assignee;
    var data = yield evidencesController.rmEvidenceAssignee({ evidenceId, assignee }, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
evidencesRoutes.delete("/:id/files", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var evidenceId = req.params.id;
    var { files } = req.body;
    var data = yield evidencesController.rmEvidenceFiles({ evidenceId, files }, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
export default evidencesRoutes;
