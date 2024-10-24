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
import * as onboardingController from '../controllers/onboardingController.js';
import masterRecordModel from "../models/masterRecordModel.js";
import logoModel from "../models/logoModel.js";
import Busboy from 'busboy';
import { AssertionError } from "assert";
import assert from "assert";
import { checkRolePermissions } from "../../utils/roles.js";
const onboardingRoute = Router();
onboardingRoute.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var data = yield onboardingController.view(req.uId, res);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
onboardingRoute.put("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var body = req.body;
    var data = yield onboardingController.create(body, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
onboardingRoute.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var body = req.body;
    console.log(body, "jsljflsj");
    var data = yield onboardingController.update(body, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
onboardingRoute.get("/logo", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //  var auth = await checkRolePermissions(req.uId,[
        //     {admin: true}
        // ])
        // assert(auth,"Auth Failed")
        var masterData = yield masterRecordModel.findOne({});
        assert(masterData, "organization not found");
        var file = yield logoModel.findOne({});
        assert(file, "file not found");
        if (file.private) {
            var auth = yield checkRolePermissions(req.uId, [
                { admin: true }
            ]);
            assert(auth, "Auth Failed");
        }
        res.contentType(file.mime);
        res.send(file.data);
    }
    catch (error) {
        console.log(error);
        if (error instanceof AssertionError)
            return res.json({
                status: false,
                msg: error.message
            });
        res.json({
            status: false,
            msg: "No File Found"
        });
    }
}));
const MAX_FILE_SIZE = 3 * 1024 * 1024;
onboardingRoute.post("/logo", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //  var auth = await checkRolePermissions(req.uId,[
        //     {admin: true}
        // ])
        // assert(auth,"Auth Failed")
        var file = yield logoModel.findOne({});
        if (file) {
            yield logoModel.findByIdAndDelete(file.id);
        }
        const busboy = Busboy({ headers: req.headers });
        let fileUploaded = false;
        let totalBytes = 0;
        const allowedMimeTypes = ["image/jpg", "image/png", "image/jpeg"];
        busboy.on('file', (_, file, metaData) => {
            if (fileUploaded)
                return;
            fileUploaded = true;
            if (!allowedMimeTypes.includes(metaData.mimeType)) {
                file.resume();
                return res.status(400).json({
                    status: false,
                    msg: "Only image files (JPG,JPEG, PNG) are allowed."
                });
            }
            const _data = [];
            file.on('data', (data) => {
                totalBytes += data.length;
                if (totalBytes > MAX_FILE_SIZE) {
                    file.resume();
                    return res.status(400).json({
                        status: false,
                        msg: "File size exceeds the 3 MB limit."
                    });
                }
                _data.push(data);
            });
            file.on('end', () => __awaiter(void 0, void 0, void 0, function* () {
                const fileRecord = yield logoModel.create({
                    name: metaData.filename,
                    data: Buffer.concat(_data),
                    mime: metaData.mimeType,
                    private: req.query.type === "private",
                });
                const fileId = fileRecord._id;
                res.json({
                    status: true,
                    msg: fileId
                });
            }));
        });
        req.pipe(busboy);
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            status: false,
            msg: "Error"
        });
    }
}));
export default onboardingRoute;
