var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import TPRModel from "../models/TPRModel.js";
import { checkRolePermissions } from "../../utils/roles.js";
import assert, { AssertionError } from "assert";
// ADD
function create(body, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { TPRA: { edit: true } }
            ]);
            assert(auth, "You are not authorized");
            var question = yield TPRModel.create(body);
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
            if (!(yield TPRModel.isAuthor(id, uId))) {
                var auth = yield checkRolePermissions(uId, [
                    { TPRA: { fullAccess: true } }
                ]);
                assert(auth, "You are not authorized");
            }
            yield TPRModel.deleteOne({ _id: id });
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
            if (!(yield TPRModel.isValidUser(id, uId))) {
                var auth = yield checkRolePermissions(uId, [
                    { TPRA: { view: true } }
                ]);
                assert(auth, "You are not authorized");
            }
            var trp = yield TPRModel.findById(id);
            return {
                status: true,
                data: trp
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
            var trps = yield TPRModel.aggregate([
                { $project: { name: 1, author: 1, TPRUsers: 1, approved: 1 } },
                { $skip: (page - 1) * count },
                { $limit: count },
            ]);
            return {
                status: true,
                data: trps
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
function setApprove(id, state, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!(yield TPRModel.isAuthor(id, uId))) {
                var auth = yield checkRolePermissions(uId, [
                    { TPRA: { fullAccess: true } },
                ]);
                assert(auth, "You are not authorized");
            }
            yield TPRModel.updateOne({ _id: id }, {
                $set: {
                    approved: state
                }
            }, { runValidators: true });
            return {
                status: true,
                msg: "Changed State of TPR"
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
function updateAns(id, qna, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield TPRModel.isTPRUser(id, uId);
            assert(auth, "You are not authorized");
            var tprForm = yield TPRModel.findById(id);
            assert(tprForm, "No TPR form found");
            var mapId = {};
            tprForm.qna.forEach((item, index) => {
                mapId[item._id] = index;
            });
            qna.forEach(userAns => {
                tprForm.qna[mapId[userAns.id]].ans = userAns.answer.toString();
            });
            yield tprForm.save();
            return {
                status: true,
                msg: "Answers updated"
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
export { create, deleteById, getById, getAll, setApprove, updateAns };
