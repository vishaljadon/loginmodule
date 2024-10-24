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
import * as questionnaireController from "../controllers/questionnaireController.js";
import isEmpty from "../../utils/functions.js";
const questionnaireRouter = Router();
// ADD
questionnaireRouter.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var body = req.body;
    var data = yield questionnaireController.create(body, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// DELETE
questionnaireRouter.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var data = yield questionnaireController.deleteById(id, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// RETRIVE
questionnaireRouter.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var data = yield questionnaireController.getById(id, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
questionnaireRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { page: _page, count: _count } = req.query;
    try {
        if (isEmpty(_page, _count))
            return res.sendStatus(404);
        var page = parseInt(_page);
        var count = parseInt(_count);
        var data = yield questionnaireController.getAll(page, count, req.uId);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
    catch (error) {
        console.log(error);
        res.sendStatus(404);
    }
}));
// UPDATE
questionnaireRouter.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var body = req.body;
    var data = yield questionnaireController.update(id, body, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
export default questionnaireRouter;
