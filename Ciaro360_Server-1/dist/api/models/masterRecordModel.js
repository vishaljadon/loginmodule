import { Schema, model } from "mongoose";
const masterRecordSchemaForRisk = new Schema({
    title: { type: String },
    text: { type: String }
});
const masterRecordSchema = new Schema({
    logoUri: { type: String },
    exportTemplatesId: { type: String },
    apiKey: { type: String },
    OrgDetails: {
        name: { type: String },
        date: {
            startYear: { type: String },
            format: { type: String }
        },
        IFL: { type: String }
    },
    licenseDetail: {
        licenseNumber: {
            type: String,
            unique: true
        },
        purchaseDate: {
            type: String,
        },
        expiryDate: {
            type: String,
        },
        frameworksSubscribed: [{
                name: {
                    type: String,
                },
                subscribedOn: {
                    type: String,
                },
                expiryOn: {
                    type: String,
                }
            }],
        totalFrameworks: {
            type: Number,
            default: 0
        }
    },
    authSetup: {
        sso: {
            enabled: { type: Boolean },
            samlFile: { type: String }
        },
        normalLogin: {
            enabled: { type: Boolean },
            mfa: {
                enabled: { type: Boolean },
                email: { type: Boolean },
                _3dParty: { type: Boolean }
            },
            complexity: {
                passwordMinLength: { type: Number },
                passwordMaxLength: { type: Number },
                includeUppercase: { type: Boolean },
                includeLowercase: { type: Boolean },
                includeNumber: { type: Boolean },
                includeSpecialCharacter: { type: Boolean }
            }
        }
    },
    workflow: {
        tier3Enabled: { type: Boolean }
    },
    log: {
        retentionPeriod: { type: Number, default: 365 },
        category: {
            saAdminAct: { type: Boolean },
            userAuth: { type: Boolean },
            polProcDoc: { type: Boolean },
            govMonitor: { type: Boolean },
            riskReg: { type: Boolean },
            privImpAssmt: { type: Boolean },
            tpRiskAssmt: { type: Boolean }
        }
    },
    export: {
        header: {
            orgName: { type: Boolean },
            docName: { type: Boolean },
            pageNum: { type: Boolean },
            AuthName: { type: Boolean, default: false },
            CurVersion: { type: Boolean, default: false },
            IFL: { type: Boolean, default: false }
        },
        footer: {
            orgName: { type: Boolean, default: true },
            docName: { type: Boolean, default: true },
            pageNum: { type: Boolean, default: false },
            AuthName: { type: Boolean, default: false },
            CurVersion: { type: Boolean, default: false },
            IFL: { type: Boolean, default: false }
        }
    },
    reviewFrequency: {
        type: String,
        enum: ["Monthly", "Quarterly", "Biannually", "Annually"]
    },
    isOnboardingDone: { type: Boolean, default: false },
});
const masterRecordModel = model("neworganization", masterRecordSchema);
export default masterRecordModel;
