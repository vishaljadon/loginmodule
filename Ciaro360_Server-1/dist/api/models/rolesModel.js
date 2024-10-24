import { Schema, model } from "mongoose";
const editCategoryJSON = {
    edit: {
        type: Boolean,
        default: false
    }
};
const basicRoleCategoryJSON = {
    fullAccess: {
        type: Boolean,
        default: false
    },
    view: {
        type: Boolean,
        default: false
    }
};
const rolesSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true,
    },
    userControl: basicRoleCategoryJSON,
    onboarding: basicRoleCategoryJSON,
    control: basicRoleCategoryJSON,
    policy: Object.assign(Object.assign({}, editCategoryJSON), basicRoleCategoryJSON),
    procedure: Object.assign(Object.assign({}, editCategoryJSON), basicRoleCategoryJSON),
    risk: Object.assign(Object.assign({}, editCategoryJSON), basicRoleCategoryJSON),
    training: Object.assign(Object.assign({}, editCategoryJSON), basicRoleCategoryJSON),
    TPRA: Object.assign(Object.assign({}, editCategoryJSON), basicRoleCategoryJSON),
    evidences: Object.assign(Object.assign({}, editCategoryJSON), basicRoleCategoryJSON),
    audit: Object.assign(Object.assign({}, editCategoryJSON), basicRoleCategoryJSON),
    superAdmin: {
        type: Boolean,
        default: false
    },
    admin: {
        type: Boolean,
        default: false
    }
});
rolesSchema.methods.isAdmin = function () {
};
const rolesModel = model("roles", rolesSchema);
export default rolesModel;
