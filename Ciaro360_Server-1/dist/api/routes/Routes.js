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
import * as TPRController from "../controllers/TPRController.js";
import isEmpty from "../../utils/functions.js";
const TPRRouter = Router();
// ADD
TPRRouter.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var body = req.body;
    var data = yield TPRController.create(body, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// DELETE
TPRRouter.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var data = yield TPRController.deleteById(id, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// RETRIVE
TPRRouter.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var data = yield TPRController.getById(id, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
TPRRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { page: _page, count: _count } = req.query;
    try {
        if (isEmpty(_page, _count))
            return res.sendStatus(404);
        var page = parseInt(_page);
        var count = parseInt(_count);
        var data = yield TPRController.getAll(page, count, req.uId);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
    catch (error) {
        console.log(error);
        res.sendStatus(404);
    }
}));
// UPDATE
TPRRouter.put("/:id/ans", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var qna = req.body;
    var data = yield TPRController.updateAns(id, qna, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
TPRRouter.put("/:id/approve", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var approve = req.body.approve;
    var data = yield TPRController.setApprove(id, approve, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
export { TPRRouter };
