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
import { pdfExport } from "../../utils/pdfExport.js";
import { getDateAfterDays } from "../../utils/functions.js";
import userModel from "../models/userModel.js";
import projectModel from "../models/projectModel.js";
import { getAndSetPolicyCounter } from "../models/counterModel.js";
import { createNotification } from "./notificationController.js";
import axios, { AxiosError } from "axios";
function checkPolicyVersionAccessToUser(policyVersionId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var version = yield policyVersionModel.findById(policyVersionId).select({ status: 1, policy: 1 });
            assert(version);
            var auth = yield isAdmin(userId);
            if (auth)
                return true;
            // Checking policy state
            switch (version.status) {
                case policyStatusEnum.draft:
                case policyStatusEnum.rejected:
                case policyStatusEnum.inactive:
                    auth = yield isPolicyAssignee(version.policy, userId);
                    break;
                case policyStatusEnum.drafted:
                    auth = yield isPolicyReviewer(version.policy, userId);
                    break;
                case policyStatusEnum.reviewed:
                case policyStatusEnum.approved:
                    auth = yield isPolicyApprover(version.policy, userId);
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
function sendNotifcationWapper(onWatch, policyVersionId, msg, by, status) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        try {
            var version = yield policyVersionModel.findById(policyVersionId);
            assert(version, "Policy Version not found");
            var userEmail = yield userModel.findById(by).select({ email: 1 });
            switch (status || version.status) {
                case policyStatusEnum.draft:
                    if (onWatch) {
                        if ((_a = version.assignees) === null || _a === void 0 ? void 0 : _a.approver) {
                            yield Promise.all(version.assignees.approver.map((userId) => __awaiter(this, void 0, void 0, function* () {
                                yield userModel.findById(userId);
                                yield createNotification(userId, `${msg} by ${userEmail === null || userEmail === void 0 ? void 0 : userEmail.email}`);
                            })));
                        }
                        if ((_b = version.assignees) === null || _b === void 0 ? void 0 : _b.reviewer) {
                            yield Promise.all(version.assignees.reviewer.map((userId) => __awaiter(this, void 0, void 0, function* () {
                                yield userModel.findById(userId);
                                yield createNotification(userId, `${msg} by ${userEmail === null || userEmail === void 0 ? void 0 : userEmail.email}`);
                            })));
                        }
                    }
                    break;
                case policyStatusEnum.drafted:
                    if ((_c = version.assignees) === null || _c === void 0 ? void 0 : _c.author) {
                        yield Promise.all(version.assignees.author.map((userId) => __awaiter(this, void 0, void 0, function* () {
                            yield userModel.findById(userId);
                            yield createNotification(userId, `${msg} by ${userEmail === null || userEmail === void 0 ? void 0 : userEmail.email}`);
                        })));
                    }
                    if (onWatch) {
                        if ((_d = version.assignees) === null || _d === void 0 ? void 0 : _d.approver) {
                            yield Promise.all(version.assignees.reviewer.map((userId) => __awaiter(this, void 0, void 0, function* () {
                                yield userModel.findById(userId);
                                yield createNotification(userId, `${msg} by ${userEmail === null || userEmail === void 0 ? void 0 : userEmail.email}`);
                            })));
                        }
                    }
                    break;
                case policyStatusEnum.reviewed:
                    if ((_e = version.assignees) === null || _e === void 0 ? void 0 : _e.author) {
                        yield Promise.all(version.assignees.author.map((userId) => __awaiter(this, void 0, void 0, function* () {
                            yield userModel.findById(userId);
                            yield createNotification(userId, `${msg} by ${userEmail === null || userEmail === void 0 ? void 0 : userEmail.email}`);
                        })));
                    }
                    if ((_f = version.assignees) === null || _f === void 0 ? void 0 : _f.reviewer) {
                        yield Promise.all(version.assignees.reviewer.map((userId) => __awaiter(this, void 0, void 0, function* () {
                            yield userModel.findById(userId);
                            yield createNotification(userId, `${msg} by ${userEmail === null || userEmail === void 0 ? void 0 : userEmail.email}`);
                        })));
                    }
                    break;
                default:
                    break;
            }
        }
        catch (error) {
        }
    });
}
// const OBJECT_TYPE = objectEnum.policy
// CREATE
function createPolicy(uId, projectId, title) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { policy: { edit: true } }
            ]);
            assert(auth, "Auth Failed");
            var exists = yield projectModel.exists({ _id: projectId });
            assert(exists, "Project Not found");
            // console.log(exists)
            // Get frequency from global state
            // 'Quarterly' | 'Biannually' | 'Annually'
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
            var counterId = (yield getAndSetPolicyCounter()).toString();
            var policy = yield policyModel.create({
                // title:`policy ${counterId}`,
                title,
                project: projectId,
                created_by: uId,
                updated_by: uId,
                ID: counterId,
                reminder,
                // tags,
                // status
            });
            // add policy to a project
            yield projectModel.updateOne({ _id: projectId }, {
                $addToSet: {
                    policies: policy._id
                }
            });
            return {
                status: true,
                data: {
                    _id: policy._id,
                    nameID: counterId
                },
            };
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
    });
}
function createPolicyFromTemplate(uId_1, projectId_1, templateIds_1) {
    return __awaiter(this, arguments, void 0, function* (uId, projectId, templateIds, assignees = {
        author: [], reviewer: [], approver: []
    }) {
        try {
            var auth = yield checkRolePermissions(uId, [
                { policy: { edit: true } }
            ]);
            assert(auth, "Auth Failed");
            // assert(assignees.author,"Must have atleast one author")
            // assert(assignees.author.length > 0,"Must have atleast 1 author")
            // assert(assignees.author.length <= 3,"Can't have more than 3 author")
            assert(templateIds.length > 0, "template id not found");
            // await Promise.all(assignees.author.map(async _id=>{
            //     var user = await userModel.exists({"_id":_id})
            //     assert(user,"author not found")
            // }))
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
            yield Promise.all(templateIds.map((_tId) => __awaiter(this, void 0, void 0, function* () {
                var tmp = yield axios.get(`${process.env.ORG_API}/api/v2/auth/policy/${_tId}`, {
                    headers: {
                        'x-api-key': global.masterData.apiKey
                    }
                });
                // console.log(tmp.data)
                var counterId = (yield getAndSetPolicyCounter()).toString();
                var policy = yield policyModel.create({
                    // title:`policy ${counterId}`,
                    title: tmp.data['data']['title'],
                    project: projectId,
                    created_by: uId,
                    updated_by: uId,
                    ID: counterId,
                    reminder,
                    status: 'draft',
                });
                // add policy to a project
                yield projectModel.updateOne({ _id: projectId }, {
                    $addToSet: {
                        policies: policy._id
                    }
                });
                yield assignUserToPolicy(policy.id, uId, assignees);
            })));
            return {
                status: true
            };
        }
        catch (error) {
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message
                };
            }
            if (error.name === "MongoServerError" && error.code === 11000)
                return {
                    status: false,
                    msg: "Title is dublicate",
                };
            if (error instanceof AxiosError) {
                return {
                    status: false,
                    msg: 'Policy not found',
                };
            }
            return {
                status: false,
                msg: "Error creating Policy",
            };
        }
    });
}
function createPolicyVersion(uId, policyId, description, assignees) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { policy: { edit: true } }
            ]);
            assert(auth, "Auth Failed");
            assert(assignees.author.length > 0 && assignees.author.length <= 3, "Policy Version require author");
            var policy = yield policyModel.findById(policyId).select({ count: 1, ID: 1, versions: 1 });
            assert(policy, "Policy not found");
            assert(policy.versions.draft.length < 1, "Policy already have a ongoing version");
            policy.count = policy.count + 1;
            policy.assignees = assignees;
            var version = yield policyVersionModel.create({
                ID: `${policy.ID}.${policy === null || policy === void 0 ? void 0 : policy.count}`,
                description,
                policy: policyId,
                created_by: uId,
                updated_by: uId,
            });
            yield policy.save();
            var log = yield addLog({
                objectType: "policy",
                objectId: version.id,
                userId: uId,
                action: "add",
                description: "New policy version was created"
            });
            if (log) {
                yield version.save();
                yield policyModel.updateOne({ _id: policyId }, {
                    $addToSet: {
                        "versions.draft": version._id
                    },
                    $push: {
                        logs: log._id
                    }
                });
            }
            return {
                status: true,
                msg: version._id
            };
        }
        catch (error) {
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message
                };
            }
            if (error.name === "MongoServerError" && error.code === 11000)
                return {
                    status: false,
                    msg: "Title is dublicate",
                };
            console.log(error);
            return {
                status: false,
                msg: "Error creating Policy",
            };
        }
    });
}
function savePolicyVersionComments(versionId, uId, content, images) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = yield policyModel.startSession();
        try {
            session.startTransaction();
            var auth = yield checkRolePermissions(uId, [
                { policy: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            const version = yield policyVersionModel.exists({ _id: versionId });
            assert(version, `No policy version with id: ${versionId}`);
            const comment = (yield commentsModel.create([{
                    content,
                    created_by: uId,
                    images
                }], { session }))[0];
            // var log = await addLog(globalWhere,id,uId,methodEnum.add,"New policy comments was created")
            var log = yield addLog({
                objectType: "policyVersion",
                objectId: version._id,
                userId: new Types.ObjectId(uId),
                action: "add",
                description: "New policy comments was created"
            });
            if (log) {
                const result = yield policyVersionModel.updateOne({ _id: versionId }, { $push: { comments: comment._id, logs: log._id } }, { session });
                assert(result.modifiedCount, `Failed to add comment to policy version with id: ${versionId}`);
            }
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
// TODO: get policy or policy version
function getAllPolicy(uId_1, _page_1, _count_1) {
    return __awaiter(this, arguments, void 0, function* (uId, _page, _count, sort = { field: "updated_at", order: "asc" }, search = "") {
        try {
            var auth = yield checkRolePermissions(uId, [
                { policy: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            var page = parseInt(_page);
            var count = parseInt(_count);
            const pipeline = [];
            if (!!search) {
                pipeline.push({
                    $match: {
                        $or: [
                            { title: { $regex: search, $options: "i" } },
                            { ID: { $regex: search, $options: "i" } }
                        ]
                    }
                });
            }
            pipeline.push({ $project: { ID: 1, title: 1, status: 1, tags: 1, assignees: 1, created_at: 1, updated_at: 1 } }, {
                $addFields: {
                    status: {
                        $cond: {
                            if: { $gt: [{ $getField: "versions.active" }, 0] },
                            then: { $getField: "status" }, // Set the status to "reviewed" if active array has elements
                            else: "Comming Soon" // Set the status to "drafted" if active array is empty
                        }
                    }
                }
            });
            if (!!sort.field) {
                pipeline.push({ $sort: { [sort.field]: sort.order === "asc" ? 1 : -1 } });
            }
            pipeline.push({ $skip: (page - 1) * count }, { $limit: count });
            const policies = yield policyModel.aggregate(pipeline);
            yield policyModel.populate(policies, [
                { path: "tags", select: { name: 1 } },
                { path: "assignees.author", select: { email: 1, firstname: 1, lastname: 1, image: 1 } },
                { path: "assignees.reviewer", select: { email: 1, firstname: 1, lastname: 1, image: 1 } },
                { path: "assignees.approver", select: { email: 1, firstname: 1, lastname: 1, image: 1 } },
            ]);
            const totalCount = yield policyModel.countDocuments();
            return {
                status: true,
                count: totalCount,
                policies
            };
        }
        catch (error) {
            if (error instanceof AssertionError)
                return {
                    status: true,
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
function overview(uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { policy: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            const data = (yield policyModel.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                }
            ]));
            var overview = {};
            data.forEach((item) => {
                overview[item._id] = item.count;
            });
            return {
                status: true,
                data: [
                    { label: "Total Count", value: Object.values(overview).reduce((a, b) => a + b, 0) },
                    { label: "Active", value: overview.approved || 0 },
                    { label: "Inactive", value: overview.inactive || 0 },
                    { label: "In Draft", value: overview.draft || 0 },
                    { label: "In Review", value: overview.drafted || 0 },
                ]
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
function getPolicyVersionComments(versionId, _page, _count, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { policy: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            var page = parseInt(_page);
            var count = parseInt(_count);
            const commentsIds = yield policyVersionModel.aggregate([
                { $match: { _id: new Types.ObjectId(versionId) } },
                { $project: { comments: 1 } },
                { $unwind: '$comments' },
                { $skip: (page - 1) * count },
                { $limit: count },
            ]);
            assert(commentsIds, "No Comments");
            var comments = (yield policyVersionModel.populate(commentsIds, { path: "comments" })).map(e => e.comments[0]);
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
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { policy: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            var policy = yield policyModel.findById(id).select({ count: 0, logs: 0 }).exec();
            assert(policy, `No policy with id: ${id}`);
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
function getPolicyVersion(policyId, versionId, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        try {
            var auth = yield checkRolePermissions(uId, [
                { policy: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            var policy = yield policyModel.findById(policyId).select({ versions: 1 }).exec();
            assert(policy, `Policy not found`);
            var version = yield policyVersionModel.findById(versionId).select({ comments: 0, logs: 0 }).exec();
            assert(version, `No policy version with id: ${versionId}`);
            // CHECK if author, reviwer and approver exists or not
            var _change = false;
            if ((_a = version.assignees) === null || _a === void 0 ? void 0 : _a.author) {
                yield Promise.all(version.assignees.author.map((userId, _index) => __awaiter(this, void 0, void 0, function* () {
                    var exists = yield userModel.exists({ _id: userId });
                    if (!exists) {
                        _change = true;
                        delete version.assignees.author[_index];
                    }
                })));
                version.assignees.author = version.assignees.author.filter((value) => value !== undefined);
            }
            if ((_b = version.assignees) === null || _b === void 0 ? void 0 : _b.reviewer) {
                yield Promise.all(version.assignees.reviewer.map((userId, _index) => __awaiter(this, void 0, void 0, function* () {
                    var exists = yield userModel.exists({ _id: userId });
                    if (!exists) {
                        _change = true;
                        delete version.assignees.reviewer[_index];
                    }
                })));
                version.assignees.reviewer = version.assignees.reviewer.filter((value) => value !== undefined);
            }
            if ((_c = version.assignees) === null || _c === void 0 ? void 0 : _c.approver) {
                yield Promise.all(version.assignees.approver.map((userId, _index) => __awaiter(this, void 0, void 0, function* () {
                    var exists = yield userModel.exists({ _id: userId });
                    if (!exists) {
                        _change = true;
                        delete version.assignees.approver[_index];
                    }
                })));
                version.assignees.approver = version.assignees.approver.filter((value) => value !== undefined);
            }
            if (_change)
                yield version.save();
            if (!((_d = policy.versions) === null || _d === void 0 ? void 0 : _d.active.length) && version.status == policyStatusEnum.draft) {
                version.status = 'Comming Soon';
            }
            return {
                status: true,
                version,
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
// async function getVersion(versionId: string, uId: string): Promise<myResponse> {
//     try {
//         var auth = await checkRolePermissions(uId, [
//             { policy: { view: true } }
//         ])
//         assert(auth, "Auth Failed")
//         var version = await policyVersionModel.findById(versionId)
//         assert(version, "No version found")
//         return {
//             status: true,
//             version
//         }
//     } catch (error) {
//         if (error instanceof AssertionError) return {
//             status: false,
//             msg: error.message
//         }
//         return {
//             status: false,
//             msg: "Error"
//         }
//     }
// }
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
function assignUserToPolicy(policyId_1, uId_1) {
    return __awaiter(this, arguments, void 0, function* (policyId, uId, assignees = {
        author: [], reviewer: [], approver: []
    }) {
        try {
            // var auth = await checkPolicyVersionAccessToUser(versionId, uId)
            // assert(auth, "Auth Failed")
            var version = yield policyModel.exists({ _id: policyId });
            assert(version, `No version with id: ${policyId}`);
            var auth = yield isPolicyAssignee(policyId, uId);
            assert(auth, "Auth Failed");
            assert(assignees.author.length <= 3, "Not more than 3 Authors");
            assert(assignees.reviewer.length <= 3, "Not more than 3 Reviewer");
            assert(assignees.approver.length <= 3, "Not more than 3 Approver");
            yield policyModel.updateOne({ _id: policyId }, {
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
                objectId: version._id,
                userId: new Types.ObjectId(uId),
                action: "add",
                description: "New policy comments was created"
            });
            if (log) {
                yield policyModel.updateOne({ _id: policyId }, {
                    $push: {
                        logs: log
                    }
                });
            }
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
            var auth = yield checkRolePermissions(uId, [{
                    policy: {
                        edit: true
                    }
                }]);
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
            // [ ] 
            // await sendNotifcationWapper(id, "added tags", uId)
            var log = yield addLog({
                objectType: "policy",
                objectId: policy._id,
                userId: uId,
                action: "add",
                description: "New Tags are added to the policy"
            });
            if (log) {
                yield policyModel.updateOne({ _id: id }, {
                    $push: {
                        logs: log
                    }
                }, { session });
            }
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
// UPDATE
function updatePolicyVersionDetails(versionId, uId, props) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkPolicyVersionAccessToUser(versionId, uId);
            assert(auth, "Auth Failed");
            // var policy = await policyModel.findOne({_id:policyId}).select({onWatch:1})
            // assert(policy, "Auth Failed")
            var version = yield policyVersionModel.findOneAndUpdate({ _id: versionId }, {
                $set: {
                    description: props.description,
                    content: props.content,
                    beingModified: props.beingModified,
                    updated_by: uId, updated_at: Date.now()
                },
            }, { new: true, runValidators: true });
            assert(version, "Version not found");
            yield sendNotifcationWapper(version.onWatch, versionId, "was updated", uId);
            var log = yield addLog({
                objectType: "policy",
                objectId: versionId,
                userId: uId,
                action: "update",
                description: "Updated policy details"
            });
            if (log) {
                yield policyVersionModel.updateOne({ _id: versionId }, {
                    $push: {
                        logs: log._id
                    }
                });
            }
            return {
                status: true,
                msg: `Policy version with id: ${version.ID} updated`,
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
function changePolicyVersionStatus(versionId, uId, type) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield isAdmin(uId);
            var version = yield policyVersionModel.findById(versionId).select({ status: 1, ID: 1, policy: 1 }).exec();
            assert(version, "Policy version not found");
            var policy = yield policyModel.findById(version.policy).select({ assignees: 1 }).exec();
            assert(policy, "Policy version not found");
            if (!auth) {
                // if Not a admin
                auth = yield isPolicyAssignee(policy._id, uId);
                // console.log({auth})
                assert(auth, "Auth Failed");
                switch (type) {
                    case policyStatusEnum.draft:
                        assert((version.status == policyStatusEnum.rejected), "For changing it's state, it should be in draft or rejected state");
                        assert(policy.assignees.author.length >= 1, "No author selected");
                        break;
                    case policyStatusEnum.drafted:
                        assert((version.status == policyStatusEnum.draft), "For changing it's state, it should be in draft or rejected state");
                        assert(policy.assignees.reviewer.length >= 1, "No reviewer selected");
                        var auth = yield isPolicyAssignee(policy._id, uId);
                        break;
                    case policyStatusEnum.reviewed:
                        if (global.masterData.workflow.tier3Enabled) {
                            assert(version.status == policyStatusEnum.drafted, "For reviewing, policy should be drafted");
                            var auth = yield isPolicyReviewer(policy._id, uId);
                            assert(policy.assignees.approver.length >= 1, "No approver selected");
                        }
                        else {
                            assert(false, "Not available");
                        }
                        break;
                    case policyStatusEnum.approved:
                        if (global.masterData.workflow.tier3Enabled) {
                            assert(version.status == policyStatusEnum.reviewed, "For approving, policy should be reviewed");
                        }
                        else {
                            assert(version.status == policyStatusEnum.drafted, "For approving, policy should be drafted");
                        }
                        var auth = yield isPolicyApprover(policy._id, uId);
                        break;
                    case policyStatusEnum.inactive:
                        assert((version.status == policyStatusEnum.draft || version.status == policyStatusEnum.approved), "For inactivating, policy should be in active state");
                        var auth = yield isPolicyAssignee(policy._id, uId);
                        break;
                    case policyStatusEnum.rejected:
                        switch (version.status) {
                            case policyStatusEnum.drafted:
                                var auth = yield isPolicyReviewer(policy._id, uId);
                                break;
                            case policyStatusEnum.reviewed:
                                var auth = yield isPolicyApprover(policy._id, uId);
                                break;
                        }
                        break;
                    default:
                        var auth = false;
                        break;
                }
                assert(auth, "Auth Failed");
            }
            var set;
            if (type == policyStatusEnum.rejected) {
                set = {
                    status: type,
                    onWatch: true
                };
            }
            else {
                set = {
                    status: type,
                };
            }
            yield policyVersionModel.updateOne({ _id: versionId }, {
                $set: set
            });
            yield policyModel.updateOne({ _id: version.policy }, {
                $set: set
            });
            var userEmail = yield userModel.findById(uId).select({ email: 1 });
            if (policy.assignees) {
                // Send To All
                yield Promise.all(policy.assignees.author.map((userId) => __awaiter(this, void 0, void 0, function* () {
                    if (uId == userId.toString())
                        return;
                    yield createNotification(userId, `policyId: ${version === null || version === void 0 ? void 0 : version.ID} status changed to ${type} by ${userEmail === null || userEmail === void 0 ? void 0 : userEmail.email}`);
                })));
                yield Promise.all(policy.assignees.reviewer.map((userId) => __awaiter(this, void 0, void 0, function* () {
                    if (uId == userId.toString())
                        return;
                    yield createNotification(userId, `policyId: ${version === null || version === void 0 ? void 0 : version.ID} status changed to ${type} by ${userEmail === null || userEmail === void 0 ? void 0 : userEmail.email}`);
                })));
                yield Promise.all(policy.assignees.approver.map((userId) => __awaiter(this, void 0, void 0, function* () {
                    if (uId == userId.toString())
                        return;
                    yield createNotification(userId, `policyId: ${version === null || version === void 0 ? void 0 : version.ID} status changed to ${type} by ${userEmail === null || userEmail === void 0 ? void 0 : userEmail.email}`);
                })));
            }
            var log = yield addLog({
                objectType: "policy",
                objectId: versionId,
                userId: uId,
                action: "update",
                description: `Updated policy status to ${type}`
            });
            if (log) {
                yield policyVersionModel.updateOne({ _id: version }, {
                    $push: {
                        logs: log._id
                    }
                });
            }
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
            var auth = yield checkRolePermissions(uId, [{
                    policy: {
                        edit: true
                    }
                }]);
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
            var log = yield addLog({
                objectType: "policy",
                objectId: id,
                userId: uId,
                action: "update",
                description: "Updated policy details"
            });
            if (log) {
                yield policyModel.updateOne({ _id: id }, {
                    $push: {
                        logs: log._id
                    }
                });
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
function unAssignUserToPolicyVersion(policyId_1, uId_1) {
    return __awaiter(this, arguments, void 0, function* (policyId, uId, assignees = {
        author: [], reviewer: [], approver: []
    }) {
        try {
            var policy = yield policyModel.exists({ _id: policyId });
            assert(policy, `No policy with id: ${policyId}`);
            var auth = yield isPolicyAssignee(policyId, uId);
            assert(auth, "Auth Failed");
            yield policyModel.updateOne({ _id: policy._id }, {
                $pullAll: {
                    'assignees.author': assignees.author,
                    'assignees.reviewer': assignees.reviewer,
                    'assignees.approver': assignees.approver,
                },
                updated_by: uId,
                updated_at: Date.now()
            });
            var log = yield addLog({
                objectType: "policy",
                objectId: policy._id,
                userId: uId,
                action: "delete",
                description: `Deleted users from policy `
            });
            if (log) {
                yield policyModel.updateOne({ _id: policy._id }, {
                    $push: {
                        logs: log._id
                    }
                });
            }
            return {
                status: true,
                msg: `Removed assignees from policy version ${policy._id}`,
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
                msg: "Can't remove assignees to policy",
            };
        }
    });
}
function deletePolicyVersion(policyId, versionId, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = yield policyModel.startSession();
        try {
            // auth 
            var auth = yield checkPolicyVersionAccessToUser(versionId, uId);
            assert(auth, "Auth Failed");
            // var version = await policyVersionModel.exists({ _id: versionId })
            // assert(version, `No policy with id: ${versionId}`)
            // var policy = policyModel.exists({ _id: id })
            // assert(policy, `No policy with id: ${id}`)
            session.startTransaction();
            yield policyModel.updateOne({ _id: policyId }, {
                $pull: {
                    "versions.active": versionId,
                    "versions.draft": versionId,
                }
            }, { session });
            yield policyVersionModel.findByIdAndDelete({ _id: versionId }, { session });
            var log = yield addLog({
                objectType: "policy",
                objectId: versionId,
                userId: uId,
                action: "delete",
                description: `Deleted policy policy version`
            });
            if (log) {
                yield policyVersionModel.updateOne({ _id: versionId }, {
                    $push: {
                        logs: log._id
                    }
                }, { session });
            }
            yield session.commitTransaction();
            if (!session.hasEnded)
                session.endSession();
            return {
                status: true,
                msg: "Policy version is Deleted"
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
            // var auth = await checkPolicyAccessToUser(id, uId)
            var auth = yield checkRolePermissions(uId, [{
                    policy: {
                        edit: true
                    }
                }]);
            console.log(auth);
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
            var log = yield addLog({
                objectType: "policy",
                objectId: id,
                userId: uId,
                action: "delete",
                description: `Removed policy tags `
            });
            if (log) {
                yield policyModel.updateOne({ _id: id }, {
                    $push: {
                        logs: log._id
                    }
                });
            }
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
function deletePolicyVersionComment(versionId, cId, uId) {
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
            const result = yield policyVersionModel.updateOne({ _id: versionId, comments: cId }, {
                $pull: { comments: cId },
                $set: { updated_at: Date.now(), updated_by: uId },
            });
            if (result.modifiedCount === 0) {
                return {
                    status: false,
                    msg: `No Comment of id: ${cId} in policy with id: ${versionId}`,
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
            var log = yield addLog({
                objectType: "policy",
                objectId: versionId,
                userId: uId,
                action: "delete",
                description: `Removed comments from policy`
            });
            if (log) {
                yield policyVersionModel.updateOne({ _id: versionId }, {
                    $push: {
                        logs: log._id
                    }
                });
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
            var auth = yield isPolicyAssignee(id, uId);
            assert(auth, "Auth Failed");
            var policy = yield policyModel.findById(id).select({ versions: 1, status: 1 });
            assert(policy, "Policy Not Found");
            assert((policy.status == policyStatusEnum.approved)
                ||
                    (policy.status == policyStatusEnum.draft), "Can't delete policy");
            yield policyModel.updateOne(policy._id, {
                $set: {
                    status: policyStatusEnum.deleted
                }
            });
            // remove tags associated with it
            var removed = yield rmOnePolicyFromManyTags(id, policy.tags, uId);
            assert(removed, "Tags not removed");
            var log = yield addLog({
                objectType: "policy",
                objectId: id,
                userId: uId,
                action: "delete",
                description: `Deleted policy `
            });
            if (log) {
                yield policyModel.updateOne({ _id: id }, {
                    $push: {
                        logs: log._id
                    }
                });
            }
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
function revivePolicy(id, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield isPolicyAssignee(id, uId);
            assert(auth, "Auth Failed");
            var policy = yield policyModel.findByIdAndUpdate(id, {
                $set: {
                    status: policyStatusEnum.draft
                }
            });
            if (!policy)
                return {
                    status: false,
                    msg: `No policy with id: ${id}`,
                };
            // remove tags associated with it
            var removed = yield rmOnePolicyFromManyTags(id, policy.tags, uId);
            assert(removed, "Tags not removed");
            var log = yield addLog({
                objectType: "policy",
                objectId: id,
                userId: uId,
                action: "update",
                description: `Policy Revived`
            });
            if (log) {
                yield policyModel.updateOne({ _id: id }, {
                    $push: {
                        logs: log._id
                    }
                });
            }
            return {
                status: true,
                msg: `Policy with id: ${id} was revived`,
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
function exportPolicyVersion(policyId, versionId, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            var policy = yield policyModel.findById(policyId).select({ title: 1 });
            assert(policy, "Policy not found");
            var version = yield policyVersionModel.findById(versionId);
            assert(version, "Policy version not found");
            var auth = yield checkRolePermissions(uId, [
                { policy: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            var data = yield pdfExport(policy.title, '', policy.title, (_a = version.assignees) === null || _a === void 0 ? void 0 : _a.author, version.ID);
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
export { createPolicy, createPolicyVersion, savePolicyVersionComments, assignUserToPolicy, addPolicyTags, createPolicyFromTemplate, getPolicy, getAllPolicy, getPolicyVersionComments, getPolicyVersion, getTotalCount, overview, updatePolicyVersionDetails, changePolicyVersionStatus, updatePolicyReminder, unAssignUserToPolicyVersion, deletePolicyVersion, deletePolicyVersionComment, deletePolicyTags, deletePolicy, revivePolicy, exportPolicyVersion };
