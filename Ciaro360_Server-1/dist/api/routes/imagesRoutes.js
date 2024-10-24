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
                var img = yield filesModel.create({
                    data: Buffer.concat(_data),
                    mime: metaData.mimeType
                });
                res.json({
                    status: true,
                    msg: img._id
                });
            }));
        });
        req.pipe(busboy);
    }
    catch (error) {
        res.json({
            status: true,
            msg: "Error"
        });
    }
}));
// RETRIVE
filesRoutes.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    var image = yield filesModel.findById(id);
    if (image === null || image === void 0 ? void 0 : image.mime) {
        res.contentType(image.mime);
        res.send(image.data);
    }
    else {
        res.json({
            status: false,
            msg: "No Image of id " + id
        });
    }
}));
export default filesRoutes;
