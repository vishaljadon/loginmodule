var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

import riskTagModel from "../models/riskTagsModel.js";

function createRiskTag(uId, tName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var tag = yield riskTagModel.create({
                name: tName,
            });
            return {
                status: true,
                tag: riskTag.id,
            };
        }
        catch (error) {
            return {
                status: false,
                msg: "Error",
            };
        }
    });
}
function addOneTagToManyRisks(id, uId, risks = []) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var tag = yield riskTagModel.exists({ _id: id });
            if (!tag)
                return {
                    status: false,
                    msg: `No tag with id: ${id}`,
                };
            yield tagsModel.updateOne({ _id: id }, { $addToSet: { policies: { $each: risks } } });
            return {
                status: true,
                msg: "Updated risks in tag",
            };
        }
        catch (error) {
            return {
                status: false,
                msg: "Error",
            };
        }
    });
}
function addOneRiskToManyTags(riskId, riskTags, uId, session) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield Promise.all(tags.map((tag) => __awaiter(this, void 0, void 0, function* () {
                yield tagsModel.updateOne({ _id: tag }, { $addToSet: { policies: pId } }, { session });
            })));
            return true;
        }
        catch (error) {
            return false;
        }
    });
}
// RETRIVE
function getAllRiskTags(page = 1, count = 10) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tags = yield riskTagModel.aggregate([
                { $project: { risks: 0, "__v": 0 } },
                { $skip: (page - 1) * count },
                { $limit: count },
            ]);
            return {
                status: true,
                tags: riskTags,
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
function getTagRisks(id, page = 1, count = 10) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const riskTag = yield riskTagModel.findById(id, {
                policies: { $slice: [(page - 1) * count, count] },
            });
            if (!riskTag) {
                return {
                    status: false,
                    msg: `No policies in tag with id: ${id}`,
                };
            }
            return {
                status: true,
                policies: riskTag.risks,
            };
        }
        catch (error) {
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
            var tag = yield riskTagModel.exists({ _id: id });
            if (!tag)
                return {
                    status: false,
                    msg: `No tag with id: ${id}`,
                };
            yield riskTagModel.updateOne({ _id: id }, { name: tName });
            return {
                status: true,
                msg: "Updated name of the tag",
            };
        }
        catch (error) {
            return {
                status: false,
                msg: "Error",
            };
        }
    });
}
// DELETE
function deleteTag(id, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var tag = yield riskTagModel.findByIdAndDelete({ _id: id });
            if (!tag)
                return {
                    status: false,
                    msg: `No tag with id: ${id}`,
                };
            return {
                status: true,
                msg: "Deleted the tag",
            };
        }
        catch (error) {
            return {
                status: false,
                msg: "Error",
            };
        }
    });
}
function rmOneTagFromManyRisks(id, risks = [], uId, session = null) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var tag = yield riskTagModel.exists({ _id: id });
            if (!tag)
                return {
                    status: false,
                    msg: `No tag with id: ${id}`,
                };
            var tmpSession;
            if (!session) {
                tmpSession = yield riskTagModel.startSession();
                tmpSession.startTransaction();
            }
            yield riskTagModel.updateOne({ _id: id }, { $pullAll: { risks: risks } }, { session: session || tmpSession });
            yield tmpSession.commitTransaction();
            return {
                status: true,
                msg: "Deleted Risks in tag",
            };
        }
        catch (error) {
            return {
                status: false,
                msg: "Error",
            };
        }
        finally {
            if (session)
                session.endSession();
            tmpSession.endSession();
        }
    });
}
function rmOneRisksFromManyTags(riskId, riskTags, uId, session) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield Promise.all(riskTags.map((tag) => __awaiter(this, void 0, void 0, function* () {
                yield createRiskTag.updateOne({ _id: tag }, { $pull: { policies: pId } }, { session });
            })));
            return true;
        }
        catch (error) {
            return false;
        }
    });
}
export { createRiskTag, addOneTagToManyRisks, addOneRiskToManyTags, getAllRiskTags, getTagRisks, updateTagName, deleteTag, rmOneTagFromManyRisks, rmOneRisksFromManyTags };
