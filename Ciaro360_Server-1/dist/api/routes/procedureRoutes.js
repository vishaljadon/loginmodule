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
import * as procedureController from "../controllers/procedureController.js";
import isEmpty from "../../utils/functions.js";
const procedureRouter = Router();
import { unMapOneProcedureToManyControls, unMapOneProcedureToManyPolicies, unMapOneProcedureToManyProject } from "../../utils/unMappingFuncs.js";
import { mapOneProcedureToManyControls, mapOneProcedureToManyPolicies, mapOneProcedureToManyProject } from "../../utils/mappingFuncs.js";
// CREATE
procedureRouter.post("/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { title, description, content, tags, policies, projectId } = req.body;
    if (isEmpty(title, description, content, tags, policies, projectId)) {
        res.sendStatus(404);
    }
    else {
        var data = yield procedureController.saveProcedure(req.uId, title, description, content, tags, policies, projectId);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
}));
procedureRouter.post("/:id/comment", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { images, comment } = req.body;
    const data = yield procedureController.saveProcedureComments(req.params.id, req.uId, comment, images);
    data.status ? res.json(data) : res.status(404).json(data);
}));
procedureRouter.post("/:id/version/:name", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { id, name } = req.params;
    var data = yield procedureController.saveVersion(id, name, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
procedureRouter.post("/:id/reminder", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var { next_reminder } = req.body;
    var data = yield procedureController.setReminder(id, req.uId, next_reminder);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
procedureRouter.post("/:id/tags", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var tags = req.body.tags;
    try {
        var data = yield procedureController.addProcedureTags(id, req.uId, tags);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
    catch (error) {
        res.sendStatus(404);
    }
}));
// MAP
procedureRouter.post("/:id/policies", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var procedures = req.body.procedures;
    var data = yield mapOneProcedureToManyPolicies(id, procedures, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
procedureRouter.post("/:id/projects", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var projects = req.body.projects;
    var data = yield mapOneProcedureToManyProject(id, projects, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
procedureRouter.post("/:id/controls", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var controls = req.body.controls;
    var data = yield mapOneProcedureToManyControls(id, controls, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// RETRIVE
procedureRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { page, count, field, order } = req.query;
    if (isEmpty(page, count, field, order)) {
        res.sendStatus(404);
    }
    else {
        var data = yield procedureController.getAllProcedure(req.uId, page, count, {
            field,
            order,
        });
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
}));
procedureRouter.get("/count", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var data = yield procedureController.getTotalCount(req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
procedureRouter.get("/:id/comments", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var { page, count } = req.query;
    if (isEmpty(page, count)) {
        res.sendStatus(404);
    }
    else {
        var data = yield procedureController.getProcedureComments(id, page, count, req.uId);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
}));
procedureRouter.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    if (isEmpty(id)) {
        res.sendStatus(404);
    }
    else {
        var data = yield procedureController.getProcedure(id, req.uId);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
}));
procedureRouter.get("/version/:versionId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { versionId } = req.params;
    var data = yield procedureController.getVersion(versionId, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
procedureRouter.get("/export/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var data = yield procedureController.exportProcedure(id, req.uId);
    if (data.status) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${data.msg}.pdf`);
        res.send(Buffer.from(data.data.buffer));
    }
    else {
        res.status(404).json(data);
    }
}));
// UPDATING
procedureRouter.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    try {
        var { title, description, content, beingModified, } = req.body;
        var props = Object.fromEntries(Object.entries({
            title,
            description,
            content,
            beingModified,
        }).filter(([_, value]) => value !== undefined && value !== "" && typeof value !== "object"));
        var data = yield procedureController.updateProcedureDetails(id, req.uId, props);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
    catch (error) {
        res.sendStatus(404);
    }
}));
procedureRouter.put("/:id/assignUser", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    try {
        var body = req.body;
        var data = yield procedureController.assignUserToProcedure(id, req.uId, body);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
    catch (error) {
        res.sendStatus(404);
    }
}));
procedureRouter.put("/:id/status/:type", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { id, type } = req.params;
    try {
        var data = yield procedureController.changeProcedureStatus(id, req.uId, type);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
    catch (error) {
        res.sendStatus(404);
    }
}));
procedureRouter.put("/:id/reminder/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var next_reminder = req.body.next_reminder;
    try {
        var data = yield procedureController.updateProcedureReminder(id, req.uId, next_reminder);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
    catch (error) {
        res.sendStatus(404);
    }
}));
// DELETE
procedureRouter.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var data = yield procedureController.deleteProcedure(id, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
procedureRouter.delete("/:id/comment/:commentId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var commentId = req.params.commentId;
    var data = yield procedureController.deleteProcedureComment(id, commentId, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
procedureRouter.delete("/:id/tags/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var tags = req.body.tags;
    var data = yield procedureController.deleteProcedureTags(id, req.uId, tags);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
procedureRouter.delete("/:id/version/:versionId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { id, versionId } = req.params;
    var data = yield procedureController.deleteVersion(id, versionId, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
procedureRouter.delete("/:id/unAssignUser", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    try {
        var body = req.body;
        var data = yield procedureController.unAssignUserToProcedure(id, req.uId, body);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
    catch (error) {
        res.sendStatus(404);
    }
}));
// unlink
procedureRouter.delete("/:id/policies", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var policies = req.body.policies;
    var data = yield unMapOneProcedureToManyPolicies(id, policies, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
procedureRouter.delete("/:id/projects", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var projects = req.body.projects;
    var data = yield unMapOneProcedureToManyProject(id, projects, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
procedureRouter.delete("/:id/controls", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var controls = req.body.controls;
    var data = yield unMapOneProcedureToManyControls(id, controls, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
export default procedureRouter;
