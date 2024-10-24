import { Schema, model } from "mongoose";
export const objectEnum = { policy: 'policy', policyVersion: 'policyVersion', procedure: 'procedures', control: 'controls', user: 'user', tags: 'tags', risk: 'risk',
    superAdmin_Admin_Activity: 'superAdmin_Admin_Activity', UserAuthentication: 'UserAuthentication', Policy_and_ProcessDocument: 'Policy_and_ProcessDocument', Governance_Monitoring: 'Governance_Monitoring', RiskRegister: 'RiskRegister', PrivacyImpactAssessment: 'PrivacyImpactAssessment', ThirdPartyRiskAssessment: 'ThirdPartyRiskAssessment'
};
const actionEnum = { add: 'add', delete: 'delete', update: 'update', review: 'review', approve: 'approve', login: "login", create: 'create', password_recovery: 'password_recovery',
    verify: 'verify'
};
const logsSchema = new Schema({
    timestamp: {
        type: Number,
        default: Date.now,
    },
    objectType: {
        type: String,
        enum: Object.values(objectEnum)
    },
    objectId: {
        type: Schema.Types.ObjectId,
        default: null
    },
    userId: {
        type: Schema.Types.ObjectId,
        default: null,
        ref: "users"
    },
    action: {
        type: String,
        enum: Object.values(actionEnum)
    },
    description: {
        type: String,
    }
});
const logsModel = model("newlogs", logsSchema);
export default logsModel;
