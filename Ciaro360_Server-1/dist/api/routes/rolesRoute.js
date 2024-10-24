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
import * as rolesController from '../controllers/rolesController.js';
import isEmpty from "../../utils/functions.js";
const rolesRoutes = Router();
// CREATE
rolesRoutes.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var body = req.body;
    var data = yield rolesController.create(body, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// RETRIVE
rolesRoutes.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    var page = parseInt((_a = req.query.page) === null || _a === void 0 ? void 0 : _a.toString());
    var count = parseInt((_b = req.query.count) === null || _b === void 0 ? void 0 : _b.toString());
    var name = req.query.name;
    if (isEmpty(page, count)) {
        res.sendStatus(404);
    }
    else {
        var data = yield rolesController.getAllRoles(page, count, name === null || name === void 0 ? void 0 : name.toString(), req.uId);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
}));
rolesRoutes.get('/count', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var data = yield rolesController.getTotalRolesCount(req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
rolesRoutes.get('/:roleId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var roleId = req.params.roleId;
    var data = yield rolesController.getRole(roleId, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// UPDATE
rolesRoutes.put('/:roleId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var body = req.body;
    var roleId = req.params.roleId;
    if (isEmpty(body)) {
        res.sendStatus(404);
    }
    else {
        var data = yield rolesController.updateRole(roleId, body, req.uId);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
}));
// LINK
// DELETE
rolesRoutes.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var data = yield rolesController.deleteById(id, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
export default rolesRoutes;
