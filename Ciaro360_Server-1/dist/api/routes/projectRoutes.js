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
import * as projectController from "../controllers/projectController.js";
import isEmpty from "../../utils/functions.js";
import assert from "assert";
import { unMapOneProjectToManyControls, unMapOneProjectToManyPolicies, unMapOneProjectToManyProcedures, unMapOneProjectToManyRisks } from "../../utils/unMappingFuncs.js";
import { mapOneProjectToManyControls, mapOneProjectToManyPolicies, mapOneProjectToManyProcedures, mapOneProjectToManyRisks } from "../../utils/mappingFuncs.js";
const projectRouter = Router();
// CREATE
projectRouter.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { name, description } = req.body;
    var data = yield projectController.create(name, description, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
projectRouter.post("/:id/procedures", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var procedures = req.body.procedures;
    var data = yield mapOneProjectToManyProcedures(id, procedures, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
projectRouter.post("/:id/policies", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var policies = req.body.policies;
    var data = yield mapOneProjectToManyPolicies(id, policies, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
projectRouter.post("/:id/controls", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var controls = req.body.controls;
    var data = yield mapOneProjectToManyControls(id, controls, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
projectRouter.post("/:id/risks", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var risks = req.body.risks;
    var data = yield mapOneProjectToManyRisks(id, risks, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// RETRIVE
projectRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { page, count, name } = req.query;
    try {
        assert(!isEmpty(page, count));
        var _page = parseInt(page);
        var _count = parseInt(count);
        var data = yield projectController.getAll(_page, _count, name, req.uId);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
    catch (error) {
        res.status(404).json({});
    }
}));
projectRouter.get("/:id/policies", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { page, count, policyTitle } = req.query;
    var { id } = req.params;
    try {
        assert(!isEmpty(page, count));
        var _page = parseInt(page);
        var _count = parseInt(count);
        var data = yield projectController.getProjectPolicies(id, _page, _count, policyTitle, req.uId);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
    catch (error) {
        res.status(404).json({});
    }
}));
projectRouter.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { id } = req.params;
    try {
        var data = yield projectController.getProject(id, req.uId);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
    catch (error) {
        res.status(404).json({});
    }
}));
// UPDATE
projectRouter.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { id } = req.params;
    var name = req.body.name;
    var data = yield projectController.updateProject(id, name, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// DELETE
projectRouter.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { id } = req.params;
    var data = yield projectController.deleteProject(id, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// unlink
projectRouter.delete("/:id/procedures", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var procedures = req.body.procedures;
    var data = yield unMapOneProjectToManyProcedures(id, procedures, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
projectRouter.delete("/:id/policies", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var policies = req.body.policies;
    var data = yield unMapOneProjectToManyPolicies(id, policies, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
projectRouter.delete("/:id/controls", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var controls = req.body.controls;
    var data = yield unMapOneProjectToManyControls(id, controls, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
projectRouter.delete("/:id/risks", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var risks = req.body.risks;
    var data = yield unMapOneProjectToManyRisks(id, risks, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
export default projectRouter;
