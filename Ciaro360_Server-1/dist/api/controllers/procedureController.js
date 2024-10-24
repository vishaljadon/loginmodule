var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import commentsModel from "../models/commentModel.js";
import procedureModel, { procedureStatusEnum } from "../models/procedureModel.js";
import imagesModel from "../models/filesModel.js";
import procedureVersionModel from "../models/policyVersionModel.js";
import { addOneProcedureToManyTags, rmOneProcedureFromManyTags } from "./tagsController.js";
import { Types } from "mongoose";
import { addLog } from "./logController.js";
import { AssertionError } from "assert";
import { checkRolePermissions, isAdmin, isProcedureApprover, isProcedureAssignee, isProcedureReviewer } from "../../utils/roles.js";
import assert from "assert";
import { pdfExport } from "../../utils/pdfExport.js";
import { getDateAfterDays } from "../../utils/functions.js";
import userModel from "../models/userModel.js";
function checkProcedureAccessToUser(procedureId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        var procedureStatus = (_a = (yield procedureModel.findById(procedureId).select("status").exec())) === null || _a === void 0 ? void 0 : _a.status;
        if (!procedureStatus)
            return false;
        // Checking procedure state
        var auth = false;
        switch (procedureStatus) {
            case procedureStatusEnum.draft:
            case procedureStatusEnum.rejected:
                auth = yield isProcedureAssignee(procedureId, userId);
                break;
            case procedureStatusEnum.drafted:
                auth = yield isProcedureReviewer(procedureId, userId);
                break;
            case procedureStatusEnum.reviewed:
            case procedureStatusEnum.approved:
                auth = yield isProcedureApprover(procedureId, userId);
                break;
            default:
                break;
        }
        return auth;
    });
}
// const OBJECT_TYPE = objectEnum.procedure
// CREATE
function saveProcedure(uId, title, description, content, tags, policies, projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { procedure: { edit: true } }
            ]);
            assert(auth, "Auth Failed");
            // Get frequency from global state
            var reminder = null;
            switch (global.masterData.reviewFrequency) {
                case "Monthly":
                    reminder = getDateAfterDays(1);
                    break;
                case "Quarterly":
                    reminder = getDateAfterDays(7);
                    break;
                case "Biannually":
                    reminder = getDateAfterDays(30);
                    break;
                case "Annually":
                    reminder = getDateAfterDays(365);
                    break;
                default:
                    break;
            }
            assert(reminder, "Frequency is not defined");
            var procedure = yield procedureModel.create({
                project: projectId,
                created_by: uId,
                updated_by: uId,
                title,
                description,
                content,
                reminder,
                'assignees.author': [uId],
                policies,
            });
            if (tags) {
                var allTags = yield addOneProcedureToManyTags(procedure._id.toString(), tags, uId);
                if (allTags.length) {
                    yield procedureModel.updateOne({ _id: procedure._id }, {
                        $addToSet: {
                            tags: { $each: allTags }
                        }
                    });
                }
            }
        }
        catch (error) {
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message
                };
            }
            // console.log(error)
            if (error.name === "MongoServerError" && error.code === 11000)
                return {
                    status: false,
                    msg: "Title is dublicate",
                };
            return {
                status: false,
                msg: "Error creating procedure",
            };
        }
        // var log = await addLog({
        //     objectType: "procedure",
        //     objectId: procedure.id,
        //     userId: uId,
        //     action: "add",
        //     description: "New procedure was created"
        // })
        // if (!log) return {
        //     status: false,
        //     msg: "Error Can't add logs"
        // }
        // procedure.logs.push(log)
        yield procedure.save();
        return {
            status: true,
            msg: procedure.id,
        };
    });
}
function saveVersion(id, name, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = yield procedureModel.startSession();
        try {
            // TODO: when to save the version
            var auth = yield isProcedureAssignee(id, uId);
            assert(auth, "Auth Failed");
            var exists = yield procedureModel.exists({ _id: id });
            assert(exists, "The procedure doesn't exists");
            session.startTransaction();
            var procedure = yield procedureModel.findById(id)
                .select("title description content reminder tags procedure");
            assert(procedure, "procedure not found");
            // console.log(procedure)
            const version = (yield procedureVersionModel.create([{
                    name,
                    title: procedure.title,
                    description: procedure.description,
                    created_by: uId,
                    reminder: procedure.reminder,
                    tags: procedure.tags,
                    policies: procedure.policies
                }], { session }))[0];
            assert(version, "Version not saved");
            // var log = await addLog({
            //     objectType: "procedure",
            //     objectId: procedure!.id,
            //     userId: new Types.ObjectId(uId),
            //     action: "add",
            //     description: "New procedure version was created"
            // })
            // assert(log, "Failed to update log")
            yield procedureModel.updateOne({ _id: procedure._id }, {
                $push: {
                    versions: version._id,
                    // logs: log._id
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
                msg: "Error in saving procedure version"
            };
        }
    });
}
function saveProcedureComments(id, uId, content, images) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = yield procedureModel.startSession();
        try {
            session.startTransaction();
            var auth = yield checkRolePermissions(uId, [
                { procedure: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            const procedure = yield procedureModel.exists({ _id: id });
            assert(procedure, `No procedure with id: ${id}`);
            const comment = (yield commentsModel.create([{
                    content,
                    created_by: uId,
                    images
                }], { session }))[0];
            // var log = await addLog({
            //     objectType: "procedure",
            //     objectId: procedure._id,
            //     userId: new Types.ObjectId(uId),
            //     action: "add",
            //     description: "New procedure comments was created"
            // })
            // assert(log, "Can't save logs")
            const result = yield procedureModel.updateOne({ _id: id }, { $push: {
                    comments: comment._id,
                    // logs: log!._id
                } }, { session });
            assert(result.modifiedCount, `Failed to add comment to procedure with id: ${id}`);
            yield session.commitTransaction();
            if (!session.hasEnded)
                session.endSession();
            return {
                status: true,
                msg: comment._id
            };
        }
        catch (error) {
            // console.log(error)
            yield session.abortTransaction();
            if (!session.hasEnded)
                session.endSession();
            if (error instanceof AssertionError)
                return {
                    status: true,
                    msg: error.message
                };
            return {
                status: false,
                msg: `Can't create the comment`,
            };
        }
    });
}
// RETRIVE
// TODO: sort is not used
function getAllProcedure(uId, _page, _count, sort) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { procedure: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            var page = parseInt(_page);
            var count = parseInt(_count);
            const procedures = yield procedureModel.aggregate([
                { $project: { title: 1, description: 1, created_by: 1, updated_at: 1, status: 1, beingModified: 1 } },
                { $skip: (page - 1) * count },
                { $limit: count },
            ]);
            return {
                status: true,
                procedures
            };
        }
        catch (error) {
            if (error instanceof AssertionError)
                return {
                    status: true,
                    msg: error.message
                };
            return {
                status: false,
                msg: "Error"
            };
        }
    });
}
function getProcedureComments(id, _page, _count, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { procedure: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            var page = parseInt(_page);
            var count = parseInt(_count);
            const commentsIds = yield procedureModel.aggregate([
                { $match: { _id: new Types.ObjectId(id) } },
                { $project: { comments: 1 } },
                { $unwind: '$comments' },
                { $skip: (page - 1) * count },
                { $limit: count },
            ]);
            assert(commentsIds, "No Comments");
            var comments = (yield procedureModel.populate(commentsIds, { path: "comments" })).map(e => e.comments[0]);
            return {
                status: true,
                comment: comments
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
function getProcedure(id, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            var auth = yield checkRolePermissions(uId, [
                { procedure: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            var procedure = yield procedureModel.findById(id).select({ comments: 0, logs: 0 }).exec();
            assert(procedure, `No procedure with id: ${id}`);
            // CHECK if author, reviwer and approver exists or not
            var _change = false;
            if ((_a = procedure.assignees) === null || _a === void 0 ? void 0 : _a.author) {
                yield Promise.all(procedure.assignees.author.map((userId, _index) => __awaiter(this, void 0, void 0, function* () {
                    var exists = yield userModel.exists({ _id: userId });
                    if (!exists) {
                        _change = true;
                        delete procedure.assignees.author[_index];
                    }
                })));
                procedure.assignees.author = procedure.assignees.author.filter((value) => value !== undefined);
            }
            if ((_b = procedure.assignees) === null || _b === void 0 ? void 0 : _b.reviewer) {
                yield Promise.all(procedure.assignees.reviewer.map((userId, _index) => __awaiter(this, void 0, void 0, function* () {
                    var exists = yield userModel.exists({ _id: userId });
                    if (!exists) {
                        _change = true;
                        delete procedure.assignees.reviewer[_index];
                    }
                })));
                procedure.assignees.reviewer = procedure.assignees.reviewer.filter((value) => value !== undefined);
            }
            if ((_c = procedure.assignees) === null || _c === void 0 ? void 0 : _c.approver) {
                yield Promise.all(procedure.assignees.approver.map((userId, _index) => __awaiter(this, void 0, void 0, function* () {
                    var exists = yield userModel.exists({ _id: userId });
                    if (!exists) {
                        _change = true;
                        delete procedure.assignees.approver[_index];
                    }
                })));
                procedure.assignees.approver = procedure.assignees.approver.filter((value) => value !== undefined);
            }
            if (_change)
                yield procedure.save();
            yield procedure.populate("tags");
            return {
                status: true,
                procedure,
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
                { procedure: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            var version = yield procedureVersionModel.findById(versionId);
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
function getTotalCount(uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { procedure: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            var count = yield procedureModel.countDocuments();
            return {
                status: true,
                count
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
// ASSIGNMENT
function assignUserToProcedure(id_1, uId_1) {
    return __awaiter(this, arguments, void 0, function* (id, uId, assignees = {
        author: [], reviewer: [], approver: []
    }) {
        try {
            var auth = yield checkProcedureAccessToUser(id, uId);
            assert(auth, "Auth Failed");
            var procedure = yield procedureModel.exists({ _id: id });
            assert(procedure, `No procedure with id: ${id}`);
            yield procedureModel.updateOne({ _id: id }, {
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
                objectType: "procedure",
                objectId: procedure._id,
                userId: new Types.ObjectId(uId),
                action: "add",
                description: "New procedure comments was created"
            });
            yield procedureModel.updateOne({ _id: id }, {
                $push: {
                    logs: log
                }
            });
            return {
                status: true,
                msg: "Added users to the procedure",
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
function addProcedureTags(id, uId, tags) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = yield procedureModel.startSession();
        session.startTransaction();
        try {
            var auth = yield checkProcedureAccessToUser(id, uId);
            assert(auth, "Auth Failed");
            var procedure = yield procedureModel.exists({ _id: id });
            assert(procedure, `No procedure with id: ${id}`);
            // console.log(tags)
            var allTags = yield addOneProcedureToManyTags(id, tags, uId, session);
            // console.log(allTags)
            assert(allTags.length, "Error! Can't add tags");
            yield procedureModel.updateOne({ _id: id }, {
                $addToSet: {
                    tags: {
                        $each: allTags
                    }
                },
                $set: {
                    updated_by: uId,
                    updated_at: Date.now()
                }
            }, { session });
            // var log = await addLog({
            //     objectType: "procedure",
            //     objectId: procedure._id,
            //     userId: new Types.ObjectId(uId),
            //     action: "add",
            //     description: "New Tags are added to the procedure"
            // })
            // await procedureModel.updateOne(
            //     { _id: id },
            //     {
            //         $push: {
            //             logs: log
            //         }
            //     },
            //     { session }
            // )
            yield session.commitTransaction();
            return {
                status: true,
                msg: `Added tags to procedure: ${id}`,
            };
        }
        catch (error) {
            yield session.abortTransaction();
            if (error instanceof AssertionError)
                return {
                    status: false,
                    msg: error.message
                };
            console.log(error);
            return {
                status: false,
                msg: "Can't add tags to procedure",
            };
        }
        finally {
            if (!session.hasEnded)
                yield session.endSession();
        }
    });
}
function setReminder(id, uId, next_reminder) {
    return __awaiter(this, void 0, void 0, function* () {
        // check if procedure exists
        try {
            var procedure = yield procedureModel.exists({ _id: id });
            if (!procedure)
                return {
                    status: false,
                    msg: `No procedure with id: ${id}`,
                };
            var auth = yield isProcedureAssignee(id, uId);
            assert(auth, "Auth Failed");
            yield procedureModel.updateOne({ _id: id }, {
                $set: {
                    reminder: next_reminder,
                    updated_at: Date.now(),
                    updated_by: uId
                }
            });
            return {
                status: true,
                msg: `Reminder added to procedure with id: ${id}`,
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
                msg: `Unable to set reminder to procedure with id: ${id}`,
            };
        }
    });
}
// UPDATE
function updateProcedureDetails(id, uId, props) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkProcedureAccessToUser(id, uId);
            assert(auth, "Auth Failed");
            var updated_procedure = yield procedureModel.updateOne({ _id: id }, {
                $set: {
                    title: props.title,
                    description: props.description,
                    content: props.content,
                    beingModified: props.beingModified,
                    updated_by: uId, updated_at: Date.now()
                },
            }, { new: true, runValidators: true });
            if (!updated_procedure) {
                return {
                    status: false,
                    msg: `No procedure with id: ${id}`,
                };
            }
            return {
                status: true,
                msg: `procedure with id: ${id} updated`,
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
function changeProcedureStatus(id, uId, type) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            var auth = yield isProcedureAssignee(id, uId);
            assert(auth, "Auth Failed");
            var procedureStatus = (_a = (yield procedureModel.findById(id).select("status").exec())) === null || _a === void 0 ? void 0 : _a.status;
            switch (type) {
                case procedureStatusEnum.draft:
                    assert((procedureStatus == procedureStatusEnum.rejected), "For changing it's state, it should be in draft or rejected state");
                    // var auth = await isprocedureAssignee(id, uId)
                    break;
                case procedureStatusEnum.drafted:
                    assert((procedureStatus == procedureStatusEnum.draft), "For changing it's state, it should be in draft or rejected state");
                    var auth = yield isProcedureAssignee(id, uId);
                    break;
                case procedureStatusEnum.reviewed:
                    if (global.masterData.workflow.tier3Enabled) {
                        assert(procedureStatus == procedureStatusEnum.drafted, "For reviewing, procedure should be drafted");
                        var auth = yield isProcedureReviewer(id, uId);
                    }
                    else {
                        assert(false, "Not available");
                    }
                    break;
                case procedureStatusEnum.approved:
                    if (global.masterData.workflow.tier3Enabled) {
                        assert(procedureStatus == procedureStatusEnum.reviewed, "For approving, procedure should be reviewed");
                    }
                    else {
                        assert(procedureStatus == procedureStatusEnum.drafted, "For approving, procedure should be drafted");
                    }
                    var auth = yield isProcedureApprover(id, uId);
                    break;
                case procedureStatusEnum.rejected:
                    var auth = yield isProcedureReviewer(id, uId);
                    break;
                default:
                    var auth = false;
                    break;
            }
            assert(auth, "Auth Failed");
            yield procedureModel.updateOne({ _id: id }, {
                $set: {
                    status: type
                }
            });
            return {
                status: true,
                msg: "procedure status changed"
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
function updateProcedureReminder(id, uId, next_reminder) {
    return __awaiter(this, void 0, void 0, function* () {
        // check if procedure exists
        try {
            var procedure = yield procedureModel.exists({ _id: id });
            assert(procedure, `No procedure with id: ${id}`);
            var auth = yield checkProcedureAccessToUser(id, uId);
            assert(auth, "Auth Failed");
            // Change procedure status
            const result = yield procedureModel.updateOne({ _id: id }, {
                $set: {
                    reminder: next_reminder, updated_at: Date.now(), updated_by: uId
                }
            });
            if (result.modifiedCount === 0) {
                return {
                    status: false,
                    msg: `Unable to change procedure reminder`,
                };
            }
            return {
                status: true,
                msg: `Changed procedure reminder`,
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
// DELETE
function unAssignUserToProcedure(id_1, uId_1) {
    return __awaiter(this, arguments, void 0, function* (id, uId, assignees = {
        author: [], reviewer: [], approver: []
    }) {
        try {
            var auth = yield checkProcedureAccessToUser(id, uId);
            assert(auth, "Auth Failed");
            var procedure = yield procedureModel.exists({ _id: id });
            assert(procedure, `No procedure with id: ${id}`);
            yield procedureModel.updateOne({ _id: id }, {
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
                msg: "Can't remove assignees to procedure",
            };
        }
        return {
            status: true,
            msg: `Removed assignees to procedure:${id}`,
        };
    });
}
function deleteVersion(id, versionId, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = yield procedureModel.startSession();
        try {
            // auth 
            var auth = yield checkProcedureAccessToUser(id, uId);
            assert(auth, "Auth Failed");
            var version = yield procedureVersionModel.exists({ _id: versionId });
            assert(version, `No procedure with id: ${versionId}`);
            // var procedure = procedureModel.exists({ _id: id })
            // assert(procedure, `No procedure with id: ${id}`)
            session.startTransaction();
            yield procedureModel.updateOne({ _id: id }, {
                $pull: {
                    versions: versionId
                }
            }, { session });
            yield procedureVersionModel.findByIdAndDelete({ _id: versionId }, { session });
            yield session.commitTransaction();
            if (!session.hasEnded)
                session.endSession();
            return {
                status: true,
                msg: "procedure verson is Deleted"
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
function deleteProcedureTags(id, uId, tags) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // var procedure = await procedureModel.exists({ _id: id })
            // assert(procedure, `No procedure with id: ${id}`)
            var auth = yield checkProcedureAccessToUser(id, uId);
            assert(auth, "Auth Failed");
            yield procedureModel.updateOne({ _id: id }, {
                $pull: {
                    tags: {
                        $in: tags
                    }
                },
                $set: {
                    updated_by: uId,
                    updated_at: Date.now()
                }
            });
            assert(yield rmOneProcedureFromManyTags(id, tags, uId), "Can't remove tags");
            return {
                status: true,
                msg: `Removed tags to policies: ${id}`,
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
                msg: "Can't remove tags to procedure",
            };
        }
    });
}
function deleteProcedureComment(id, cId, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield isAdmin(uId);
            if (!auth) {
                var comment = yield commentsModel.findById(cId).select("created_by").exec();
                if ((comment === null || comment === void 0 ? void 0 : comment.created_by.toString()) == uId) {
                    var auth = true;
                }
                else {
                    var auth = false;
                }
            }
            assert(auth, "Auth Failed");
            const result = yield procedureModel.updateOne({ _id: id, comments: cId }, {
                $pull: { comments: cId },
                $set: { updated_at: Date.now(), updated_by: uId },
            });
            if (result.modifiedCount === 0) {
                return {
                    status: false,
                    msg: `No Comment of id: ${cId} in procedure with id: ${id}`,
                };
            }
            var comment = yield commentsModel.findById(cId);
            if (comment != null) {
                if (comment.images) {
                    yield Promise.all(comment.images.map((id) => __awaiter(this, void 0, void 0, function* () {
                        yield imagesModel.findByIdAndDelete(id);
                    })));
                }
                comment.deleteOne();
            }
            return {
                status: true,
                msg: `Comment Deleted`,
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
function deleteProcedure(id, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkProcedureAccessToUser(id, uId);
            assert(auth, "Auth Failed");
            var procedure = yield procedureModel.findByIdAndUpdate(id, {
                $set: {
                    status: "deleted"
                }
            });
            if (!procedure)
                return {
                    status: false,
                    msg: `No procedure with id: ${id}`,
                };
            // remove tags associated with it
            var removed = yield rmOneProcedureFromManyTags(id, procedure.tags, uId);
            assert(removed, "Tags not removed");
            return {
                status: true,
                msg: `procedure with id: ${id} was deleted`,
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
function exportProcedure(id, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            var procedure = yield procedureModel.findById(id);
            assert(procedure, "procedure not found");
            var auth = yield checkRolePermissions(uId, [
                { procedure: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            var data = yield pdfExport(procedure.title, "", procedure.title, (_a = procedure.assignees) === null || _a === void 0 ? void 0 : _a.author, (procedure.versions.length + 1).toString());
            return {
                status: true,
                data,
                msg: procedure === null || procedure === void 0 ? void 0 : procedure.title
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
export { saveProcedure, saveProcedureComments, setReminder, assignUserToProcedure, addProcedureTags, saveVersion, getProcedure, getAllProcedure, getProcedureComments, getVersion, getTotalCount, updateProcedureDetails, changeProcedureStatus, updateProcedureReminder, unAssignUserToProcedure, deleteProcedure, deleteProcedureComment, deleteProcedureTags, deleteVersion, exportProcedure };
