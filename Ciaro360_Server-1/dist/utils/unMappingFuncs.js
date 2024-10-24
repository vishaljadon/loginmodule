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
import projectModel from "../api/models/projectModel.js";
// POLICIES
function unMapOnePolicyToManyProcedures(policyId, procedures, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // auth
            // var auth = await checkRolePermissions(uId,[
            //     {
            //         policy:{edit:true},
            //         procedure:{edit: true}
            //     }
            // ])
            // assert(auth,"Auth Failed")
            session.startTransaction();
            yield policyModel.updateOne({ _id: policyId }, {
                $pull: {
                    procedure: {
                        $in: procedures
                    }
                }
            }, { session });
            yield procedureModel.updateMany({ _id: procedures }, {
                $pull: {
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
function unMapOnePolicyToManyControls(policyId, controls, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // auth
            // var auth = await checkRolePermissions(uId,[
            //     {
            //         policy:{edit:true},
            //         control:{fullAccess: true}
            //     }
            // ])
            // assert(auth,"Auth Failed")
            session.startTransaction();
            yield policyModel.updateOne({ _id: policyId }, {
                $pull: {
                    controls: {
                        $in: controls
                    }
                }
            }, { session });
            yield controlsModel.updateMany({ _id: controls }, {
                $pull: {
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
function unMapOnePolicyToManyProject(policyId, projects, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield policyModel.updateOne({ _id: policyId }, {
                $pull: {
                    projects: {
                        $in: projects
                    }
                }
            }, { session });
            yield projectModel.updateOne({ _id: projects }, {
                $pull: {
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
function unMapOneProcedureToManyPolicies(procedureId, policies, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // auth
            // var auth = await checkRolePermissions(uId,[
            //     {
            //         procedure:{edit: true},
            //         policy:{edit:true}
            //     }
            // ])
            // assert(auth,"Auth Failed")
            session.startTransaction();
            yield procedureModel.updateOne({ _id: procedureId }, {
                $pull: {
                    policies: {
                        $in: policies
                    }
                }
            }, { session });
            yield policyModel.updateMany({ _id: policies }, {
                $pull: {
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
function unMapOneProcedureToManyControls(procedureId, controls, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // auth
            // var auth = await checkRolePermissions(uId,[
            //     {
            //         procedure:{edit: true},
            //         control:{fullAccess:true}
            //     }
            // ])
            // assert(auth,"Auth Failed")
            session.startTransaction();
            yield procedureModel.updateOne({ _id: procedureId }, {
                $pull: {
                    controls: {
                        $in: controls
                    }
                }
            }, { session });
            yield controlsModel.updateMany({ _id: controls }, {
                $pull: {
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
function unMapOneProcedureToManyProject(procedureId, projects, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield procedureModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield procedureModel.updateOne({ _id: procedureId }, {
                $pull: {
                    projects: {
                        $in: projects
                    }
                }
            }, { session });
            yield projectModel.updateOne({ _id: projects }, {
                $pull: {
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
function unMapOneRiskToManyControls(riskId, controls, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield riskModel.updateOne({ _id: riskId }, {
                $pull: {
                    controls: {
                        $in: controls
                    }
                }
            }, { session });
            yield controlsModel.updateMany({ _id: controls }, {
                $pull: {
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
function unMapOneRiskToManyProject(riskId, projects, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield riskModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield riskModel.updateOne({ _id: riskId }, {
                $pull: {
                    projects: {
                        $in: projects
                    }
                }
            }, { session });
            yield projectModel.updateOne({ _id: projects }, {
                $pull: {
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
function unMapOneControlToManyPolicies(controlId, policies, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield controlsModel.updateOne({ _id: controlId }, {
                $pull: {
                    policies: {
                        $in: policies
                    }
                }
            }, { session });
            yield policyModel.updateMany({ _id: policies }, {
                $pull: {
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
function unMapOneControlToManyProcedures(controlId, procedures, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield controlsModel.updateOne({ _id: controlId }, {
                $pull: {
                    procedures: {
                        $in: procedures
                    }
                }
            }, { session });
            yield procedureModel.updateMany({ _id: procedures }, {
                $pull: {
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
function unMapOneControlToManyRisks(controlId, risks, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield controlsModel.updateOne({ _id: controlId }, {
                $pull: {
                    risks: {
                        $in: risks
                    }
                }
            }, { session });
            yield riskModel.updateMany({ _id: risks }, {
                $pull: {
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
function unMapOneControlToManyProject(controlId, projects, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield controlsModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield controlsModel.updateOne({ _id: controlId }, {
                $pull: {
                    projects: {
                        $in: projects
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
// PROJECT
function unMapOneProjectToManyPolicies(projectId, policies, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield projectModel.updateOne({ _id: projectId }, {
                $pull: {
                    policies: {
                        $in: policies
                    }
                }
            }, { session });
            yield policyModel.updateMany({ _id: policies }, {
                $pull: {
                    project: projectId
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
function unMapOneProjectToManyProcedures(projectId, procedures, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield projectModel.updateOne({ _id: projectId }, {
                $pull: {
                    procedures: {
                        $in: procedures
                    }
                }
            }, { session });
            yield procedureModel.updateMany({ _id: procedures }, {
                $pull: {
                    project: projectId
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
function unMapOneProjectToManyRisks(projectId, risks, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield projectModel.updateOne({ _id: projectId }, {
                $pull: {
                    risks: {
                        $in: risks
                    }
                }
            }, { session });
            yield riskModel.updateMany({ _id: risks }, {
                $pull: {
                    project: projectId
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
function unMapOneProjectToManyControls(projectId, controls, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield projectModel.updateOne({ _id: projectId }, {
                $pull: {
                    controls: {
                        $in: controls
                    }
                }
            }, { session });
            yield controlsModel.updateMany({ _id: controls }, {
                $pull: {
                    project: projectId
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
export { unMapOnePolicyToManyControls, unMapOnePolicyToManyProcedures, unMapOnePolicyToManyProject, unMapOneProcedureToManyControls, unMapOneProcedureToManyPolicies, unMapOneProcedureToManyProject, unMapOneRiskToManyControls, unMapOneRiskToManyProject, unMapOneControlToManyRisks, unMapOneControlToManyProcedures, unMapOneControlToManyPolicies, unMapOneControlToManyProject, unMapOneProjectToManyPolicies, unMapOneProjectToManyProcedures, unMapOneProjectToManyRisks, unMapOneProjectToManyControls };
