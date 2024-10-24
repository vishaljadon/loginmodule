import { Schema, model } from "mongoose";
export var policyStatusEnum;
(function (policyStatusEnum) {
    policyStatusEnum["draft"] = "draft";
    policyStatusEnum["drafted"] = "drafted";
    policyStatusEnum["reviewed"] = "reviewed";
    policyStatusEnum["approved"] = "approved";
    policyStatusEnum["rejected"] = "rejected";
})(policyStatusEnum = policyStatusEnum || (policyStatusEnum = {}));
const policySchema = new Schema({
    title: {
        type: String,
        unique: true,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_by: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: Object.values(policyStatusEnum),
        default: "draft"
    },
    assignees: {
        author: {
            type: [Schema.Types.ObjectId],
            ref: "users",
        },
        reviewer: {
            type: [Schema.Types.ObjectId],
            ref: "users"
        },
        approver: {
            type: [Schema.Types.ObjectId],
            ref: "users"
        },
    },
    versions: {
        type: [Schema.Types.ObjectId],
        ref: "versions"
    },
    reminder: {
        type: Date,
    },
    tags: {
        type: [Schema.Types.ObjectId],
        ref: "tags",
    },
    procedure: {
        type: [Schema.Types.ObjectId],
        ref: "procedures", // TODO: create it's mongoose Schema/Model
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: "project", // TODO: create it's mongoose Schema/Model
    },
    comments: {
        type: [Schema.Types.ObjectId],
        ref: "comments"
    },
    logs: {
        type: [Schema.Types.ObjectId],
        ref: "logs"
    },
    beingModified: {
        type: Boolean,
        default: false
    },
});
const policyModel = model("policies", policySchema);
export default policyModel;
