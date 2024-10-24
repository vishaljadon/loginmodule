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
import complianceModel from "../models/frameworksModel.js";
import controlGroupModel from "../models/controlGroupsModel.js";
import controlStatusModel from "../models/controlStatusModel.js";
import controlsModel from "../models/controlsModel.js";
import evidencesModel from "../models/evidencesModel.js";
import userModel from "../models/userModel.js";
import filesModel from "../models/filesModel.js";
import riskModel from "../models/riskModel.js";
import predefinedEvidencesModel from "../models/predefinedEvidences.js";
import projectModel from "../models/projectModel.js";
import policyModel from "../models/policyModel.js";
function createFramework(framework) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield complianceModel.insertMany(framework);
            // var data = await complianceModel.create({
            //     frameworkname, description
            // })
            return {
                status: true,
                msg: "frameworks created",
                result
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
                msg: "Error",
            };
        }
    });
}
function getAllFrameworks(uId_1, _page_1, _count_1) {
    return __awaiter(this, arguments, void 0, function* (uId, _page, _count, sort = { field: "updated_at", order: "asc" }, search = "") {
        try {
            // Permission check here
            var page = parseInt(_page) || 1;
            var count = parseInt(_count) || 10;
            const pipeline = [];
            const startTime = performance.now();
            if (!!search) {
                pipeline.push({
                    $match: {
                        $or: [
                            {
                                frameworkname: { $regex: search, $options: "i" }
                            },
                            { ID: { $regex: search, $options: "i" } }
                        ]
                    }
                });
            }
            if (sort.field) {
                pipeline.push({
                    $sort: { [sort.field]: sort.order === "asc" ? 1 : -1 }
                });
            }
            pipeline.push({ $skip: (page - 1) * count }, { $limit: count });
            const compliance = yield complianceModel.aggregate(pipeline).explain("executionStats");
            const endTime = performance.now();
            const timeTaken = endTime - startTime;
            console.log(`Time Taken: ${timeTaken.toFixed(2)} ms`);
            const totalCount = yield complianceModel.countDocuments();
            return {
                status: true,
                data: {
                    framework: compliance,
                    count: totalCount
                }
            };
        }
        catch (error) {
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message,
                };
            }
            return {
                status: false,
                msg: "Error",
            };
        }
    });
}
function getAllControls(uId_1, frameworkId_1, _page_1, _count_1) {
    return __awaiter(this, arguments, void 0, function* (uId, frameworkId, _page, _count, sort = { field: "updated_at", order: "asc" }, search = "") {
        try {
            var data = yield complianceModel.findById({ frameworkId }).populate('controls');
            assert(data, "framework not found");
            var group = yield controlGroupModel.find({});
            console.log(group);
            return {
                status: true
            };
        }
        catch (error) {
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message,
                };
            }
            return {
                status: false,
                msg: "Error",
            };
        }
    });
}
function getControl(uId, frameworkId, controlId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var data = yield complianceModel.findById({ frameworkId });
            assert(data, "framework not found");
            var control = yield complianceModel.findById({ controlId });
            assert(data, "control not found");
            return {
                status: true,
                data: {
                    control
                }
            };
        }
        catch (error) {
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message,
                };
            }
            return {
                status: false,
                msg: "Error",
            };
        }
    });
}
function createControlStaus(controlId, scope, justification) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const controlExists = yield controlsModel.findById(controlId);
            if (!controlExists) {
                return {
                    status: false,
                    msg: "Control not found",
                };
            }
            const newControlStatus = yield controlStatusModel.create({
                controlId,
                scope,
                justification
            });
            return {
                status: true,
                msg: "Control status created successfully",
                data: newControlStatus
            };
        }
        catch (error) {
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message,
                };
            }
            return {
                status: false,
                msg: "Error",
            };
        }
    });
}
function getAllControlStatus(uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("hello");
            var control = yield controlStatusModel.find({});
            // if(!data){
            //     console.log(data)
            //     return {
            //         status:false,
            //         msg:"control not find"
            //     }
            // }
            return {
                status: true,
                msg: "control status found",
                data: {
                    control
                }
            };
        }
        catch (error) {
            console.log(error);
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message,
                };
            }
            return {
                status: false,
                msg: "Error",
            };
        }
    });
}
function getControlStatus(controlId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const control = yield controlsModel.findById(controlId);
            if (!control) {
                return {
                    status: false,
                    msg: "Control not found"
                };
            }
            const data = yield controlStatusModel.findOne({ controlId: control._id });
            if (!data) {
                return {
                    status: false,
                    msg: "Control status not found"
                };
            }
            return {
                status: true,
                msg: "Control status retrieved successfully",
                data
            };
        }
        catch (error) {
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message,
                };
            }
            return {
                status: false,
                msg: "Error",
            };
        }
    });
}
function addProjectToControlStatus(conStatusId_1) {
    return __awaiter(this, arguments, void 0, function* (conStatusId, projects = []) {
        try {
            console.log(projects);
            var data = yield controlStatusModel.exists({ _id: conStatusId });
            assert(data, "control status not found");
            yield Promise.all(projects.map((project) => __awaiter(this, void 0, void 0, function* () {
                assert(yield projectModel.exists({ _id: project }), "Project not found");
            })));
            var update = yield controlStatusModel.updateOne({ _id: conStatusId }, {
                $set: {
                    updatedAt: Date.now()
                },
                $addToSet: {
                    projects
                }
            });
            console.log(update);
            return {
                status: true,
                msge: "Project added to the control status"
            };
        }
        catch (error) {
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message,
                };
            }
            return {
                status: false,
                msg: "Error",
            };
        }
    });
}
function addPolicyToControlStatus(controlId_1) {
    return __awaiter(this, arguments, void 0, function* (controlId, policy = []) {
        try {
            var data = yield controlStatusModel.findById({ _id: controlId });
            assert(data, "evidence not found");
            yield Promise.all(policy.map((policy) => __awaiter(this, void 0, void 0, function* () {
                assert(yield policyModel.exists({ _id: policy }), "Policy not found");
            })));
            yield controlStatusModel.updateOne({ _id: controlId }, {
                $set: {
                    updatedAt: Date.now()
                },
                $addToSet: {
                    policy
                }
            });
            return {
                status: true,
                msge: "policy added to the control status"
            };
        }
        catch (error) {
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message,
                };
            }
            return {
                status: false,
                msg: "Error",
            };
        }
    });
}
function addRisksToControlStatus(controlId_1) {
    return __awaiter(this, arguments, void 0, function* (controlId, risks = []) {
        try {
            var data = yield controlStatusModel.findById({ _id: controlId });
            assert(data, "evidence not found");
            yield Promise.all(risks.map((risk) => __awaiter(this, void 0, void 0, function* () {
                assert(yield riskModel.exists({ _id: risk }), "Risks not found");
            })));
            yield controlStatusModel.updateOne({ _id: controlId }, {
                $set: {
                    updatedAt: Date.now()
                },
                $addToSet: {
                    risks
                }
            });
            return {
                status: true,
                msge: "Risk added to the control status"
            };
        }
        catch (error) {
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message,
                };
            }
            return {
                status: false,
                msg: "Error",
            };
        }
    });
}
function addEvidenceToControlStatus(controlId_1) {
    return __awaiter(this, arguments, void 0, function* (controlId, evidence = []) {
        try {
            var data = yield controlStatusModel.findById({ _id: controlId });
            assert(data, "evidence not found");
            yield Promise.all(evidence.map((evidence) => __awaiter(this, void 0, void 0, function* () {
                assert(yield evidencesModel.exists({ _id: evidence }), " evidence not found");
            })));
            yield controlStatusModel.updateOne({ _id: controlId }, {
                $set: {
                    updatedAt: Date.now()
                },
                $addToSet: {
                    evidence
                }
            });
            return {
                status: true,
                msge: " evidence added to the control status"
            };
        }
        catch (error) {
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message,
                };
            }
            return {
                status: false,
                msg: "Error",
            };
        }
    });
}
// delete
function remControlStatusProject(controlId_1) {
    return __awaiter(this, arguments, void 0, function* (controlId, projects = []) {
        try {
            var control = yield controlStatusModel.exists({ _id: controlId });
            assert(control, "control not found");
            yield controlStatusModel.updateOne({ _id: controlId }, {
                $set: { updatedAt: Date.now() },
                $pullAll: {
                    projects
                }
            });
            return {
                status: true,
                msg: "projects remove from control status"
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
function remControlStatusPolicy(controlId_1) {
    return __awaiter(this, arguments, void 0, function* (controlId, policy = []) {
        try {
            var control = yield controlStatusModel.exists({ _id: controlId });
            assert(control, "control not found");
            yield controlStatusModel.updateOne({ _id: controlId }, {
                $set: { updatedAt: Date.now() },
                $pullAll: {
                    policy
                }
            });
            return {
                status: true,
                msg: "Policy removed from control status"
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
function remControlStatusRisk(controlId_1) {
    return __awaiter(this, arguments, void 0, function* (controlId, risks = []) {
        try {
            var control = yield controlStatusModel.exists({ _id: controlId });
            assert(control, "control not found");
            yield controlStatusModel.updateOne({ _id: controlId }, {
                $set: { updatedAt: Date.now() },
                $pullAll: {
                    risks
                }
            });
            return {
                status: true,
                msg: "risk remove from control status"
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
function remControlStatusEvidence(controlId_1) {
    return __awaiter(this, arguments, void 0, function* (controlId, evidence = []) {
        try {
            var control = yield controlStatusModel.exists({ _id: controlId });
            assert(control, "control not found");
            yield controlStatusModel.updateOne({ _id: controlId }, {
                $set: { updatedAt: Date.now() },
                $pullAll: {
                    evidence
                }
            });
            return {
                status: true,
                msg: "evidence added to the control status"
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
function updateControlStatus(controlId, scope, justification) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var control = yield controlsModel.findById(controlId);
            if (!control) {
                console.log(control);
                return {
                    status: false,
                    msg: "Control not found"
                };
            }
            const contstatus = yield controlStatusModel.findOne({ controlId: control._id });
            if (!contstatus) {
                return {
                    status: false,
                    msg: "id not found"
                };
            }
            yield controlStatusModel.findByIdAndUpdate({ _id: contstatus._id }, { scope, justification });
            return {
                status: true,
                msg: "control updated successfully"
            };
        }
        catch (error) {
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message,
                };
            }
            return {
                status: false,
                msg: "Error",
            };
        }
    });
}
function createEvidence(uId, evidenceName, frequency, assignees) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var data = yield complianceModel.create({
                evidenceName,
                frequency,
                assignees
            });
            return {
                status: true,
                msg: "Evidence created successfully",
            };
        }
        catch (error) {
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message,
                };
            }
            return {
                status: false,
                msg: "Error",
            };
        }
    });
}
function attachFile(uId, evidenceId, files) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var data = yield complianceModel.findById({ evidenceId });
            assert(data, "evidence not found");
            return {
                status: true,
                msg: "file attached successfully",
            };
        }
        catch (error) {
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message,
                };
            }
            return {
                status: false,
                msg: "Error",
            };
        }
    });
}
function createPredefinedEvidence(name, description) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var data = yield predefinedEvidencesModel.create({
                name, description
            });
            return {
                status: true,
                msg: "frameworks created",
            };
        }
        catch (error) {
            console.log(error);
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message
                };
            }
            return {
                status: false,
                msg: "Error",
            };
        }
    });
}
function getAllPredefinedEvidence(uId_1, _page_1, _count_1) {
    return __awaiter(this, arguments, void 0, function* (uId, _page, _count, sort = { field: "updated_at", order: "asc" }, search = "") {
        try {
            // Permission check here
            var page = parseInt(_page) || 1;
            var count = parseInt(_count) || 10;
            const pipeline = [];
            if (!!search) {
                pipeline.push({
                    $match: {
                        $or: [
                            { name: { $regex: search, $options: "i" } },
                            { ID: { $regex: search, $options: "i" } }
                        ]
                    }
                });
            }
            if (sort.field) {
                pipeline.push({
                    $sort: { [sort.field]: sort.order === "asc" ? 1 : -1 }
                });
            }
            pipeline.push({ $skip: (page - 1) * count }, { $limit: count });
            const evidence = yield predefinedEvidencesModel.aggregate(pipeline);
            const totalCount = yield predefinedEvidencesModel.countDocuments();
            return {
                status: true,
                data: {
                    evidence: evidence,
                    count: totalCount
                }
            };
        }
        catch (error) {
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message,
                };
            }
            return {
                status: false,
                msg: "Error",
            };
        }
    });
}
function enablePredefinedEvidence(evidenceId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var evidence = yield predefinedEvidencesModel.findById(evidenceId);
            assert(evidence, "evidence not found");
            if (evidence === null || evidence === void 0 ? void 0 : evidence.enabled) {
                return {
                    status: false,
                    msg: "evidence already enable"
                };
            }
            yield predefinedEvidencesModel.findByIdAndUpdate(evidenceId, { $set: { enabled: true, updatedAt: Date.now() } });
            return {
                status: true,
                msg: "evidence enabled successfully"
            };
        }
        catch (error) {
            console.log(error);
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message,
                };
            }
            return {
                status: false,
                msg: "Error",
            };
        }
    });
}
function disablePredefinedEvidence(evidenceId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var evidence = yield predefinedEvidencesModel.findById(evidenceId);
            assert(evidence, "evidence not found");
            if (!(evidence === null || evidence === void 0 ? void 0 : evidence.enabled)) {
                return {
                    status: false,
                    msg: "evidence already disable"
                };
            }
            yield predefinedEvidencesModel.findByIdAndUpdate(evidenceId, { $set: { enabled: false, updatedAt: Date.now() } });
            return {
                status: true,
                msg: "evidence disabled successfully"
            };
        }
        catch (error) {
            console.log(error);
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message,
                };
            }
            return {
                status: false,
                msg: "Error",
            };
        }
    });
}
function getPredefinedEvidence(evidenceId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var data = yield predefinedEvidencesModel.findById(evidenceId);
            assert(data, "evidence not found");
            if (data === null || data === void 0 ? void 0 : data.enabled) {
                return {
                    status: true,
                    data
                };
            }
            return {
                status: false,
                msg: "evidence is not enabled"
            };
        }
        catch (error) {
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message,
                };
            }
            return {
                status: false,
                msg: "Error",
            };
        }
    });
}
function assignUserToPredefinedEvidence(evidenceId_1) {
    return __awaiter(this, arguments, void 0, function* (evidenceId, assignee = []) {
        try {
            var data = yield predefinedEvidencesModel.findById(evidenceId);
            assert(data, "evidence not found");
            if (!data.enabled) {
                return {
                    status: false,
                    msg: "cannot assign user to disabled evidence"
                };
            }
            yield Promise.all(assignee.map((assignee) => __awaiter(this, void 0, void 0, function* () {
                assert(yield userModel.exists({ _id: assignee }), "Assignee not found");
            })));
            yield predefinedEvidencesModel.updateOne({ _id: evidenceId }, {
                $set: { updatedAt: Date.now() },
                $addToSet: {
                    assignee
                }
            });
            return {
                status: true,
                msge: "Added evidence files"
            };
        }
        catch (error) {
            console.log(error);
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message,
                };
            }
            return {
                status: false,
                msg: "Error",
            };
        }
    });
}
function addEvidenceFile(evidenceId_1) {
    return __awaiter(this, arguments, void 0, function* (evidenceId, files = []) {
        try {
            var data = yield predefinedEvidencesModel.findById({ _id: evidenceId });
            assert(data, "evidence not found");
            if (!data.enabled) {
                return {
                    status: false,
                    msg: "evidence not enabled"
                };
            }
            yield Promise.all(files.map((file) => __awaiter(this, void 0, void 0, function* () {
                assert(yield filesModel.exists({ _id: file }), "Attachment not found");
            })));
            yield predefinedEvidencesModel.updateOne({ _id: evidenceId }, {
                $set: {
                    updatedAt: Date.now()
                },
                $addToSet: {
                    files
                }
            });
            return {
                status: true,
                msge: "Files added to the evidence"
            };
        }
        catch (error) {
            console.log(error);
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message,
                };
            }
            return {
                status: false,
                msg: "Error",
            };
        }
    });
}
function addControl(evidenceId_1) {
    return __awaiter(this, arguments, void 0, function* (evidenceId, controls = []) {
        try {
            var data = yield predefinedEvidencesModel.findById(evidenceId);
            assert(data, "evidence not found");
            if (!data.enabled) {
                return {
                    status: false,
                    msg: "evidence not enabled"
                };
            }
            console.log(controls);
            yield Promise.all(controls.map((control) => __awaiter(this, void 0, void 0, function* () {
                assert(yield controlsModel.exists({ _id: control }), "Control not found");
            })));
            yield predefinedEvidencesModel.updateOne({ _id: evidenceId }, {
                $set: { updatedAt: Date.now() },
                $addToSet: {
                    controls
                }
            });
            return {
                status: true,
                msge: "controls added to the evidence"
            };
        }
        catch (error) {
            console.log(error);
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message,
                };
            }
            return {
                status: false,
                msg: "Error",
            };
        }
    });
}
function addRisk(evidenceId_1) {
    return __awaiter(this, arguments, void 0, function* (evidenceId, risks = []) {
        try {
            var data = yield predefinedEvidencesModel.findById(evidenceId);
            assert(data, "evidence not found");
            if (!data.enabled) {
                return {
                    status: false,
                    msg: "evidence not enabled"
                };
            }
            yield Promise.all(risks.map((Risk) => __awaiter(this, void 0, void 0, function* () {
                assert(yield riskModel.exists({ _id: Risk }), "Risk not found");
            })));
            yield predefinedEvidencesModel.updateOne({ _id: evidenceId }, {
                $set: { updatedAt: Date.now() },
                $addToSet: {
                    risks
                }
            });
            return {
                status: true,
                msge: "Risk added to the evidence"
            };
        }
        catch (error) {
            console.log(error);
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message,
                };
            }
            return {
                status: false,
                msg: "Error",
            };
        }
    });
}
function addURL(evidenceId_1) {
    return __awaiter(this, arguments, void 0, function* (evidenceId, url = []) {
        try {
            var data = yield predefinedEvidencesModel.findById(evidenceId);
            assert(data, "evidence not found");
            if (!data.enabled) {
                return {
                    status: false,
                    msg: "evidence not enabled"
                };
            }
            yield predefinedEvidencesModel.updateOne({ _id: evidenceId }, {
                $set: { updatedAt: Date.now() },
                $addToSet: {
                    url
                }
            });
            return {
                status: true,
                msge: "URL added to the evidence"
            };
        }
        catch (error) {
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message,
                };
            }
            return {
                status: false,
                msg: "Error",
            };
        }
    });
}
function remEvidenceFiles(evidenceId_1) {
    return __awaiter(this, arguments, void 0, function* (evidenceId, files = []) {
        try {
            var evidence = yield predefinedEvidencesModel.exists({ _id: evidenceId });
            assert(evidence, "evidence not found");
            yield predefinedEvidencesModel.updateOne({ _id: evidenceId }, {
                $set: {
                    updatedAt: Date.now()
                },
                $pullAll: {
                    files
                }
            });
            return {
                status: true,
                msg: "files remove successfully"
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
                msg: 'Error'
            };
        }
    });
}
function remEvidenceControl(evidenceId_1) {
    return __awaiter(this, arguments, void 0, function* (evidenceId, controls = []) {
        try {
            var evidence = yield predefinedEvidencesModel.exists({ _id: evidenceId });
            assert(evidence, "evidence not found");
            yield predefinedEvidencesModel.updateOne({ _id: evidenceId }, {
                $set: { updateAt: Date.now() },
                $pullAll: {
                    controls
                }
            });
            return {
                status: true,
                msg: "controls remove from evidence"
            };
        }
        catch (error) {
            console.log(error);
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
function remEvidenceAssignee(evidenceId_1) {
    return __awaiter(this, arguments, void 0, function* (evidenceId, assignee = []) {
        try {
            var evidence = yield predefinedEvidencesModel.exists({ _id: evidenceId });
            assert(evidence, "evidence not found");
            yield predefinedEvidencesModel.updateOne({ _id: evidenceId }, {
                $set: { updatedAt: Date.now() },
                $pullAll: { assignee }
            });
            return {
                status: true,
                msg: "Assigee remove from evidence"
            };
        }
        catch (error) {
            console.log(error);
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
function remEvidenceRisk(evidenceId_1) {
    return __awaiter(this, arguments, void 0, function* (evidenceId, risks = []) {
        try {
            var evidence = yield predefinedEvidencesModel.exists({ _id: evidenceId });
            assert(evidence, "evidence not found");
            yield predefinedEvidencesModel.updateOne({ _id: evidenceId }, {
                $set: { updatedAt: Date.now() },
                $pullAll: { risks }
            });
            return {
                status: true,
                msg: "risk remove from evidence"
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
function remEvidenceURL(evidenceId_1) {
    return __awaiter(this, arguments, void 0, function* (evidenceId, url = []) {
        try {
            var data = yield predefinedEvidencesModel.exists({ _id: evidenceId });
            assert(data, "Evidence not found");
            yield predefinedEvidencesModel.updateOne({ _id: evidenceId }, {
                $set: {
                    updatedAt: Date.now()
                },
                $pullAll: {
                    url
                }
            });
            return {
                status: true,
                msge: "URL remove to the evidence"
            };
        }
        catch (error) {
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message,
                };
            }
            return {
                status: false,
                msg: "Error",
            };
        }
    });
}
export { createFramework, getAllFrameworks, getAllControls, getControl, updateControlStatus, addProjectToControlStatus, addPolicyToControlStatus, addRisksToControlStatus, addEvidenceToControlStatus, remControlStatusProject, remControlStatusPolicy, remControlStatusRisk, createEvidence, attachFile, createControlStaus, getAllControlStatus, getControlStatus, createPredefinedEvidence, getAllPredefinedEvidence, enablePredefinedEvidence, disablePredefinedEvidence, getPredefinedEvidence, assignUserToPredefinedEvidence, addEvidenceFile, addControl, addRisk, addURL, remEvidenceFiles, remEvidenceRisk, remEvidenceControl, remEvidenceURL, remEvidenceAssignee, };
