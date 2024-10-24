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
import policyModel, { policyStatusEnum } from "../models/policyModel.js";
import imagesModel from "../models/filesModel.js";
import policyVersionModel from "../models/policyVersionModel.js";
import { addOnePolicyToManyTags, rmOnePolicyFromManyTags } from "./tagsController.js";
import { Types } from "mongoose";
import { addLog } from "./logController.js";
import { AssertionError } from "assert";
import { checkRolePermissions, isAdmin, isPolicyApprover, isPolicyAssignee, isPolicyReviewer } from "../../utils/roles.js";
import assert from "assert";
import pdfExport from "../../utils/pdfExport.js";
import { getDateAfterDays } from "../../utils/functions.js";
import userModel from "../models/userModel.js";
function checkPolicyAccessToUser(policyId, userId) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        var policyStatus = (_a = (yield policyModel.findById(policyId).select("status").exec())) === null || _a === void 0 ? void 0 : _a.status;
        if (!policyStatus)
            return false;
        // Checking policy state
        var auth = false;
        switch (policyStatus) {
            case policyStatusEnum.draft:
            case policyStatusEnum.rejected:
                auth = yield isPolicyAssignee(policyId, userId);
                break;
            case policyStatusEnum.drafted:
                auth = yield isPolicyReviewer(policyId, userId);
                break;
            case policyStatusEnum.reviewed:
            case policyStatusEnum.approved:
                auth = yield isPolicyApprover(policyId, userId);
                break;
            default:
                break;
        }
        return auth;
    });
}
// const OBJECT_TYPE = objectEnum.policy
// CREATE
function savePolicy(uId, title, description, content, tags, procedure, projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { policy: { edit: true } }
            ]);
            assert(auth, "Auth Failed");
            // Get frequency from global state
            var reminder = null;
            switch (global.masterData.reviewFrequency) {
                case "daily":
                    reminder = getDateAfterDays(1);
                    break;
                case "weekly":
                    reminder = getDateAfterDays(7);
                    break;
                case "monthly":
                    reminder = getDateAfterDays(30);
                    break;
                case "yearly":
                    reminder = getDateAfterDays(365);
                    break;
                default:
                    break;
            }
            assert(reminder, "Frequency is not defined");
            var policy = yield policyModel.create({
                project: projectId,
                created_by: uId,
                updated_by: uId,
                title,
                description,
                content,
                reminder,
                'assignees.author': [uId],
                procedure,
            });
            if (tags) {
                var allTags = yield addOnePolicyToManyTags(policy._id.toString(), tags, uId);
                if (allTags.length) {
                    yield policyModel.updateOne({ _id: policy._id }, {
                        $addToSet: {
                            tags: { $each: allTags }
                        }
                    });
                }
            }
            // // add policy to a project
            // await projectModel.updateOne(
            //     { _id: projectId },
            //     {
            //         $addToSet: {
            //             policies: policy._id
            //         }
            //     }
            // )
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
                msg: "Error creating Policy",
            };
        }
        var log = yield addLog({
            objectType: "policy",
            objectId: policy.id,
            userId: uId,
            action: "add",
            description: "New policy was created"
        });
        if (!log)
            return {
                status: false,
                msg: "Error Can't add logs"
            };
        policy.logs.push(log);
        yield policy.save();
        return {
            status: true,
            msg: policy.id,
        };
    });
}
function saveVersion(id, name, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = yield policyModel.startSession();
        try {
            // TODO: when to save the version
            var auth = yield isPolicyAssignee(id, uId);
            assert(auth, "Auth Failed");
            var exists = yield policyModel.exists({ _id: id });
            assert(exists, "The policy doesn't exists");
            session.startTransaction();
            var policy = yield policyModel.findById(id)
                .select("title description content reminder tags procedure");
            assert(policy, "Policy not found");
            // console.log(policy)
            const version = (yield policyVersionModel.create([{
                    name,
                    title: policy.title,
                    description: policy.description,
                    content: policy.content,
                    created_by: uId,
                    reminder: policy.reminder,
                    tags: policy.tags,
                    procedure: policy.procedure
                }], { session }))[0];
            assert(version, "Version not saved");
            var log = yield addLog({
                objectType: "policy",
                objectId: policy.id,
                userId: new Types.ObjectId(uId),
                action: "add",
                description: "New policy version was created"
            });
            assert(log, "Failed to update log");
            yield policyModel.updateOne({ _id: policy._id }, {
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
function savePolicyComments(id, uId, content, images) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = yield policyModel.startSession();
        try {
            session.startTransaction();
            var auth = yield checkRolePermissions(uId, [
                { policy: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            const policy = yield policyModel.exists({ _id: id });
            assert(policy, `No policy with id: ${id}`);
            const comment = (yield commentsModel.create([{
                    content,
                    created_by: uId,
                    images
                }], { session }))[0];
            // var log = await addLog(globalWhere,id,uId,methodEnum.add,"New policy comments was created")
            var log = yield addLog({
                objectType: "policy",
                objectId: policy._id,
                userId: new Types.ObjectId(uId),
                action: "add",
                description: "New policy comments was created"
            });
            assert(log, "Can't save logs");
            const result = yield policyModel.updateOne({ _id: id }, { $push: { comments: comment._id, logs: log._id } }, { session });
            assert(result.modifiedCount, `Failed to add comment to policy with id: ${id}`);
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
function getAllPolicy(uId, _page, _count, sort) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { policy: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            var page = parseInt(_page);
            var count = parseInt(_count);
            const policies = yield policyModel.aggregate([
                { $project: { title: 1, description: 1, created_by: 1, updated_at: 1, status: 1, beingModified: 1 } },
                { $skip: (page - 1) * count },
                { $limit: count },
            ]);
            return {
                status: true,
                policies
            };
        }
        catch (error) {
            // console.log(error)
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
function getPolicyComments(id, _page, _count, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { policy: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            var page = parseInt(_page);
            var count = parseInt(_count);
            const commentsIds = yield policyModel.aggregate([
                { $match: { _id: new Types.ObjectId(id) } },
                { $project: { comments: 1 } },
                { $unwind: '$comments' },
                { $skip: (page - 1) * count },
                { $limit: count },
            ]);
            assert(commentsIds, "No Comments");
            var comments = (yield policyModel.populate(commentsIds, { path: "comments" })).map(e => e.comments[0]);
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
function getPolicy(id, uId) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { policy: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            var policy = yield policyModel.findById(id).select({ comments: 0, logs: 0 }).exec();
            assert(policy, `No policy with id: ${id}`);
            // CHECK if author, reviwer and approver exists or not
            var _change = false;
            if ((_a = policy.assignees) === null || _a === void 0 ? void 0 : _a.author) {
                yield Promise.all(policy.assignees.author.map((userId, _index) => __awaiter(this, void 0, void 0, function* () {
                    var exists = yield userModel.exists({ _id: userId });
                    if (!exists) {
                        _change = true;
                        delete policy.assignees.author[_index];
                    }
                })));
                policy.assignees.author = policy.assignees.author.filter((value) => value !== undefined);
            }
            if ((_b = policy.assignees) === null || _b === void 0 ? void 0 : _b.reviewer) {
                yield Promise.all(policy.assignees.reviewer.map((userId, _index) => __awaiter(this, void 0, void 0, function* () {
                    var exists = yield userModel.exists({ _id: userId });
                    if (!exists) {
                        _change = true;
                        delete policy.assignees.reviewer[_index];
                    }
                })));
                policy.assignees.reviewer = policy.assignees.reviewer.filter((value) => value !== undefined);
            }
            if ((_c = policy.assignees) === null || _c === void 0 ? void 0 : _c.approver) {
                yield Promise.all(policy.assignees.approver.map((userId, _index) => __awaiter(this, void 0, void 0, function* () {
                    var exists = yield userModel.exists({ _id: userId });
                    if (!exists) {
                        _change = true;
                        delete policy.assignees.approver[_index];
                    }
                })));
                policy.assignees.approver = policy.assignees.approver.filter((value) => value !== undefined);
            }
            if (_change)
                yield policy.save();
            yield policy.populate("tags");
            return {
                status: true,
                policy,
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
                { policy: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            var version = yield policyVersionModel.findById(versionId);
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
                { policy: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            var count = yield policyModel.countDocuments();
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
function assignUserToPolicy(id, uId, assignees = {
    author: [], reviewer: [], approver: []
}) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkPolicyAccessToUser(id, uId);
            assert(auth, "Auth Failed");
            var policy = yield policyModel.exists({ _id: id });
            assert(policy, `No policy with id: ${id}`);
            yield policyModel.updateOne({ _id: id }, {
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
                objectType: "policy",
                objectId: policy._id,
                userId: new Types.ObjectId(uId),
                action: "add",
                description: "New policy comments was created"
            });
            yield policyModel.updateOne({ _id: id }, {
                $push: {
                    logs: log
                }
            });
            return {
                status: true,
                msg: "Added users to the policy",
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
function addPolicyTags(id, uId, tags) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = yield policyModel.startSession();
        session.startTransaction();
        try {
            var auth = yield checkPolicyAccessToUser(id, uId);
            assert(auth, "Auth Failed");
            var policy = yield policyModel.exists({ _id: id });
            assert(policy, `No policy with id: ${id}`);
            // console.log(tags)
            var allTags = yield addOnePolicyToManyTags(id, tags, uId, session);
            // console.log(allTags)
            assert(allTags.length, "Error! Can't add tags");
            yield policyModel.updateOne({ _id: id }, {
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
            // var log = await addLog(globalWhere,id,uId,methodEnum.add,"New Tags are added to the policy")
            var log = yield addLog({
                objectType: "policy",
                objectId: policy._id,
                userId: new Types.ObjectId(uId),
                action: "add",
                description: "New Tags are added to the policy"
            });
            yield policyModel.updateOne({ _id: id }, {
                $push: {
                    logs: log
                }
            }, { session });
            yield session.commitTransaction();
            return {
                status: true,
                msg: `Added tags to policies: ${id}`,
            };
        }
        catch (error) {
            yield session.abortTransaction();
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
        finally {
            if (!session.hasEnded)
                yield session.endSession();
        }
    });
}
function setReminder(id, uId, next_reminder) {
    return __awaiter(this, void 0, void 0, function* () {
        // check if policy exists
        try {
            var policy = yield policyModel.exists({ _id: id });
            if (!policy)
                return {
                    status: false,
                    msg: `No policy with id: ${id}`,
                };
            var auth = yield isPolicyAssignee(id, uId);
            assert(auth, "Auth Failed");
            yield policyModel.updateOne({ _id: id }, {
                $set: {
                    reminder: next_reminder,
                    updated_at: Date.now(),
                    updated_by: uId
                }
            });
            return {
                status: true,
                msg: `Reminder added to policy with id: ${id}`,
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
                msg: `Unable to set reminder to policy with id: ${id}`,
            };
        }
    });
}
// UPDATE
function updatePolicyDetails(id, uId, props) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkPolicyAccessToUser(id, uId);
            assert(auth, "Auth Failed");
            var updated_policy = yield policyModel.updateOne({ _id: id }, {
                $set: {
                    title: props.title,
                    description: props.description,
                    content: props.content,
                    beingModified: props.beingModified,
                    updated_by: uId, updated_at: Date.now()
                },
            }, { new: true, runValidators: true });
            if (!updated_policy) {
                return {
                    status: false,
                    msg: `No policy with id: ${id}`,
                };
            }
            return {
                status: true,
                msg: `Policy with id: ${id} updated`,
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
function changePolicyStatus(id, uId, type) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield isPolicyAssignee(id, uId);
            assert(auth, "Auth Failed");
            var policyStatus = (_a = (yield policyModel.findById(id).select("status").exec())) === null || _a === void 0 ? void 0 : _a.status;
            switch (type) {
                case policyStatusEnum.draft:
                    assert((policyStatus == policyStatusEnum.rejected), "For changing it's state, it should be in draft or rejected state");
                    // var auth = await isPolicyAssignee(id, uId)
                    break;
                case policyStatusEnum.drafted:
                    assert((policyStatus == policyStatusEnum.draft), "For changing it's state, it should be in draft or rejected state");
                    var auth = yield isPolicyAssignee(id, uId);
                    break;
                case policyStatusEnum.reviewed:
                    if (global.masterData.workflow.tier3Enabled) {
                        assert(policyStatus == policyStatusEnum.drafted, "For reviewing, policy should be drafted");
                        var auth = yield isPolicyReviewer(id, uId);
                    }
                    else {
                        assert(false, "Not available");
                    }
                    break;
                case policyStatusEnum.approved:
                    if (global.masterData.workflow.tier3Enabled) {
                        assert(policyStatus == policyStatusEnum.reviewed, "For approving, policy should be reviewed");
                    }
                    else {
                        assert(policyStatus == policyStatusEnum.drafted, "For approving, policy should be drafted");
                    }
                    var auth = yield isPolicyApprover(id, uId);
                    break;
                case policyStatusEnum.rejected:
                    var auth = yield isPolicyReviewer(id, uId);
                    break;
                default:
                    var auth = false;
                    break;
            }
            assert(auth, "Auth Failed");
            yield policyModel.updateOne({ _id: id }, {
                $set: {
                    status: type
                }
            });
            return {
                status: true,
                msg: "Policy status changed"
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
function updatePolicyReminder(id, uId, next_reminder) {
    return __awaiter(this, void 0, void 0, function* () {
        // check if policy exists
        try {
            var policy = yield policyModel.exists({ _id: id });
            assert(policy, `No policy with id: ${id}`);
            var auth = yield checkPolicyAccessToUser(id, uId);
            assert(auth, "Auth Failed");
            // Change policy status
            const result = yield policyModel.updateOne({ _id: id }, {
                $set: {
                    reminder: next_reminder, updated_at: Date.now(), updated_by: uId
                }
            });
            if (result.modifiedCount === 0) {
                return {
                    status: false,
                    msg: `Unable to change policy reminder`,
                };
            }
            return {
                status: true,
                msg: `Changed policy reminder`,
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
function unAssignUserToPolicy(id, uId, assignees = {
    author: [], reviewer: [], approver: []
}) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkPolicyAccessToUser(id, uId);
            assert(auth, "Auth Failed");
            var policy = yield policyModel.exists({ _id: id });
            assert(policy, `No policy with id: ${id}`);
            yield policyModel.updateOne({ _id: id }, {
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
                msg: "Can't remove assignees to policy",
            };
        }
        return {
            status: true,
            msg: `Removed assignees to policy:${id}`,
        };
    });
}
function deleteVersion(id, versionId, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = yield policyModel.startSession();
        try {
            // auth 
            var auth = yield checkPolicyAccessToUser(id, uId);
            assert(auth, "Auth Failed");
            var version = yield policyVersionModel.exists({ _id: versionId });
            assert(version, `No policy with id: ${versionId}`);
            // var policy = policyModel.exists({ _id: id })
            // assert(policy, `No policy with id: ${id}`)
            session.startTransaction();
            yield policyModel.updateOne({ _id: id }, {
                $pull: {
                    versions: versionId
                }
            }, { session });
            yield policyVersionModel.findByIdAndDelete({ _id: versionId }, { session });
            yield session.commitTransaction();
            if (!session.hasEnded)
                session.endSession();
            return {
                status: true,
                msg: "Policy verson is Deleted"
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
function deletePolicyTags(id, uId, tags) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // var policy = await policyModel.exists({ _id: id })
            // assert(policy, `No policy with id: ${id}`)
            var auth = yield checkPolicyAccessToUser(id, uId);
            assert(auth, "Auth Failed");
            yield policyModel.updateOne({ _id: id }, {
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
            assert(!(yield rmOnePolicyFromManyTags(id, tags, uId)), "Can't remove tags");
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
            return {
                status: false,
                msg: "Can't remove tags to policy",
            };
        }
    });
}
function deletePolicyComment(id, cId, uId) {
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
            const result = yield policyModel.updateOne({ _id: id, comments: cId }, {
                $pull: { comments: cId },
                $set: { updated_at: Date.now(), updated_by: uId },
            });
            if (result.modifiedCount === 0) {
                return {
                    status: false,
                    msg: `No Comment of id: ${cId} in policy with id: ${id}`,
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
function deletePolicy(id, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkPolicyAccessToUser(id, uId);
            assert(auth, "Auth Failed");
            var policy = yield policyModel.findByIdAndDelete(id);
            if (!policy)
                return {
                    status: false,
                    msg: `No policy with id: ${id}`,
                };
            // remove tags associated with it
            var removed = yield rmOnePolicyFromManyTags(id, policy.tags, uId);
            assert(removed, "Tags not removed");
            return {
                status: true,
                msg: `Policy with id: ${id} was deleted`,
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
function exportPolicy(id, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var policy = yield policyModel.findById(id);
            assert(policy, "Policy not found");
            var auth = yield checkRolePermissions(uId, [
                { policy: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            var data = yield pdfExport(policy === null || policy === void 0 ? void 0 : policy.title, policy === null || policy === void 0 ? void 0 : policy.content);
            return {
                status: true,
                data,
                msg: policy === null || policy === void 0 ? void 0 : policy.title
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
export { savePolicy, savePolicyComments, setReminder, assignUserToPolicy, addPolicyTags, saveVersion, getPolicy, getAllPolicy, getPolicyComments, getVersion, getTotalCount, updatePolicyDetails, changePolicyStatus, updatePolicyReminder, unAssignUserToPolicy, deletePolicy, deletePolicyComment, deletePolicyTags, deleteVersion, exportPolicy };
