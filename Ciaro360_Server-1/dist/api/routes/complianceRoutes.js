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
import isEmpty from "../../utils/functions.js";
import * as complianceController from "../controllers/complianceController.js";
import assert from "assert";
const complianceRouter = Router();
complianceRouter.post('/createFramework', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var framework = req.body;
    assert(!(isEmpty(framework)));
    var data = yield complianceController.createFramework(framework);
    data.status ? res.json(data) : res.status(404).json(data);
}));
complianceRouter.get("/frame", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { page, count, field, order, search } = req.query;
    if (isEmpty(page, count)) {
        res.sendStatus(404);
    }
    else {
        var data = yield complianceController.getAllFrameworks(req.uId, page, count, {
            field,
            order,
        }, search);
        data.status ? res.json(data) : res.status(404).json(data);
    }
}));
complianceRouter.get('/framework/:id/controls', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var { page, count, field, order, search } = req.query;
    if (isEmpty(page, count)) {
        res.sendStatus(404);
    }
    else {
        var data = yield complianceController.getAllControls(req.uId, id, page, count, {
            field,
            order
        }, search);
        data.status ? res.json(data) : res.status(404).json(data);
    }
}));
complianceRouter.get('/framework/:id/controls/:controlId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var controlId = req.params.id;
    var data = yield complianceController.getControl(req.uId, id, controlId);
    data.status ? res.json(data) : res.status(404).json(data);
}));
// control status 
// for post
complianceRouter.post('/controlstatus/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var controlId = req.params.id;
    var { scope, justification } = req.body;
    var data = yield complianceController.createControlStaus(controlId, scope, justification);
    data.status ? res.json(data) : res.status(404).json(data);
}));
complianceRouter.put('/controls/:id/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var { scope, justification } = req.body;
    var data = yield complianceController.updateControlStatus(id, scope, justification);
    data.status ? res.json(data) : res.status(404).json(data);
}));
complianceRouter.get('/controls/controlStatus', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var data = yield complianceController.getAllControlStatus(req.uId);
    data.status ? res.json(data) : res.status(404).json(data);
}));
// get specific 
complianceRouter.get('/controls/:id/controlStatus', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var data = yield complianceController.getControlStatus(id);
    data.status ? res.json(data) : res.status(404).json(data);
}));
// update
complianceRouter.put('/:id/addProject', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var { projects } = req.body;
    var data = yield complianceController.addProjectToControlStatus(id, projects);
    data.status ? res.json(data) : res.status(404).json(data);
}));
complianceRouter.put('/controlStatus/:id/addPolicy', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var { policy } = req.body;
    var data = yield complianceController.addPolicyToControlStatus(id, policy);
    data.status ? res.json(data) : res.status(404).json(data);
}));
complianceRouter.put('/controlStatus/:id/addRisks', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var { Risks } = req.body;
    var data = yield complianceController.addRisksToControlStatus(id, Risks);
    data.status ? res.json(data) : res.status(404).json(data);
}));
complianceRouter.put('/controlStatus/:id/addEvidence', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var { evidence } = req.body;
    var data = yield complianceController.addEvidenceToControlStatus(id, evidence);
    data.status ? res.json(data) : res.status(404).json(data);
}));
// delete
complianceRouter.delete("/controlStatus/:id/Project", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var { Project } = req.body;
    var data = yield complianceController.remControlStatusProject(id, Project);
    data.status ? res.json(data) : res.status(404).json(data);
}));
complianceRouter.delete("/controlStatus/:id/Policy", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var { Policy } = req.body;
    var data = yield complianceController.remControlStatusPolicy(id, Policy);
    data.status ? res.json(data) : res.status(404).json(data);
}));
complianceRouter.delete("/controlStatus/:id/Risks", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var { Risks } = req.body;
    var data = yield complianceController.remControlStatusRisk(id, Risks);
    data.status ? res.json(data) : res.status(404).json(data);
}));
complianceRouter.delete("/controlStatus/:id/Evidence", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var { Evidence } = req.body;
    var data = yield complianceController.remControlStatusProject(id, Evidence);
    data.status ? res.json(data) : res.status(404).json(data);
}));
// evidence addPolicyToControlStatus
complianceRouter.post('/evidence', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { evidenceName, frequency, assignees } = req.body;
    var data = yield complianceController.createEvidence(req.uId, evidenceName, frequency, assignees);
    data.status ? res.json(data) : res.status(404).json(data);
}));
complianceRouter.put("/evidence/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var { files } = req.body;
    var data = yield complianceController.attachFile(req.uId, id, files);
    data.status ? res.json(data) : res.status(404).json(data);
}));
// predefined evidence
complianceRouter.post('/predefinedEvidence', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { name, description } = req.body;
    assert(!(isEmpty(name, description)));
    var data = yield complianceController.createPredefinedEvidence(name, description);
    data.status ? res.json(data) : res.status(404).json(data);
}));
complianceRouter.get("/predefinedEvidence", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { page, count, field, order, search } = req.query;
    if (isEmpty(page, count)) {
        res.sendStatus(404);
    }
    else {
        var data = yield complianceController.getAllPredefinedEvidence(req.uId, page, count, {
            field,
            order,
        }, search);
        data.status ? res.json(data) : res.status(404).json(data);
    }
}));
complianceRouter.put("/enablePreEvidence/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var evidenceId = req.params.id;
    var data = yield complianceController.enablePredefinedEvidence(evidenceId);
    data.status ? res.json(data) : res.status(404).json(data);
}));
complianceRouter.put("/disablePreEvidence/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var evidenceId = req.params.id;
    var data = yield complianceController.disablePredefinedEvidence(evidenceId);
    data.status ? res.json(data) : res.status(404).json(data);
}));
complianceRouter.get('/getPredefinedEvidence/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var data = yield complianceController.getPredefinedEvidence(id);
    data.status ? res.json(data) : res.status(404).json(data);
}));
// update 
complianceRouter.put("/:id/addAssignee", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    try {
        var { assignee } = req.body;
        var data = yield complianceController.assignUserToPredefinedEvidence(id, assignee);
        data.status ? res.json(data) : res.status(404).json(data);
    }
    catch (error) {
        res.sendStatus(404);
    }
}));
complianceRouter.put("/:id/addFiles", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var { files } = req.body;
    var data = yield complianceController.addEvidenceFile(id, files);
    data.status ? res.json(data) : res.status(404).json(data);
}));
complianceRouter.put("/:id/addControl", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var { controls } = req.body;
    var data = yield complianceController.addControl(id, controls);
    data.status ? res.json(data) : res.status(404).json(data);
}));
complianceRouter.put("/:id/addRisk", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var { risks } = req.body;
    var data = yield complianceController.addRisk(id, risks);
    data.status ? res.json(data) : res.status(404).json(data);
}));
complianceRouter.put("/:id/addURL", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    const { url } = req.body;
    var data = yield complianceController.addURL(id, url);
    data.status ? res.json(data) : res.status(404).json(data);
}));
// delete
complianceRouter.delete("/:id/Control", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var { controls } = req.body;
    var data = yield complianceController.remEvidenceControl(id, controls);
    data.status ? res.json(data) : res.status(404).json(data);
}));
complianceRouter.delete("/:id/Risk", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var { risks } = req.body;
    var data = yield complianceController.remEvidenceRisk(id, risks);
    data.status ? res.json(data) : res.status(404).json(data);
}));
complianceRouter.delete("/:id/Files", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var { files } = req.body;
    var data = yield complianceController.remEvidenceFiles(id, files);
    data.status ? res.json(data) : res.status(404).json(data);
}));
complianceRouter.delete("/:id/URL", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var { url } = req.body;
    var data = yield complianceController.remEvidenceURL(id, url);
    data.status ? res.json(data) : res.status(404).json(data);
}));
complianceRouter.delete("/:id/assignee", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var { assignee } = req.body;
    var data = yield complianceController.remEvidenceAssignee(id, assignee);
    data.status ? res.json(data) : res.status(404).json(data);
}));
export default complianceRouter;
