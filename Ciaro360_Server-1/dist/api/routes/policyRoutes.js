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
import * as policyController from "../controllers/policyController.js";
import isEmpty from "../../utils/functions.js";
const policyRouter = Router();
import { mapOnePolicyToManyControls, mapOnePolicyToManyProcedures, mapOnePolicyToManyProject } from "../../utils/mappingFuncs.js";
import { unMapOnePolicyToManyControls, unMapOnePolicyToManyProcedures, unMapOnePolicyToManyProject } from "../../utils/unMappingFuncs.js";
import Busboy from 'busboy';
import { NodeHtmlMarkdown } from "node-html-markdown";
import mammoth from "mammoth";
// CREATE
policyRouter.post("/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { projectId, title } = req.body;
    if (isEmpty(projectId, title)) {
        res.sendStatus(404);
    }
    else {
        var data = yield policyController.createPolicy(req.uId, projectId, title);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
}));
policyRouter.post("/fromTemplate", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var { projectId, templateIds, assignees } = req.body;
        var data = yield policyController.createPolicyFromTemplate(req.uId, projectId, templateIds, assignees);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
    catch (error) {
        res.sendStatus(404);
    }
}));
policyRouter.post("/create/file", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const busboy = Busboy({ headers: req.headers });
        var fileUploaded = false;
        busboy.on('file', (_, file, metaData) => {
            if (fileUploaded)
                return;
            fileUploaded = true;
            var _data = [];
            file.on('data', (data) => {
                _data.push(data);
            });
            file.on('end', () => __awaiter(void 0, void 0, void 0, function* () {
                var data = yield mammoth.convertToHtml({ buffer: Buffer.concat(_data) });
                var md = NodeHtmlMarkdown.translate(data.value);
                res.send(md);
            }));
        });
        req.pipe(busboy);
    }
    catch (error) {
        console.log(error);
        res.json({
            status: false,
            msg: "Error"
        });
    }
}));
policyRouter.post("/create/version", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { policyId, description, assignees } = req.body;
    if (isEmpty(policyId, description, assignees)) {
        res.sendStatus(404);
    }
    else {
        var data = yield policyController.createPolicyVersion(req.uId, policyId, description, assignees);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
}));
policyRouter.post("/:id/comment", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { images, comment } = req.body;
    const data = yield policyController.savePolicyVersionComments(req.params.id, req.uId, comment, images);
    data.status ? res.json(data) : res.status(404).json(data);
}));
// MAP
policyRouter.post("/:id/procedures", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var procedures = req.body.procedures;
    var data = yield mapOnePolicyToManyProcedures(id, procedures, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
policyRouter.post("/:id/projects", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var projects = req.body.projects;
    var data = yield mapOnePolicyToManyProject(id, projects, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
policyRouter.post("/:id/controls", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var controls = req.body.controls;
    var data = yield mapOnePolicyToManyControls(id, controls, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
policyRouter.post("/:id/tags", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var tags = req.body.tags;
    try {
        var data = yield policyController.addPolicyTags(id, req.uId, tags);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
    catch (error) {
        res.sendStatus(404);
    }
}));
// RETRIVE
policyRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { page, count, field, order, search } = req.query;
    if (isEmpty(page, count)) {
        res.sendStatus(404);
    }
    else {
        var data = yield policyController.getAllPolicy(req.uId, page, count, {
            field,
            order,
        }, search);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
}));
policyRouter.get("/overview", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var data = yield policyController.overview(req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// policyRouter.get("/count",async (req,res)=>{
//     var data = await policyController.getTotalCount(req.uId)
//     data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
// })
policyRouter.get("/:id/comments", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var { page, count } = req.query;
    if (isEmpty(page, count)) {
        res.sendStatus(404);
    }
    else {
        var data = yield policyController.getPolicyVersionComments(id, page, count, req.uId);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
}));
policyRouter.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    if (isEmpty(id)) {
        res.sendStatus(404);
    }
    else {
        var data = yield policyController.getPolicy(id, req.uId);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
}));
policyRouter.get("/:policy/version/:versionId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { versionId, policy } = req.params;
    var data = yield policyController.getPolicyVersion(policy, versionId, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
policyRouter.get("/:policy/export/:versionId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { versionId, policy } = req.params;
    var data = yield policyController.exportPolicyVersion(policy, versionId, req.uId);
    if (data.status) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${data.msg}.pdf`);
        res.send(Buffer.from(data.data));
    }
    else {
        res.status(404).json(data);
    }
}));
// UPDATING
policyRouter.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    try {
        var { title, description, content, beingModified, } = req.body;
        var props = Object.fromEntries(Object.entries({
            title,
            description,
            content,
            beingModified,
        }).filter(([_, value]) => value !== undefined && value !== "" && typeof value !== "object"));
        var data = yield policyController.updatePolicyVersionDetails(id, req.uId, props);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
    catch (error) {
        res.sendStatus(404);
    }
}));
policyRouter.put("/:id/assignUser", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    try {
        var body = req.body;
        var data = yield policyController.assignUserToPolicy(id, req.uId, body);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
    catch (error) {
        res.sendStatus(404);
    }
}));
policyRouter.put("/:versionId/status/:type", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { versionId, type } = req.params;
    try {
        var data = yield policyController.changePolicyVersionStatus(versionId, req.uId, type);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
    catch (error) {
        res.sendStatus(404);
    }
}));
policyRouter.put("/:id/reminder/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var next_reminder = req.body.next_reminder;
    try {
        var data = yield policyController.updatePolicyReminder(id, req.uId, next_reminder);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
    catch (error) {
        res.sendStatus(404);
    }
}));
// DELETE
// TODO: what about deleting a policy
// policyRouter.delete("/:id", async (req, res) => {
//     var id = req.params.id;
//     var data = await policyController.deletePolicy(id, req.uId);
//     data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
// });
policyRouter.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var data = yield policyController.deletePolicy(id, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
policyRouter.delete("/:id/comment/:commentId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var commentId = req.params.commentId;
    var data = yield policyController.deletePolicyVersionComment(id, commentId, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
policyRouter.delete("/:id/tags/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var tags = req.body.tags;
    var data = yield policyController.deletePolicyTags(id, req.uId, tags);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
policyRouter.delete("/:id/version/:versionId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { id, versionId } = req.params;
    var data = yield policyController.deletePolicyVersion(id, versionId, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
policyRouter.delete("/:id/unAssignUser", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    try {
        var body = req.body;
        var data = yield policyController.unAssignUserToPolicyVersion(id, req.uId, body);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
    catch (error) {
        res.sendStatus(404);
    }
}));
// unlink
policyRouter.delete("/:id/procedures", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var procedures = req.body.procedures;
    var data = yield unMapOnePolicyToManyProcedures(id, procedures, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
policyRouter.delete("/:id/projects", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var projects = req.body.projects;
    var data = yield unMapOnePolicyToManyProject(id, projects, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
policyRouter.delete("/:id/controls", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var controls = req.body.controls;
    var data = yield unMapOnePolicyToManyControls(id, controls, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
export default policyRouter;
