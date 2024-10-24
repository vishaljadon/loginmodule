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
function mapOnePolicyToManyRisks(policyId, risks, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield policyModel.updateOne({ _id: policyId }, {
                $addToSet: {
                    risks: {
                        $each: risks
                    }
                }
            }, { session });
            yield riskModel.updateMany({ _id: risks }, {
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
function mapOneProcedureToManyRisks(procedureId, risks, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield procedureModel.updateOne({ _id: procedureId }, {
                $addToSet: {
                    risks: {
                        $each: risks
                    }
                }
            }, { session });
            yield riskModel.updateMany({ _id: risks }, {
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
// RISKS
function mapOneRiskToManyPolicies(riskId, policies, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield riskModel.updateOne({ _id: riskId }, {
                $addToSet: {
                    policies: {
                        $each: policies
                    }
                }
            }, { session });
            yield policyModel.updateMany({ _id: policies }, {
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
function mapOneRiskToManyProcedures(riskId, procedures, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        var session = yield policyModel.startSession();
        try {
            // assert
            session.startTransaction();
            yield riskModel.updateOne({ _id: riskId }, {
                $addToSet: {
                    procedures: {
                        $each: procedures
                    }
                }
            }, { session });
            yield procedureModel.updateMany({ _id: procedures }, {
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
export { mapOnePolicyToManyControls, mapOnePolicyToManyRisks, mapOnePolicyToManyProcedures, mapOneProcedureToManyControls, mapOneProcedureToManyPolicies, mapOneProcedureToManyRisks, mapOneRiskToManyControls, mapOneRiskToManyPolicies, mapOneRiskToManyProcedures, mapOneControlToManyRisks, mapOneControlToManyProcedures, mapOneControlToManyPolicies };
