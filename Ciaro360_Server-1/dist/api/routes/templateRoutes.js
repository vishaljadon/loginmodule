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
import { getAllTemplates } from "../controllers/templatesController.js";
const templateRoutes = Router();
templateRoutes.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    var page = parseInt((_a = req.query.page) === null || _a === void 0 ? void 0 : _a.toString());
    var count = parseInt((_b = req.query.count) === null || _b === void 0 ? void 0 : _b.toString());
    var data = yield getAllTemplates(page, count);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
export default templateRoutes;
