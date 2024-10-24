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
import * as riskTagsController from "../controllers/riskTagsController.js";

const riskTagsRoutes = Router();

// CREATE
riskTagsRoutes.post("/:name", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var name = req.params.name;
    var data = yield riskTagsController.createTag(req.uId, name);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// tagsRoutes.post("/tag/:id",async (req,res)=>{
//     var id = req.params.id
//     var policies = req.body.policies
//     var data = await tagsController.addOnePolicyToManyTags(id,policies)
//     data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
// })
// RETRIVE
riskTagsRoutes.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    var page = parseInt((_a = req.query.page) === null || _a === void 0 ? void 0 : _a.toString());
    var count = parseInt((_b = req.query.count) === null || _b === void 0 ? void 0 : _b.toString());
    var data = yield riskTagsController.getAllTags(page, count);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
riskTagsRoutes.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    var id = req.params.id;
    var page = parseInt((_c = req.query.page) === null || _c === void 0 ? void 0 : _c.toString());
    var count = parseInt((_d = req.query.count) === null || _d === void 0 ? void 0 : _d.toString());
    var data = yield riskTagsController.getTagPolicies(id, page, count);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// UPDATE
riskTagsRoutes.put("/:id/:name", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var name = req.params.name;
    var data = yield riskTagsController.updateTagName(id, req.uId, name);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// DELETE
riskTagsRoutes.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var data = yield riskTagsController.deleteTag(id, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
riskTagsRoutes.delete("/:id/policies", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var policies = req.body.policies;
    var data = yield riskTagsController.rmOneTagFromManyPolicy(id, policies, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
export {riskTagsRoutes}
