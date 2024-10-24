var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import assert, { AssertionError } from "assert";
import tagsModel from "../models/tagsModel.js";
import policyModel from "../models/policyModel.js";
import riskModel from "../models/riskModel.js";
// CREATE
function createTag(tagName, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var tag = yield tagsModel.create({ name: tagName });
            return tag._id.toString();
        }
        catch (error) {
            // console.log(error)
            return false;
        }
    });
}
function addOnePolicyToManyTags(pId_1, tags_1, uId_1) {
    return __awaiter(this, arguments, void 0, function* (pId, tags, uId, session = undefined) {
        // create unlisted tags in db
        var unlistedTags = [];
        try {
            if (tags.unlisted) {
                yield Promise.all(tags.unlisted.map((tagName) => __awaiter(this, void 0, void 0, function* () {
                    var _id = yield createTag(tagName, uId);
                    if (_id)
                        unlistedTags.push(_id);
                })));
            }
            // add tags to db
            var allTags = [...unlistedTags];
            if (tags.listed)
                allTags.push(...tags.listed);
            var update = yield tagsModel.updateMany({ _id: allTags }, { $addToSet: {
                    policies: pId
                } });
            assert(update.modifiedCount);
            return allTags;
        }
        catch (error) {
            return [];
        }
    });
}
function addOneProcedureToManyTags(pId_1, tags_1, uId_1) {
    return __awaiter(this, arguments, void 0, function* (pId, tags, uId, session = undefined) {
        // create unlisted tags in db
        var unlistedTags = [];
        try {
            if (tags.unlisted) {
                yield Promise.all(tags.unlisted.map((tagName) => __awaiter(this, void 0, void 0, function* () {
                    var _id = yield createTag(tagName, uId);
                    if (_id)
                        unlistedTags.push(_id);
                })));
            }
            // add tags to db
            var allTags = [...unlistedTags];
            if (tags.listed)
                allTags.push(...tags.listed);
            var update = yield tagsModel.updateMany({ _id: allTags }, { $addToSet: {
                    procedures: pId
                } });
            assert(update.modifiedCount);
            return allTags;
        }
        catch (error) {
            return [];
        }
    });
}
function addOneRiskToManyTags(riskId, tags, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        // create unlisted tags in db
        var unlistedTags = [];
        try {
            if (tags.unlisted) {
                yield Promise.all(tags.unlisted.map((tagName) => __awaiter(this, void 0, void 0, function* () {
                    var _id = yield createTag(tagName, uId);
                    if (_id)
                        unlistedTags.push(_id);
                })));
            }
            // add tags to db
            var allTags = [...unlistedTags];
            if (tags.listed)
                allTags.push(...tags.listed);
            var update = yield tagsModel.updateMany({ _id: allTags }, { $addToSet: {
                    risks: riskId
                } });
            assert(update.modifiedCount);
            return allTags;
        }
        catch (error) {
            console.log(error);
            return null;
        }
    });
}
function addOneControlToManyTags(riskId, tags, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        // create unlisted tags in db
        var unlistedTags = [];
        try {
            if (tags.unlisted) {
                yield Promise.all(tags.unlisted.map((tagName) => __awaiter(this, void 0, void 0, function* () {
                    var _id = yield createTag(tagName, uId);
                    if (_id)
                        unlistedTags.push(_id);
                })));
            }
            // add tags to db
            var allTags = [...unlistedTags];
            if (tags.listed)
                allTags.push(...tags.listed);
            var update = yield tagsModel.updateMany({ _id: allTags }, { $addToSet: {
                    controls: riskId
                } });
            assert(update.modifiedCount);
            return allTags;
        }
        catch (error) {
            console.log(error);
            return null;
        }
    });
}
// RETRIVE
function getAllTags() {
    return __awaiter(this, arguments, void 0, function* (page = 1, count = 10, tagName = "") {
        try {
            const tags = yield tagsModel.aggregate([
                { $match: { name: { $regex: tagName, $options: "i" } } },
                { $project: { name: 1 } },
                { $skip: (page - 1) * count },
                { $limit: count },
            ]);
            return {
                status: true,
                tags: tags,
            };
        }
        catch (error) {
            console.log(error);
            return {
                status: false,
                msg: "Error",
            };
        }
    });
}
function getTagPolicies(id_1) {
    return __awaiter(this, arguments, void 0, function* (id, page = 1, count = 10) {
        try {
            const tag = yield tagsModel.findById(id, {
                policies: { $slice: [(page - 1) * count, count] },
            });
            assert(tag, `No policies in tag with id: ${id}`);
            return {
                status: true,
                policies: tag === null || tag === void 0 ? void 0 : tag.policies,
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
function getTagRisks(riskId_1) {
    return __awaiter(this, arguments, void 0, function* (riskId, page = 1, count = 10) {
        try {
            const tag = yield riskModel.findById(riskId, {
                tags: { $slice: [(page - 1) * count, count] },
            }).populate("tags");
            assert(tag, `No risks in tag with id: ${riskId}`);
            return {
                status: true,
                tag: tag.tags,
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
// UPDATE
function updateTagName(id, uId, tName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var tag = yield tagsModel.exists({ _id: id });
            assert(tag, `No tag with id: ${id}`);
            yield tagsModel.updateOne({ _id: id }, { name: tName });
            return {
                status: true,
                msg: "Updated name of the tag",
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
// DELETE
function deleteTag(tagId, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var tag = yield tagsModel.findByIdAndDelete({ _id: tagId });
            assert(tag, `No tag with id: ${tagId}`);
            // remove tags from the policies
            if (tag.policies) {
                yield policyModel.updateMany({ _id: tag.policies }, { $pull: { tags: tagId } });
            }
            // remove tags from the risk
            if (tag.risks) {
                yield riskModel.updateMany({ _id: tag.policies }, { $pull: { tags: tagId } });
            }
            return {
                status: true,
                msg: "Deleted the tag",
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
function rmOneTagFromManyPolicy(id_1) {
    return __awaiter(this, arguments, void 0, function* (id, policies = [], uId) {
        try {
            var tag = yield tagsModel.exists({ _id: id });
            assert(tag, `No tag with id: ${id}`);
            yield tagsModel.updateOne({ _id: id }, { $pull: { policies: {
                        $in: policies
                    } } });
            return {
                status: true,
                msg: "Deleted Policies in tag",
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
function rmOnePolicyFromManyTags(pId, tagsId, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield tagsModel.updateMany({ _id: tagsId }, { $pull: { policies: pId } });
            return true;
        }
        catch (error) {
            return false;
        }
    });
}
function rmOneProcedureFromManyTags(pId, tagsId, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield tagsModel.updateMany({ _id: tagsId }, { $pull: { procedures: pId } });
            return true;
        }
        catch (error) {
            return false;
        }
    });
}
function rmOneRiskFromManyTags(riskId, tagsId, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield tagsModel.updateMany({ _id: tagsId }, { $pull: { risks: riskId } });
            return true;
        }
        catch (error) {
            return false;
        }
    });
}
function rmOneControlFromManyTags(riskId, tagsId, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield tagsModel.updateMany({ _id: tagsId }, { $pull: { controls: riskId } });
            return true;
        }
        catch (error) {
            return false;
        }
    });
}
export { addOnePolicyToManyTags, addOneRiskToManyTags, addOneProcedureToManyTags, 
// addOneTagToManyRisks,
getAllTags, getTagPolicies, updateTagName, deleteTag, rmOneTagFromManyPolicy, rmOnePolicyFromManyTags, rmOneProcedureFromManyTags, 
// rmOneTagFromManyRisks,
getTagRisks };
