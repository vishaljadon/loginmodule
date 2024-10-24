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
import filesModel from "../models/filesModel.js";
import Busboy from 'busboy';
import assert, { AssertionError } from "assert";
import { checkRolePermissions } from "../../utils/roles.js";
const filesRoutes = Router();
// CREATE
filesRoutes.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const busboy = Busboy({ headers: req.headers });
        var fileUploaded = false;
        busboy.on('file', (_, file, metaData) => {
            if (fileUploaded)
                return;
            fileUploaded = true;
            var _data = [];
            file.on('data', (data) => {
                _data.push(data);
            });
            file.on('end', () => __awaiter(void 0, void 0, void 0, function* () {
                var file = yield filesModel.create({
                    name: metaData.filename,
                    data: Buffer.concat(_data),
                    mime: metaData.mimeType,
                    private: req.query.type == "private" ? true : false
                });
                res.json({
                    status: true,
                    msg: file._id
                });
            }));
        });
        req.pipe(busboy);
    }
    catch (error) {
        res.json({
            status: false,
            msg: "Error"
        });
    }
}));
// RETRIVE
filesRoutes.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var id = req.params.id;
        var file = yield filesModel.findById(id);
        assert(file);
        if (file.private) {
            // do auth
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
export default filesRoutes;
