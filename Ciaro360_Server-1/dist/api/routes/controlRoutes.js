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
import * as controlController from "../controllers/controlController.js";
import { mapOneControlToManyPolicies, mapOneControlToManyProcedures, mapOneControlToManyProject, mapOneControlToManyRisks } from "../../utils/mappingFuncs.js";
import { unMapOneControlToManyPolicies, unMapOneControlToManyProcedures, unMapOneControlToManyProject, unMapOneControlToManyRisks } from "../../utils/unMappingFuncs.js";
import isEmpty from "../../utils/functions.js";
const controlRoutes = Router();
// CREATE
controlRoutes.post("/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { content, name, group } = req.body;
    var data = yield controlController.saveControl(req.uId, name, group, content);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// RETRIVE
controlRoutes.get("/groups", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { page, count, search } = req.query;
    if (isEmpty(page, count)) {
        res.sendStatus(404);
    }
    else {
        var data = yield controlController.getAllGroups(page, count, search, req.uId);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
}));
controlRoutes.get("/subControls", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { nameId, groupId } = req.body;
    var data = yield controlController.getSubControls(nameId, groupId, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
controlRoutes.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { page, count, search, group } = req.query;
    if (isEmpty(page, count)) {
        res.sendStatus(404);
    }
    else {
        var data = yield controlController.getAllControlsFromGroup(page, count, search, group, req.uId);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
}));
controlRoutes.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { id } = req.params;
    var data = yield controlController.getControl(id, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// MAP
controlRoutes.post("/:id/procedures", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var procedures = req.body.procedures;
    var data = yield mapOneControlToManyProcedures(id, procedures, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
controlRoutes.post("/:id/projects", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var projects = req.body.projects;
    var data = yield mapOneControlToManyProject(id, projects, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
controlRoutes.post("/:id/policies", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var policies = req.body.policies;
    var data = yield mapOneControlToManyPolicies(id, policies, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
controlRoutes.post("/:id/risks", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var risks = req.body.risks;
    var data = yield mapOneControlToManyRisks(id, risks, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// UPDATING
controlRoutes.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var { content } = req.body;
    var data = yield controlController.updateControl(id, req.uId, content);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// DELETE
controlRoutes.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var data = yield controlController.deleteControl(id, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// unlink
controlRoutes.delete("/:id/procedures", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var procedures = req.body.procedures;
    var data = yield unMapOneControlToManyProcedures(id, procedures, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
controlRoutes.delete("/:id/projects", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var projects = req.body.projects;
    var data = yield unMapOneControlToManyProject(id, projects, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
controlRoutes.delete("/:id/policies", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var policies = req.body.policies;
    var data = yield unMapOneControlToManyPolicies(id, policies, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
controlRoutes.delete("/:id/risks", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var risks = req.body.risks;
    var data = yield unMapOneControlToManyRisks(id, risks, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
export default controlRoutes;
