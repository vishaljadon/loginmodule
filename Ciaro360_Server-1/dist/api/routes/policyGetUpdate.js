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
import * as policyFileController from "../controllers/policyFileController.js";
import multer from 'multer';
import path from 'path';
const policyFileRouter = Router();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'files'));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + Date.now() + ext);
    },
});
const upload = multer({ storage }).single('file');
policyFileRouter.post('/policyfileUpload', (req, res) => {
    console.log("storeage start flow");
    upload(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        if (err) {
            return res.status(500).json({ status: false, msg: err.message });
        }
        const { policyName, description } = req.body;
        const filename = (_b = (_a = req.file) === null || _a === void 0 ? void 0 : _a.filename) !== null && _b !== void 0 ? _b : '';
        const contentType = (_d = (_c = req.file) === null || _c === void 0 ? void 0 : _c.mimetype) !== null && _d !== void 0 ? _d : '';
        const filePath = (_f = (_e = req.file) === null || _e === void 0 ? void 0 : _e.path) !== null && _f !== void 0 ? _f : '';
        const uId = req.uId;
        if (!filename || !contentType || !filePath) {
            return res.status(400).json({ status: false, msg: 'Invalid file data' });
        }
        try {
            const data = yield policyFileController.uploadPolicyFile(policyName, description, filename, contentType, filePath, uId);
            return res.status(data.status ? 200 : 404).json(data);
        }
        catch (error) {
            return res.status(500).json({ status: false, msg: 'Server error' });
        }
    }));
});
;
policyFileRouter.get('/fileGet/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fileId = req.params.id;
    const data = yield policyFileController.getPolicyFile(fileId, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status 
}));
policyFileRouter.put('/fileUpdate/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fileId = req.params.id;
    const { policyName, description, content } = req.body;
    const data = yield policyFileController.updatePolicyFile(fileId, policyName, description, content, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status 
}));
export default policyFileRouter;
