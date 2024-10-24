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
import * as scopesController from "../controllers/scopesController.js";
const scopesRoutes = Router();
// CREATE
scopesRoutes.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { name, description } = req.body;
    var data = yield scopesController.createScope(name, description, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// RETRIVE
scopesRoutes.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    var page = parseInt((_a = req.query.page) === null || _a === void 0 ? void 0 : _a.toString());
    var count = parseInt((_b = req.query.count) === null || _b === void 0 ? void 0 : _b.toString());
    var scopeName = (_c = req.query.scopeName) === null || _c === void 0 ? void 0 : _c.toString();
    var data = yield scopesController.getAllScopes(page, count, scopeName);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// UPDATE
scopesRoutes.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var scopeId = req.params.id;
    var { name, description } = req.body;
    var data = yield scopesController.updateScope(scopeId, name, description, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// LINK
scopesRoutes.post("/:id/projects", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var scopeId = req.params.id;
    var { projects } = req.body;
    var data = yield scopesController.addOneScopeToManyProjects(scopeId, projects, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// DELETE
scopesRoutes.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var data = yield scopesController.deleteScope(id, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
scopesRoutes.delete("/:id/projects", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var projects = req.body.projects;
    var data = yield scopesController.rmOneScopeFromManyProjects(id, projects, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
export default scopesRoutes;
