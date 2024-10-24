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
import evidencesModel from "../models/evidencesModel.js";
import controlsModel from "../models/controlsModel.js";
import riskModel from "../models/riskModel.js";
// CREATE
function createEvidence({ name, frequency, assets, url }, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // TODO: auth code
            var evidence = yield evidencesModel.create({
                name, frequency, assets, url, assignee: [uId]
            });
            return {
                status: true,
                msg: evidence.id
            };
        }
        catch (error) {
            if (error.name === "MongoServerError" && error.code === 11000)
                return {
                    status: false,
                    msg: "Name is dublicate",
                };
            return {
                status: false,
                msg: "Error"
            };
        }
    });
}
// LINKING
function addOneEvidenceToManyControls({ evidenceId, controls }, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // TODO: Auth check
            var evidence = yield evidencesModel.exists({ _id: evidenceId });
            assert(evidence, "Evidence not found");
            // check if controls exists
            yield Promise.all(controls.map((controlId) => __awaiter(this, void 0, void 0, function* () {
                assert(yield controlsModel.exists({ _id: controlId }), "Control not found");
            })));
            var update = yield evidencesModel.updateOne({ _id: evidenceId }, {
                $set: {
                    updatedAt: Date.now(), updatedBy: uId
                },
                $addToSet: {
                    controls: controls
                }
            });
            var update = yield controlsModel.updateMany({ _id: controls }, {
                $addToSet: {
                    evidences: evidenceId
                }
            });
            return {
                status: true,
                msg: "Evidence linked to Controls"
            };
        }
        catch (error) {
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message
                };
            }
            return {
                status: false,
                msg: "Error"
            };
        }
    });
}
function addOneEvidenceToManyRisk({ evidenceId, risks }, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // TODO: Auth check
            var evidence = yield evidencesModel.exists({ _id: evidenceId });
            assert(evidence, "Evidence not found");
            // check if risks exists
            yield Promise.all(risks.map((controlId) => __awaiter(this, void 0, void 0, function* () {
                assert(yield riskModel.exists({ _id: controlId }), "Risk not found");
            })));
            var update = yield evidencesModel.updateOne({ _id: evidenceId }, {
                $set: {
                    updatedAt: Date.now(), updatedBy: uId
                },
                $addToSet: {
                    risks: risks
                }
            });
            var update = yield riskModel.updateMany({ _id: risks }, {
                $addToSet: {
                    evidences: evidenceId
                }
            });
            return {
                status: true,
                msg: "Evidence linked to risk"
            };
        }
        catch (error) {
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message
                };
            }
            return {
                status: false,
                msg: "Error"
            };
        }
    });
}
function addEvidenceAssignee({ evidenceId = "", assignee = [] }, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // TODO: auth ?
            var evidence = yield evidencesModel.exists({ _id: evidenceId });
            assert(evidence, "Evidence not found");
            yield evidencesModel.updateOne({ _id: evidenceId }, {
                $set: {
                    updatedAt: Date.now(), updatedBy: uId
                },
                $addToSet: {
                    assignee
                }
            });
            return {
                status: true,
                msg: "Added evidence assignees",
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
// RETRIVE
function getAllEvidences({ name, page, count }, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const evidences = yield evidencesModel.aggregate([
                { $match: { name: { $regex: name, $options: "i" } } },
                { $skip: (page - 1) * count },
                { $limit: count },
            ]);
            yield evidencesModel.populate(evidences, { path: "risks", select: { name: 1 } });
            yield evidencesModel.populate(evidences, { path: "controls", select: { name: 1 } });
            return {
                status: true,
                evidences: evidences,
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
// UPDATE
function updateBasicEvidence({ evidenceId, name, frequency, url }, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // TODO: auth ?
            var evidence = yield evidencesModel.exists({ _id: evidenceId });
            assert(evidence, "Evidence not found");
            yield evidencesModel.updateOne({ _id: evidenceId }, {
                $set: {
                    name, frequency, url, updatedAt: Date.now(), updatedBy: uId
                }
            });
            return {
                status: true,
                msg: "Evidence update",
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
function deleteEvidence(evidenceId, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // TODO: auth check ?
            var evidence = yield evidencesModel.findByIdAndDelete({ _id: evidenceId });
            assert(evidence, `No evidence with id: ${evidenceId}`);
            // remove evidences from the risk
            if (evidence.risks) {
                yield riskModel.updateMany({ _id: evidence.risks }, { $pull: { evidences: evidenceId } });
            }
            // remove evidences from the risk
            if (evidence.controls) {
                yield riskModel.updateMany({ _id: evidence.controls }, { $pull: { evidences: evidenceId } });
            }
            return {
                status: true,
                msg: "Deleted the evidence",
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
function rmOneEvidenceFromManyControls({ evidenceId, controls }, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // TODO: Auth check
            var evidence = yield evidencesModel.exists({ _id: evidenceId });
            assert(evidence, "Evidence not found");
            // check if controls exists
            yield Promise.all(controls.map((controlId) => __awaiter(this, void 0, void 0, function* () {
                assert(yield controlsModel.exists({ _id: controlId }), "Control not found");
            })));
            var update = yield evidencesModel.updateOne({ _id: evidenceId }, {
                $set: {
                    updatedAt: Date.now(), updatedBy: uId
                },
                $pull: {
                    controls: controls
                }
            });
            var update = yield controlsModel.updateMany({ _id: controls }, {
                $pull: {
                    evidences: evidenceId
                }
            });
            return {
                status: true,
                msg: "Evidence unlinked to Controls"
            };
        }
        catch (error) {
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message
                };
            }
            return {
                status: false,
                msg: "Error"
            };
        }
    });
}
function rmOneEvidenceFromManyRisks({ evidenceId, risks }, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // TODO: Auth check
            var evidence = yield evidencesModel.exists({ _id: evidenceId });
            assert(evidence, "Evidence not found");
            // check if risks exists
            yield Promise.all(risks.map((controlId) => __awaiter(this, void 0, void 0, function* () {
                assert(yield riskModel.exists({ _id: controlId }), "Risk not found");
            })));
            var update = yield evidencesModel.updateOne({ _id: evidenceId }, {
                $set: {
                    updatedAt: Date.now(), updatedBy: uId
                },
                $pull: {
                    risks: risks
                }
            });
            var update = yield riskModel.updateMany({ _id: risks }, {
                $pull: {
                    evidences: evidenceId
                }
            });
            return {
                status: true,
                msg: "Evidence unlinked to risk"
            };
        }
        catch (error) {
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message
                };
            }
            return {
                status: false,
                msg: "Error"
            };
        }
    });
}
function rmEvidenceAssignee({ evidenceId, assignee = [] }, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // TODO: Auth check
            var evidence = yield evidencesModel.exists({ _id: evidenceId });
            assert(evidence, "Evidence not found");
            var update = yield evidencesModel.updateOne({ _id: evidenceId }, {
                $set: {
                    updatedAt: Date.now(), updatedBy: uId
                },
                $pull: {
                    assignee: assignee
                }
            });
            return {
                status: true,
                msg: "Assignee removed from evidence"
            };
        }
        catch (error) {
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message
                };
            }
            return {
                status: false,
                msg: "Error"
            };
        }
    });
}
export { createEvidence, addEvidenceAssignee, addOneEvidenceToManyControls, addOneEvidenceToManyRisk, getAllEvidences, updateBasicEvidence, deleteEvidence, rmEvidenceAssignee, rmOneEvidenceFromManyControls, rmOneEvidenceFromManyRisks };
