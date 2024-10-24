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
import evidencesModel, { frequencies } from "../models/evidencesModel.js";
import controlsModel from "../models/controlsModel.js";
import riskModel from "../models/riskModel.js";
import filesModel from "../models/filesModel.js";
import { isAValidUrl } from "../../utils/functions.js";
import userModel from "../models/userModel.js";
// CREATE
function createEvidence(data, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // TODO: auth code
            if (data.url) {
                assert(data.url instanceof Array, "URL should be an array");
                data.url.map(_u => {
                    return assert(isAValidUrl(_u), "Not a valid URL");
                });
            }
            if (data.assignee) {
                assert(data.assignee instanceof Array, "Assignee should be an array");
                assert(data.assignee.length <= 3, "Assignees can't be more than 3");
                yield Promise.all(data.assignee.map((_user) => __awaiter(this, void 0, void 0, function* () {
                    return assert(yield userModel.exists({ _id: _user }), "Assignees not found");
                })));
            }
            else {
                data.assignee = [uId];
            }
            if (data.files) {
                assert(data.files instanceof Array, "Files should be an array");
                yield Promise.all(data.files.map((file) => __awaiter(this, void 0, void 0, function* () {
                    assert(yield filesModel.exists({ _id: file }), "Attachment not found");
                })));
            }
            var evidence = yield evidencesModel.create(data);
            if (data.controls) {
                yield controlsModel.updateMany({ _id: data.controls }, {
                    $addToSet: {
                        evidences: evidence._id
                    }
                });
            }
            if (data.risks) {
                yield riskModel.updateMany({ _id: data.risks }, {
                    $addToSet: {
                        evidences: evidence._id
                    }
                });
            }
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
            if (error instanceof AssertionError)
                return {
                    status: false,
                    msg: error.message,
                };
            console.log(error);
            return {
                status: false,
                msg: "Error"
            };
        }
    });
}
// LINKING
function addOneEvidenceToManyControls(_a, uId_1) {
    return __awaiter(this, arguments, void 0, function* ({ evidenceId, controls }, uId) {
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
function addOneEvidenceToManyRisk(_a, uId_1) {
    return __awaiter(this, arguments, void 0, function* ({ evidenceId, risks }, uId) {
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
function addEvidenceAssignee(_a, uId_1) {
    return __awaiter(this, arguments, void 0, function* ({ evidenceId = "", assignee = [] }, uId) {
        try {
            // TODO: auth ?
            var evidence = yield evidencesModel.exists({ _id: evidenceId });
            assert(evidence, "Evidence not found");
            yield Promise.all(assignee.map((user) => __awaiter(this, void 0, void 0, function* () {
                assert(yield userModel.exists({ _id: user }), "Users not found");
            })));
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
function addEvidenceFiles(_a, uId_1) {
    return __awaiter(this, arguments, void 0, function* ({ evidenceId = "", files = [] }, uId) {
        try {
            // TODO: auth ?
            var evidence = yield evidencesModel.exists({ _id: evidenceId });
            assert(evidence, "Evidence not found");
            yield Promise.all(files.map((file) => __awaiter(this, void 0, void 0, function* () {
                assert(yield filesModel.exists({ _id: file }), "Attachment not found");
            })));
            yield evidencesModel.updateOne({ _id: evidenceId }, {
                $set: {
                    updatedAt: Date.now(), updatedBy: uId
                },
                $addToSet: {
                    files
                }
            });
            return {
                status: true,
                msg: "Added evidence files",
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
                msg: "Error",
            };
        }
    });
}
// RETRIVE
function getAllEvidences(_a, uId_1) {
    return __awaiter(this, arguments, void 0, function* ({ name = "", page = 1, count = 5 }, uId) {
        try {
            const evidences = yield evidencesModel.aggregate([
                { $project: { name: 1 } },
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
function getEvidence(evidenceId, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const evidence = yield evidencesModel
                .findById(evidenceId)
                .populate("risks", "title")
                .populate("controls", "nameId name")
                .populate("assignee", "email")
                .populate("files", "name");
            return {
                status: true,
                evidence
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
function updateBasicEvidence(_a, uId_1) {
    return __awaiter(this, arguments, void 0, function* ({ evidenceId, name, frequency, url }, uId) {
        try {
            // TODO: auth ?
            var evidence = yield evidencesModel.exists({ _id: evidenceId });
            assert(evidence, "Evidence not found");
            if (url)
                assert(isAValidUrl(url), "not a valid URL");
            assert(frequencies[frequency], "Undefined frequency");
            yield evidencesModel.updateOne({ _id: evidenceId }, {
                $set: {
                    name, frequency, url, updatedAt: Date.now(), updatedBy: uId
                }
            }, { runValidators: true });
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
            console.log(error);
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
                yield riskModel.updateMany({ _id: evidence.risks }, { $pullAll: { evidences: evidenceId } });
            }
            // remove evidences from the risk
            if (evidence.controls) {
                yield riskModel.updateMany({ _id: evidence.controls }, { $pullAll: { evidences: evidenceId } });
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
function rmOneEvidenceFromManyControls(_a, uId_1) {
    return __awaiter(this, arguments, void 0, function* ({ evidenceId, controls }, uId) {
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
                $pullAll: {
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
function rmOneEvidenceFromManyRisks(_a, uId_1) {
    return __awaiter(this, arguments, void 0, function* ({ evidenceId, risks }, uId) {
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
                $pullAll: {
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
function rmEvidenceAssignee(_a, uId_1) {
    return __awaiter(this, arguments, void 0, function* ({ evidenceId, assignee = [] }, uId) {
        try {
            // TODO: Auth check
            var evidence = yield evidencesModel.exists({ _id: evidenceId });
            assert(evidence, "Evidence not found");
            var update = yield evidencesModel.updateOne({ _id: evidenceId }, {
                $set: {
                    updatedAt: Date.now(), updatedBy: uId
                },
                $pullAll: {
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
function rmEvidenceFiles(_a, uId_1) {
    return __awaiter(this, arguments, void 0, function* ({ evidenceId, files = [] }, uId) {
        try {
            // TODO: Auth check
            var evidence = yield evidencesModel.exists({ _id: evidenceId });
            assert(evidence, "Evidence not found");
            var update = yield evidencesModel.updateOne({ _id: evidenceId }, {
                $set: {
                    updatedAt: Date.now(), updatedBy: uId
                },
                $pullAll: {
                    files
                }
            });
            return {
                status: true,
                msg: "Files removed from evidence"
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
export { createEvidence, getEvidence, addEvidenceAssignee, addOneEvidenceToManyControls, addOneEvidenceToManyRisk, addEvidenceFiles, getAllEvidences, updateBasicEvidence, deleteEvidence, rmEvidenceAssignee, rmOneEvidenceFromManyControls, rmOneEvidenceFromManyRisks, rmEvidenceFiles };
