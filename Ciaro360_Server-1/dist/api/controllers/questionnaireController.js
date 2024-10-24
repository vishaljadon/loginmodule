var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { checkRolePermissions } from "../../utils/roles.js";
import assert, { AssertionError } from "assert";
import questionnaireModel from "../models/questionnaireModel.js";
// ADD
function create(body, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { TPRA: { edit: true } }
            ]);
            assert(auth, "You are not authorized");
            var question = yield questionnaireModel.create(body);
            return {
                status: true,
                msg: question._id
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
                msg: "Can't Save the form"
            };
        }
    });
}
// DELETE
function deleteById(id, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { TPRA: { fullAccess: true } }
            ]);
            assert(auth, "You are not authorized");
            yield questionnaireModel.deleteOne({ _id: id });
            return {
                status: true,
                msg: "Deleted"
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
                msg: "Can't Delete the form"
            };
        }
    });
}
// RETRIVE
function getById(id, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { TPRA: { view: true } }
            ]);
            assert(auth, "You are not authorized");
            var question = yield questionnaireModel.findById(id);
            return {
                status: true,
                data: question
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
                msg: "No Form Found"
            };
        }
    });
}
function getAll(page, count, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { TPRA: { view: true } }
            ]);
            assert(auth, "You are not authorized");
            var question = yield questionnaireModel.aggregate([
                { $project: { __v: 0, _id: 0 } },
                { $skip: (page - 1) * count },
                { $limit: count },
            ]);
            return {
                status: true,
                data: question
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
                msg: "Empty"
            };
        }
    });
}
// UPDATE
function update(id, body, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { TPRA: { edit: true } }
            ]);
            assert(auth, "You are not authorized");
            var updated = yield questionnaireModel.updateOne({ _id: id }, body);
            assert(updated.modifiedCount > 0, "Nothing to modified");
            return {
                status: true,
                msg: "Question updated"
            };
        }
        catch (error) {
            // console.log(error.message)
            if (error instanceof AssertionError)
                return {
                    status: false,
                    msg: error.message
                };
            return {
                status: false,
                msg: "Invaild Answers"
            };
        }
    });
}
export { create, deleteById, getById, getAll, update };
