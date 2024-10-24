var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import policyFileModel from '../models/policyGetUpdateModel.js';
import mammoth from "mammoth";
import { checkRolePermissions } from "../../utils/roles.js";
import assert, { AssertionError } from 'assert';
function uploadPolicyFile(policyName, description, filename, contentType, filePath, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let fileContent = '';
            if (contentType === 'application/pdf') {
                // const data = await fs.readFile(filePath);
                // const pdfData = await pdfParse(data);
                // fileContent = pdfData.text;
            }
            else if (contentType === 'application/msword' ||
                contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                try {
                    const { value: docData } = yield mammoth.extractRawText({ path: filePath });
                    fileContent = docData;
                }
                catch (error) {
                    return { status: false, msg: 'Error parsing Word document' };
                }
            }
            else {
                return { status: false, msg: 'Unsupported file type' };
            }
            const fileDetail = new policyFileModel({ policyName, description, filename, contentType, content: fileContent });
            yield fileDetail.save();
            return { status: true, msg: 'File uploaded successfully' };
        }
        catch (error) {
            return { status: false, msg: 'Error saving file' };
        }
    });
}
function getPolicyFile(fileId, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var auth = yield checkRolePermissions(uId, [
            { policy: { view: true } }
        ]);
        assert(auth, "Auth Failed");
        var file = yield policyFileModel.findById(fileId);
        try {
            if (!file) {
                assert(file, "file not found");
            }
            var cleanedContent = file.content.replace(/\s+/g, ' ').trim();
            return {
                status: "success",
                file: {
                    _id: file._id,
                    policyName: file.policyName,
                    description: file.description,
                    filename: file.filename,
                    contentType: file.contentType,
                    content: cleanedContent,
                }
            };
        }
        catch (error) {
            if (error instanceof AssertionError)
                return {
                    status: false,
                    msg: error.message
                };
            return {
                status: false,
                msg: "Error"
            };
        }
    });
}
function updatePolicyFile(fileId, policyName, description, content, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var updateData = {
                policyName,
                description,
                content,
            };
            var updatedFile = yield policyFileModel.findByIdAndUpdate(fileId, updateData, { new: true });
            if (!updatedFile) {
                assert(updatedFile, "file not found");
            }
            return {
                status: "success",
                message: "File content updated successfully",
                file: {
                    _id: updatedFile._id,
                    policyName: updatedFile.policyName,
                    description: updatedFile.description,
                    filename: updatedFile.filename,
                    contentType: updatedFile.contentType,
                    content: updatedFile.content,
                }
            };
        }
        catch (error) {
            if (error instanceof AssertionError)
                return {
                    status: false,
                    msg: error.message
                };
            return {
                status: false,
                msg: "Error"
            };
        }
    });
}
export { getPolicyFile, uploadPolicyFile, updatePolicyFile };
