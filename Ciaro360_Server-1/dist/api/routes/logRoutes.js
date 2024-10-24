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
import { logs, logs_policy } from "../controllers/logController.js";
import isEmpty from "../../utils/functions.js";
const logRoutes = Router();
// CREATE
// RETRIVE
logRoutes.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { page: _page, count: _count, sortByDate: _sortByDate } = req.query;
    try {
        if (isEmpty(_page, _count, _sortByDate))
            return res.sendStatus(404);
        var page = parseInt(_page);
        var count = parseInt(_count);
        var sortByDate = parseInt(_sortByDate);
        var data = yield logs(req.uId, page, count, sortByDate);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
    catch (error) {
        console.log(error);
        res.sendStatus(404);
    }
}));
logRoutes.get("/policy/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var data = yield logs_policy(id, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// UPDATING
// DELETE
export default logRoutes;
