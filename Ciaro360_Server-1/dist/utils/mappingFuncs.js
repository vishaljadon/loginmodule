var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { AssertionError } from "assert";
import policyModel from "../api/models/policyModel.js";
import procedureModel from "../api/models/procedureModel.js";
import riskModel from "../api/models/riskModel.js";
import controlsModel from "../api/models/controlsModel.js";
import tagsModel from "../api/models/tagsModel.js";
import projectModel from "../api/models/projectModel.js";
import { assert } from "console";
// POLICIES
function mapOnePolicyToManyProcedures(policyId, procedures, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield policyModel.updateOne({ _id: policyId }, {
                $addToSet: {
                    procedure: {
                        $each: procedures
                    }
                }
            }, { session });
            yield procedureModel.updateMany({ _id: procedures }, {
                $addToSet: {
                    policies: policyId
                }
            });
            yield session.commitTransaction();
            yield session.endSession();
            return {
                status: true,
                msg: "Success"
            };
        }
        catch (error) {
            console.log(error);
            if (session.inTransaction())
                yield session.abortTransaction();
            if (!session.hasEnded)
                yield session.endSession();
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
function mapOnePolicyToManyControls(policyId, controls, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield policyModel.updateOne({ _id: policyId }, {
                $addToSet: {
                    controls: {
                        $each: controls
                    }
                }
            }, { session });
            yield controlsModel.updateMany({ _id: controls }, {
                $addToSet: {
                    policies: policyId
                }
            });
            yield session.commitTransaction();
            yield session.endSession();
            return {
                status: true,
                msg: "Success"
            };
        }
        catch (error) {
            console.log(error);
            if (session.inTransaction())
                yield session.abortTransaction();
            if (!session.hasEnded)
                yield session.endSession();
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
function mapOnePolicyToManyProject(policyId, projects, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield policyModel.updateOne({ _id: policyId }, {
                $addToSet: {
                    projects: {
                        $each: projects
                    }
                }
            }, { session });
            yield projectModel.updateOne({ _id: projects }, {
                $addToSet: {
                    policies: policyId
                }
            });
            yield session.commitTransaction();
            yield session.endSession();
            return {
                status: true,
                msg: "Success"
            };
        }
        catch (error) {
            if (session.inTransaction())
                yield session.abortTransaction();
            if (!session.hasEnded)
                yield session.endSession();
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
// PROCEDURES
function mapOneProcedureToManyPolicies(procedureId, policies, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield procedureModel.updateOne({ _id: procedureId }, {
                $addToSet: {
                    policies: {
                        $each: policies
                    }
                }
            }, { session });
            yield policyModel.updateMany({ _id: policies }, {
                $addToSet: {
                    procedure: procedureId
                }
            });
            yield session.commitTransaction();
            yield session.endSession();
            return {
                status: true,
                msg: "Success"
            };
        }
        catch (error) {
            console.log(error);
            if (session.inTransaction())
                yield session.abortTransaction();
            if (!session.hasEnded)
                yield session.endSession();
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
function mapOneProcedureToManyControls(procedureId, controls, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield procedureModel.updateOne({ _id: procedureId }, {
                $addToSet: {
                    controls: {
                        $each: controls
                    }
                }
            }, { session });
            yield controlsModel.updateMany({ _id: controls }, {
                $addToSet: {
                    procedure: procedureId
                }
            });
            yield session.commitTransaction();
            yield session.endSession();
            return {
                status: true,
                msg: "Success"
            };
        }
        catch (error) {
            console.log(error);
            if (session.inTransaction())
                yield session.abortTransaction();
            if (!session.hasEnded)
                yield session.endSession();
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
function mapOneProcedureToManyProject(procedureId, projects, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield procedureModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield procedureModel.updateOne({ _id: procedureId }, {
                $addToSet: {
                    projects: {
                        $each: projects
                    }
                }
            }, { session });
            yield projectModel.updateOne({ _id: projects }, {
                $addToSet: {
                    procedures: procedureId
                }
            });
            yield session.commitTransaction();
            yield session.endSession();
            return {
                status: true,
                msg: "Success"
            };
        }
        catch (error) {
            if (session.inTransaction())
                yield session.abortTransaction();
            if (!session.hasEnded)
                yield session.endSession();
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
// RISKS
function mapOneRiskToManyControls(riskId, controls, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield riskModel.updateOne({ _id: riskId }, {
                $addToSet: {
                    controls: {
                        $each: controls
                    }
                }
            }, { session });
            yield controlsModel.updateMany({ _id: controls }, {
                $addToSet: {
                    risks: riskId
                }
            });
            yield session.commitTransaction();
            yield session.endSession();
            return {
                status: true,
                msg: "Success"
            };
        }
        catch (error) {
            console.log(error);
            if (session.inTransaction())
                yield session.abortTransaction();
            if (!session.hasEnded)
                yield session.endSession();
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
function mapOneRiskToManyProject(riskId, projects, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield riskModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield riskModel.updateOne({ _id: riskId }, {
                $addToSet: {
                    projects: {
                        $each: projects
                    }
                }
            }, { session });
            yield projectModel.updateOne({ _id: projects }, {
                $addToSet: {
                    risks: riskId
                }
            });
            yield session.commitTransaction();
            yield session.endSession();
            return {
                status: true,
                msg: "Success"
            };
        }
        catch (error) {
            if (session.inTransaction())
                yield session.abortTransaction();
            if (!session.hasEnded)
                yield session.endSession();
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
// CONTROLS
function mapOneControlToManyPolicies(controlId, policies, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield controlsModel.updateOne({ _id: controlId }, {
                $addToSet: {
                    policies: {
                        $each: policies
                    }
                }
            }, { session });
            yield policyModel.updateMany({ _id: policies }, {
                $addToSet: {
                    controls: controlId
                }
            });
            yield session.commitTransaction();
            yield session.endSession();
            return {
                status: true,
                msg: "Success"
            };
        }
        catch (error) {
            console.log(error);
            if (session.inTransaction())
                yield session.abortTransaction();
            if (!session.hasEnded)
                yield session.endSession();
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
function mapOneControlToManyProcedures(controlId, procedures, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield controlsModel.updateOne({ _id: controlId }, {
                $addToSet: {
                    procedures: {
                        $each: procedures
                    }
                }
            }, { session });
            yield procedureModel.updateMany({ _id: procedures }, {
                $addToSet: {
                    controls: controlId
                }
            });
            yield session.commitTransaction();
            yield session.endSession();
            return {
                status: true,
                msg: "Success"
            };
        }
        catch (error) {
            console.log(error);
            if (session.inTransaction())
                yield session.abortTransaction();
            if (!session.hasEnded)
                yield session.endSession();
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
function mapOneControlToManyRisks(controlId, risks, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield controlsModel.updateOne({ _id: controlId }, {
                $addToSet: {
                    risks: {
                        $each: risks
                    }
                }
            }, { session });
            yield riskModel.updateMany({ _id: risks }, {
                $addToSet: {
                    controls: controlId
                }
            });
            yield session.commitTransaction();
            yield session.endSession();
            return {
                status: true,
                msg: "Success"
            };
        }
        catch (error) {
            console.log(error);
            if (session.inTransaction())
                yield session.abortTransaction();
            if (!session.hasEnded)
                yield session.endSession();
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
function mapOneControlToManyProject(controlId, projects, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield controlsModel.startSession();
        try {
            // assert
            session.startTransaction();
            var control = yield controlsModel.findById(controlId).select({ custom: 1, projects: 1 });
            assert(control, "Control not found");
            if ((control === null || control === void 0 ? void 0 : control.custom) == false) {
                assert(!(control.projects.length > 1), "Only one projects can be mapped");
                assert(!(projects.length > 1), "Only one projects can be mapped");
            }
            yield controlsModel.updateOne({ _id: controlId }, {
                $addToSet: {
                    projects: {
                        $each: projects
                    }
                }
            }, { session });
            yield projectModel.updateOne({ _id: projects }, {
                $set: {
                    controls: controlId
                }
            });
            yield session.commitTransaction();
            yield session.endSession();
            return {
                status: true,
                msg: "Success"
            };
        }
        catch (error) {
            if (session.inTransaction())
                yield session.abortTransaction();
            if (!session.hasEnded)
                yield session.endSession();
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
// TAGS
function mapOneTagToManyPolicies(tagId, policies, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield tagsModel.updateOne({ _id: tagId }, {
                $addToSet: {
                    policies: {
                        $each: policies
                    }
                }
            }, { session });
            yield policyModel.updateMany({ _id: policies }, {
                $addToSet: {
                    tags: tagId
                }
            });
            yield session.commitTransaction();
            yield session.endSession();
            return {
                status: true,
                msg: "Success"
            };
        }
        catch (error) {
            console.log(error);
            if (session.inTransaction())
                yield session.abortTransaction();
            if (!session.hasEnded)
                yield session.endSession();
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
function mapOneTagToManyProcedures(tagId, procedures, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield tagsModel.updateOne({ _id: tagId }, {
                $addToSet: {
                    procedures: {
                        $each: procedures
                    }
                }
            }, { session });
            yield procedureModel.updateMany({ _id: procedures }, {
                $addToSet: {
                    tags: tagId
                }
            });
            yield session.commitTransaction();
            yield session.endSession();
            return {
                status: true,
                msg: "Success"
            };
        }
        catch (error) {
            console.log(error);
            if (session.inTransaction())
                yield session.abortTransaction();
            if (!session.hasEnded)
                yield session.endSession();
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
function mapOneTagToManyRisks(tagId, risks, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield tagsModel.updateOne({ _id: tagId }, {
                $addToSet: {
                    risks: {
                        $each: risks
                    }
                }
            }, { session });
            yield riskModel.updateMany({ _id: risks }, {
                $addToSet: {
                    tags: tagId
                }
            });
            yield session.commitTransaction();
            yield session.endSession();
            return {
                status: true,
                msg: "Success"
            };
        }
        catch (error) {
            console.log(error);
            if (session.inTransaction())
                yield session.abortTransaction();
            if (!session.hasEnded)
                yield session.endSession();
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
function mapOneTagToManyControls(tagId, controls, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield tagsModel.updateOne({ _id: tagId }, {
                $addToSet: {
                    controls: {
                        $each: controls
                    }
                }
            }, { session });
            yield controlsModel.updateMany({ _id: controls }, {
                $addToSet: {
                    tags: tagId
                }
            });
            yield session.commitTransaction();
            yield session.endSession();
            return {
                status: true,
                msg: "Success"
            };
        }
        catch (error) {
            console.log(error);
            if (session.inTransaction())
                yield session.abortTransaction();
            if (!session.hasEnded)
                yield session.endSession();
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
// PROJECT
function mapOneProjectToManyPolicies(projectId, policies, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield projectModel.updateOne({ _id: projectId }, {
                $addToSet: {
                    policies: {
                        $each: policies
                    }
                }
            }, { session });
            yield policyModel.updateMany({ _id: policies }, {
                $addToSet: {
                    projects: projectId
                }
            });
            yield session.commitTransaction();
            yield session.endSession();
            return {
                status: true,
                msg: "Success"
            };
        }
        catch (error) {
            console.log(error);
            if (session.inTransaction())
                yield session.abortTransaction();
            if (!session.hasEnded)
                yield session.endSession();
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
function mapOneProjectToManyProcedures(projectId, procedures, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield projectModel.updateOne({ _id: projectId }, {
                $addToSet: {
                    procedures: {
                        $each: procedures
                    }
                }
            }, { session });
            yield procedureModel.updateMany({ _id: procedures }, {
                $addToSet: {
                    projects: projectId
                }
            });
            yield session.commitTransaction();
            yield session.endSession();
            return {
                status: true,
                msg: "Success"
            };
        }
        catch (error) {
            console.log(error);
            if (session.inTransaction())
                yield session.abortTransaction();
            if (!session.hasEnded)
                yield session.endSession();
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
function mapOneProjectToManyRisks(projectId, risks, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield projectModel.updateOne({ _id: projectId }, {
                $addToSet: {
                    risks: {
                        $each: risks
                    }
                }
            }, { session });
            yield riskModel.updateMany({ _id: risks }, {
                $addToSet: {
                    projects: projectId
                }
            });
            yield session.commitTransaction();
            yield session.endSession();
            return {
                status: true,
                msg: "Success"
            };
        }
        catch (error) {
            console.log(error);
            if (session.inTransaction())
                yield session.abortTransaction();
            if (!session.hasEnded)
                yield session.endSession();
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
function mapOneProjectToManyControls(projectId, controls, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield projectModel.updateOne({ _id: projectId }, {
                $addToSet: {
                    controls: {
                        $each: controls
                    }
                }
            }, { session });
            yield controlsModel.updateMany({ _id: controls }, {
                $addToSet: {
                    projects: projectId
                }
            });
            yield session.commitTransaction();
            yield session.endSession();
            return {
                status: true,
                msg: "Success"
            };
        }
        catch (error) {
            console.log(error);
            if (session.inTransaction())
                yield session.abortTransaction();
            if (!session.hasEnded)
                yield session.endSession();
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
export { mapOnePolicyToManyControls, mapOnePolicyToManyProcedures, mapOnePolicyToManyProject, mapOneProcedureToManyControls, mapOneProcedureToManyPolicies, mapOneProcedureToManyProject, mapOneRiskToManyControls, mapOneRiskToManyProject, mapOneControlToManyRisks, mapOneControlToManyProcedures, mapOneControlToManyPolicies, mapOneControlToManyProject, mapOneTagToManyPolicies, mapOneTagToManyProcedures, mapOneTagToManyRisks, mapOneTagToManyControls, mapOneProjectToManyPolicies, mapOneProjectToManyProcedures, mapOneProjectToManyRisks, mapOneProjectToManyControls };
