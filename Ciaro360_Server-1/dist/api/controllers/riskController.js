var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import tagsModel from "../models/tagsModel.js";
import riskModel, { riskStatusEnum } from "../models/riskModel.js";
import assert, { AssertionError } from "assert";
import { checkRolePermissions, isAdmin, isRiskApprover, isRiskAssignee, isRiskReviewer } from "../../utils/roles.js";
import filesModel from "../models/filesModel.js";
import { Types } from "mongoose";
import commentsModel from "../models/commentModel.js";
import { addOneRiskToManyTags } from "./tagsController.js";
import { addLog } from "./logController.js";
import riskVersionModel from "../models/riskVersionModel.js";
function checkRiskAccessToUser(riskId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var risk = yield riskModel.findById(riskId).select({ status: 1 });
            assert(risk);
            var auth = yield isAdmin(userId);
            if (auth)
                return auth;
            // Checking risk state
            switch (risk.status) {
                case riskStatusEnum.draft:
                case riskStatusEnum.rejected:
                    auth = yield isRiskAssignee(riskId, userId);
                    break;
                case riskStatusEnum.drafted:
                    auth = yield isRiskReviewer(riskId, userId);
                    break;
                case riskStatusEnum.reviewed:
                case riskStatusEnum.approved:
                    auth = yield isRiskApprover(riskId, userId);
                    break;
                default:
                    break;
            }
            return auth;
        }
        catch (error) {
            return false;
        }
    });
}
// CREATE
function saveRisk(uId, content) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // auth
            var auth = yield checkRolePermissions(uId, [
                { risk: { edit: true } }
            ]);
            assert(auth, "Auth Failed");
            const risk = yield riskModel.create(Object.assign(Object.assign({}, content), { created_by: uId, updated_by: uId, 'assignees.author': [uId] }));
            return {
                status: true,
                msg: risk.id,
            };
        }
        catch (error) {
            if (error instanceof AssertionError)
                return {
                    status: false,
                    msg: error.message
                };
            console.log(error);
            return {
                status: false,
                msg: 'Error in saving risk',
            };
        }
    });
}
function saveComment(riskId_1, uId_1, content_1) {
    return __awaiter(this, arguments, void 0, function* (riskId, uId, content, images = []) {
        try {
            // auth
            var auth = yield checkRolePermissions(uId, [
                { risk: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            var exists = yield riskModel.exists({ _id: riskId });
            assert(exists, `No risk found with id ${riskId}`);
            const comment = yield commentsModel.create({
                content,
                images,
                created_by: uId,
            });
            assert(comment, "Error in comment");
            var update = yield riskModel.updateOne({ _id: new Types.ObjectId(riskId) }, {
                $push: {
                    comments: comment._id
                }
            });
            assert(update.modifiedCount, "Error in comment");
            return {
                status: true,
                msg: comment._id,
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
                msg: 'Error in saving comment',
            };
        }
    });
}
function addRiskTag(riskId, uId, tags) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { risk: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            var exists = yield riskModel.exists({ _id: riskId });
            assert(exists, `No risk with id: ${riskId}`);
            var allTags = yield addOneRiskToManyTags(riskId, tags, uId);
            assert(allTags, "Error! Can't add tags");
            yield riskModel.updateOne({ _id: new Types.ObjectId(riskId) }, {
                $addToSet: {
                    tags: {
                        $each: allTags
                    }
                },
                $set: {
                    updated_by: uId,
                    updated_at: Date.now()
                }
            });
            // var log = await addLog(globalWhere,id,uId,methodEnum.add,"New Tags are added to the policy")
            var log = yield addLog({
                objectType: "risk",
                objectId: riskId,
                userId: new Types.ObjectId(uId),
                action: "add",
                description: "New Tags are added to the risk"
            });
            yield riskModel.updateOne({ _id: riskId }, {
                $push: {
                    logs: log
                }
            });
            return {
                status: true,
                msg: `Added tags to risk: ${riskId}`,
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
                msg: "Can't add tags to policy",
            };
        }
    });
}
function saveVersion(id, name, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = yield riskModel.startSession();
        try {
            // TODO: when to save the version
            var auth = yield isRiskAssignee(id, uId);
            assert(auth, "Auth Failed");
            var exists = yield riskModel.exists({ _id: id });
            assert(exists, "The risk doesn't exists");
            session.startTransaction();
            var risk = yield riskModel.findById(id)
                .select("title description content reminder tags procedure");
            assert(risk, "Risk not found");
            // console.log(risk)
            const version = (yield riskVersionModel.create([risk], { session }))[0];
            assert(version, "Version not saved");
            var log = yield addLog({
                objectType: "risk",
                objectId: risk.id,
                userId: new Types.ObjectId(uId),
                action: "add",
                description: "New risk version was created"
            });
            assert(log, "Failed to update log");
            yield riskModel.updateOne({ _id: risk._id }, {
                $push: {
                    versions: version._id,
                    logs: log._id
                }
            }, { session });
            yield session.commitTransaction();
            if (!session.hasEnded)
                session.endSession();
            return {
                status: true,
                version: version.id
            };
        }
        catch (error) {
            if (session.inTransaction())
                yield session.abortTransaction();
            if (!session.hasEnded)
                session.endSession();
            if (error instanceof AssertionError)
                return {
                    status: false,
                    msg: error.message
                };
            console.log(error);
            return {
                status: false,
                msg: "Error in saving policy version"
            };
        }
    });
}
// RETRIVE
function getRiskComments(riskId, page, count, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // auth 
            var auth = yield checkRolePermissions(uId, [
                { risk: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            const commentsIds = yield riskModel.aggregate([
                { $match: { _id: new Types.ObjectId(riskId) } },
                { $project: { comments: 1 } },
                { $unwind: '$comments' },
                { $skip: (page - 1) * count },
                { $limit: count },
            ]);
            assert(commentsIds, "No Comments");
            var comment = (yield riskModel.populate(commentsIds, { path: "comments" })).map(e => e.comments[0]);
            return {
                status: true,
                comment
            };
        }
        catch (error) {
            if (error instanceof AssertionError)
                return {
                    status: false,
                    msg: error.message
                };
            console.log(error);
            return {
                status: false,
                msg: "Error"
            };
        }
    });
}
function getAllRisks(page, count, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { risk: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            const risk = yield riskModel.aggregate([
                { $project: { title: 1, description: 1, status: 1, created_by: 1, category: 1 } },
                { $skip: (page - 1) * count },
                { $limit: count },
            ]);
            return {
                status: true,
                risk
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
function getVersion(versionId, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { risk: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            var version = yield riskVersionModel.findById(versionId);
            assert(version, "No version found");
            return {
                status: true,
                version
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
function getRisk(riskId, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { risk: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            var risk = yield riskModel.findById(riskId).select({ tags: 0, comments: 0, logs: 0 }).exec();
            assert(risk, "Risk not found");
            return {
                status: true,
                risk
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
function exportRisks(type, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // auth
            var auth = yield checkRolePermissions(uId, [
                { risk: { view: true } }
            ]);
            assert(auth, "Auth failed");
            var risks = yield riskModel.find({}).select({ assignees: 0, tags: 0, comments: 0, logs: 0, policies: 0, projects: 0, controls: 0, procedures: 0 });
            var data = "title,description,status,content,created_by,created_at,updated_by,updated_at,category,likelihood,impact,risk";
            risks.forEach(risk => {
                data += `\n${risk.title},${risk.description},${risk.status},${risk.content},${risk.created_by},${risk.created_at},${risk.updated_by},${risk.updated_at},${risk.category},${risk.likelihood},${risk.impact},${risk.risk}`;
            });
            switch (type) {
                case "csv":
                    return {
                        status: true,
                        data,
                        contentType: "text/csv",
                        filename: "risks.csv"
                    };
                case "pdf":
                    // var data2 = await exportPdfFromString(data) as { [key: string]: string }
                    var data2 = { buffer: "" };
                    assert(data2, "Can't convert to pdf");
                    return {
                        status: true,
                        data: Buffer.from(data2.buffer),
                        contentType: "application/pdf",
                        filename: "risks.pdf"
                    };
                default:
                    return {
                        status: false,
                        msg: "Unsupported format"
                    };
            }
        }
        catch (error) {
            if (error instanceof AssertionError)
                return {
                    status: false,
                    msg: error.message
                };
            console.log(error);
            return {
                status: false,
                msg: "Error"
            };
        }
    });
}
// ASSIGN
function assignUserToRisk(id_1, uId_1) {
    return __awaiter(this, arguments, void 0, function* (id, uId, assignees = {
        author: [], reviewer: [], approver: []
    }) {
        try {
            var auth = yield checkRiskAccessToUser(id, uId);
            assert(auth, "Auth Failed");
            var risk = yield riskModel.exists({ _id: id });
            assert(risk, `No risk with id: ${id}`);
            yield riskModel.updateOne({ _id: id }, {
                $addToSet: {
                    'assignees.author': {
                        $each: assignees.author
                    },
                    'assignees.reviewer': {
                        $each: assignees.reviewer
                    },
                    'assignees.approver': {
                        $each: assignees.approver
                    },
                }
            });
            var log = yield addLog({
                objectType: "risk",
                objectId: risk._id,
                userId: new Types.ObjectId(uId),
                action: "add",
                description: "New risk comments was created"
            });
            yield riskModel.updateOne({ _id: id }, {
                $push: {
                    logs: log
                }
            });
            return {
                status: true,
                msg: "Added users to the risk",
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
// UPDATE
function updateRisk(riskId, uId, body) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // auth
            var auth = yield checkRolePermissions(uId, [
                { risk: { edit: true } }
            ]);
            assert(auth, "Auth Failed");
            var exists = yield riskModel.exists({ _id: riskId });
            assert(exists, "Not Found");
            yield riskModel.updateOne({ _id: new Types.ObjectId(riskId) }, body);
            return {
                status: true,
                msg: 'Risk updated successfully',
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
                msg: "Error",
            };
        }
    });
}
function changeRiskStatus(id, uId, type) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            var auth = yield isRiskAssignee(id, uId);
            assert(auth, "Auth Failed");
            var riskStatus = (_a = (yield riskModel.findById(id).select("status").exec())) === null || _a === void 0 ? void 0 : _a.status;
            switch (type) {
                case riskStatusEnum.draft:
                    assert((riskStatus == riskStatusEnum.rejected), "For changing it's state, it should be in draft or rejected state");
                    // var auth = await isRiskAssignee(id, uId)
                    break;
                case riskStatusEnum.drafted:
                    assert((riskStatus == riskStatusEnum.draft), "For changing it's state, it should be in draft or rejected state");
                    var auth = yield isRiskAssignee(id, uId);
                    break;
                case riskStatusEnum.reviewed:
                    if (global.masterData.workflow.tier3Enabled) {
                        assert(riskStatus == riskStatusEnum.drafted, "For reviewing, risk should be drafted");
                        var auth = yield isRiskReviewer(id, uId);
                    }
                    else {
                        assert(false, "Not available");
                    }
                    break;
                case riskStatusEnum.approved:
                    if (global.masterData.workflow.tier3Enabled) {
                        assert(riskStatus == riskStatusEnum.reviewed, "For approving, risk should be reviewed");
                    }
                    else {
                        assert(riskStatus == riskStatusEnum.drafted, "For approving, risk should be drafted");
                    }
                    var auth = yield isRiskApprover(id, uId);
                    break;
                case riskStatusEnum.rejected:
                    var auth = yield isRiskReviewer(id, uId);
                    break;
                default:
                    var auth = false;
                    break;
            }
            assert(auth, "Auth Failed");
            yield riskModel.updateOne({ _id: id }, {
                $set: {
                    status: type
                }
            });
            return {
                status: true,
                msg: "Risk status changed"
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
// Delete
function deleteComment(riskId, commentId, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { risk: { edit: true } }
            ]);
            assert(auth, "Auth Failed");
            const comment = yield commentsModel.findByIdAndDelete(commentId);
            assert(comment, "Comment not found");
            if (comment.images) {
                filesModel.deleteMany({ _id: comment.images });
            }
            var update = yield riskModel.updateOne({ _id: new Types.ObjectId(riskId) }, {
                $pull: {
                    comments: commentId
                }
            });
            return {
                status: true,
                msg: "Comment Deleted",
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
                msg: 'Error in deleting comment',
            };
        }
    });
}
function deleteTagsFromRisk(riskId, tags, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { risk: { edit: true } }
            ]);
            assert(auth, "Auth Failed");
            var update = yield riskModel.updateOne({ _id: new Types.ObjectId(riskId) }, {
                $pull: {
                    tags: {
                        $in: tags
                    }
                }
            });
            assert(update.modifiedCount, "No tag deleted");
            var update = yield tagsModel.updateMany({ _id: tags }, {
                $pull: {
                    risks: riskId
                }
            });
            assert(update.modifiedCount, "No tag deleted");
            return {
                status: true,
                msg: "Tags Deleted",
            };
        }
        catch (error) {
            console.log(error);
            if (error instanceof AssertionError)
                return {
                    status: false,
                    msg: error.message
                };
            return {
                status: false,
                msg: 'Error in deleting tags',
            };
        }
    });
}
function deleteRisk(riskId, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { risk: { edit: true } }
            ]);
            assert(auth, "Auth Failed");
            var risk = yield riskModel.findByIdAndUpdate(riskId, {
                $set: {
                    status: "deleted"
                }
            });
            assert(risk, "Risk not found");
            // delete comments
            if (risk.comments) {
                Promise.all(risk.comments.map((comment) => __awaiter(this, void 0, void 0, function* () {
                    yield deleteComment(riskId, comment, uId);
                })));
            }
            // delete Tags
            if (risk.tags)
                yield deleteTagsFromRisk(riskId, risk.tags, uId);
            return {
                status: true,
                msg: 'Risk deleted successfully',
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
                msg: `No risk found with id ${riskId}`,
            };
        }
    });
}
function unAssignUserToRisk(id_1, uId_1) {
    return __awaiter(this, arguments, void 0, function* (id, uId, assignees = {
        author: [], reviewer: [], approver: []
    }) {
        try {
            var auth = yield checkRiskAccessToUser(id, uId);
            assert(auth, "Auth Failed");
            var risk = yield riskModel.exists({ _id: id });
            assert(risk, `No risk with id: ${id}`);
            yield riskModel.updateOne({ _id: id }, {
                $pullAll: {
                    'assignees.author': assignees.author,
                    'assignees.reviewer': assignees.reviewer,
                    'assignees.approver': assignees.approver,
                },
                updated_by: uId,
                updated_at: Date.now()
            });
        }
        catch (error) {
            if (error instanceof AssertionError)
                return {
                    status: false,
                    msg: error.message
                };
            return {
                status: false,
                msg: "Can't remove assignees to risk",
            };
        }
        return {
            status: true,
            msg: `Removed assignees to risk:${id}`,
        };
    });
}
function deleteVersion(id, versionId, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = yield riskModel.startSession();
        try {
            // auth 
            var auth = yield checkRiskAccessToUser(id, uId);
            assert(auth, "Auth Failed");
            var version = yield riskVersionModel.exists({ _id: versionId });
            assert(version, `No risk with id: ${versionId}`);
            // TODO: Check if version id exists in risk record version 
            session.startTransaction();
            yield riskModel.updateOne({ _id: id }, {
                $pull: {
                    versions: versionId
                }
            }, { session });
            yield riskVersionModel.findByIdAndDelete({ _id: versionId }, { session });
            yield session.commitTransaction();
            if (!session.hasEnded)
                session.endSession();
            return {
                status: true,
                msg: "Risk verson is Deleted"
            };
        }
        catch (error) {
            if (session.inTransaction())
                yield session.abortTransaction();
            if (!session.hasEnded)
                session.endSession();
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
export { saveRisk, updateRisk, deleteRisk, exportRisks, getRisk, getAllRisks, saveComment, deleteComment, deleteTagsFromRisk, assignUserToRisk, unAssignUserToRisk, changeRiskStatus, addRiskTag, getRiskComments, saveVersion, getVersion, deleteVersion };
