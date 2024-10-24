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
import * as tagsController from "../controllers/tagsController.js";
const tagsRoutes = Router();
// RETRIVE
tagsRoutes.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    var page = parseInt((_a = req.query.page) === null || _a === void 0 ? void 0 : _a.toString());
    var count = parseInt((_b = req.query.count) === null || _b === void 0 ? void 0 : _b.toString());
    var tagName = (_c = req.query.tagName) === null || _c === void 0 ? void 0 : _c.toString();
    var data = yield tagsController.getAllTags(page, count, tagName);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
tagsRoutes.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e;
    var id = req.params.id;
    var page = parseInt((_d = req.query.page) === null || _d === void 0 ? void 0 : _d.toString());
    var count = parseInt((_e = req.query.count) === null || _e === void 0 ? void 0 : _e.toString());
    var data = yield tagsController.getTagPolicies(id, page, count);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// UPDATE
tagsRoutes.put("/:id/:name", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var name = req.params.name;
    var data = yield tagsController.updateTagName(id, req.uId, name);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// DELETE
tagsRoutes.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var data = yield tagsController.deleteTag(id, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
tagsRoutes.delete("/:id/policies", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var policies = req.body.policies;
    var data = yield tagsController.rmOneTagFromManyPolicy(id, policies, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
export default tagsRoutes;
