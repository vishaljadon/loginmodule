/**
 * isAdmin(), isSuperAdmin() are just a target specific function same things can be done through checkRolePermissions() function
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import userModel from "../api/models/userModel.js";
import rolesModel from "../api/models/rolesModel.js";
import { flattenDictionary } from "./functions.js";
import policyModel from "../api/models/policyModel.js";
import assert from "assert";
import procedureModel from "../api/models/procedureModel.js";
import riskModel from "../api/models/riskModel.js";
import policyVersionModel from "../api/models/policyVersionModel.js";
// const asyncSome = async (arr: any[], predicate: any) => {
//   for (let e of arr) {
//     if (await predicate(e)) return true;
//   }
//   return false;
// };
function checkRolePermissions(userId, permissions) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var user = yield userModel.findById(userId);
            assert(user);
            assert(user.active);
            assert(user.role);
            const role = yield rolesModel.findById(user.role.toString());
            assert(role);
            return permissions.some(permission => {
                var tmp = flattenDictionary(permission);
                return Object.keys(tmp).every(key => role.get(key) === tmp[key]);
            });
        }
        catch (e) {
            return false;
        }
    });
}
;
function isAdmin(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var user = yield userModel.findById(userId);
            assert(user);
            assert(user.role);
            const role = yield rolesModel.findById(user.role);
            assert(role);
            return role.admin || role.superAdmin;
        }
        catch (e) {
            return false;
        }
    });
}
function isSuperAdmin(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var user = yield userModel.findById(userId);
            assert(user);
            assert(user.role);
            const role = yield rolesModel.findById(user.role);
            assert(role);
            return role.superAdmin;
        }
        catch (e) {
            return false;
        }
    });
}
function isUserDisabled(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        return (_a = (yield userModel.findById(userId))) === null || _a === void 0 ? void 0 : _a.active;
    });
}
function isPolicyAssignee(policyId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var active = yield isUserDisabled(userId);
            assert(active);
            var admin = yield isAdmin(userId);
            if (admin)
                return true;
            const result = yield policyModel.exists({
                _id: policyId,
                $or: [
                    { 'assignees.author': userId },
                    { 'assignees.reviewer': userId },
                    { 'assignees.approver': userId }
                ]
            });
            // console.log({result,userId,policyId})
            return !!result;
        }
        catch (error) {
            return false;
        }
    });
}
function isPolicyReviewer(policyId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var active = yield isUserDisabled(userId);
            assert(active);
            var admin = yield isAdmin(userId);
            if (admin)
                return true;
            const result = yield policyModel.exists({
                _id: policyId,
                'assignees.reviewer': userId
            });
            return !!result;
        }
        catch (error) {
            return false;
        }
    });
}
function isPolicyApprover(policyId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var active = yield isUserDisabled(userId);
            assert(active);
            var admin = yield isAdmin(userId);
            if (admin)
                return true;
            var result;
            if (global.masterData.workflow.tier3Enabled) {
                result = yield policyModel.exists({
                    _id: policyId,
                    'assignees.approver': userId,
                });
            }
            else {
                result = yield policyModel.exists({
                    _id: policyId,
                    'assignees.reviewer': userId
                });
            }
            return !!result;
        }
        catch (error) {
            return false;
        }
    });
}
function isPolicyVersionAssignee(versionId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var active = yield isUserDisabled(userId);
            assert(active);
            var admin = yield isAdmin(userId);
            if (admin)
                return true;
            const result = yield policyVersionModel.exists({
                _id: versionId,
                $or: [
                    { 'assignees.author': userId },
                    { 'assignees.reviewer': userId },
                    { 'assignees.approver': userId }
                ]
            });
            return !!result;
        }
        catch (error) {
            return false;
        }
    });
}
function isPolicyVersionReviewer(policyId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var active = yield isUserDisabled(userId);
            assert(active);
            var admin = yield isAdmin(userId);
            if (admin)
                return true;
            const result = yield policyVersionModel.exists({
                _id: policyId,
                'assignees.reviewer': userId
            });
            return !!result;
        }
        catch (error) {
            return false;
        }
    });
}
function isPolicyVersionApprover(policyId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var active = yield isUserDisabled(userId);
            assert(active);
            var admin = yield isAdmin(userId);
            if (admin)
                return true;
            var result;
            if (global.masterData.workflow.tier3Enabled) {
                result = yield policyVersionModel.exists({
                    _id: policyId,
                    'assignees.approver': userId,
                });
            }
            else {
                result = yield policyModel.exists({
                    _id: policyId,
                    'assignees.reviewer': userId
                });
            }
            return !!result;
        }
        catch (error) {
            return false;
        }
    });
}
function isRiskAssignee(riskId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var active = yield isUserDisabled(userId);
            assert(active);
            var admin = yield isAdmin(userId);
            if (admin)
                return true;
            const result = yield riskModel.exists({
                _id: riskId,
                $or: [
                    { 'assignees.author': userId },
                    { 'assignees.reviewer': userId },
                    { 'assignees.approver': userId }
                ]
            });
            return !!result;
        }
        catch (error) {
            return false;
        }
    });
}
function isRiskReviewer(riskId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var active = yield isUserDisabled(userId);
            assert(active);
            var admin = yield isAdmin(userId);
            if (admin)
                return true;
            const result = yield riskModel.exists({
                _id: riskId,
                'assignees.reviewer': userId
            });
            return !!result;
        }
        catch (error) {
            return false;
        }
    });
}
function isRiskApprover(riskId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var active = yield isUserDisabled(userId);
            assert(active);
            var admin = yield isAdmin(userId);
            if (admin)
                return true;
            var result;
            if (global.masterData.workflow.tier3Enabled) {
                result = yield riskModel.exists({
                    _id: riskId,
                    'assignees.approver': userId,
                });
            }
            else {
                result = yield riskModel.exists({
                    _id: riskId,
                    'assignees.reviewer': userId
                });
            }
            return !!result;
        }
        catch (error) {
            return false;
        }
    });
}
function isProcedureAssignee(procedureId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var active = yield isUserDisabled(userId);
            assert(active);
            var admin = yield isAdmin(userId);
            if (admin)
                return true;
            const result = yield procedureModel.exists({
                _id: procedureId,
                $or: [
                    { 'assignees.author': userId },
                    { 'assignees.reviewer': userId },
                    { 'assignees.approver': userId }
                ]
            });
            return !!result;
        }
        catch (error) {
            return false;
        }
    });
}
function isProcedureReviewer(procedureId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var active = yield isUserDisabled(userId);
            assert(active);
            var admin = yield isAdmin(userId);
            if (admin)
                return true;
            const result = yield procedureModel.exists({
                _id: procedureId,
                'assignees.reviewer': userId
            });
            return !!result;
        }
        catch (error) {
            return false;
        }
    });
}
function isProcedureApprover(procedureId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var active = yield isUserDisabled(userId);
            assert(active);
            var admin = yield isAdmin(userId);
            if (admin)
                return true;
            var result;
            if (global.masterData.workflow.tier3Enabled) {
                result = yield procedureModel.exists({
                    _id: procedureId,
                    'assignees.approver': userId,
                });
            }
            else {
                result = yield procedureModel.exists({
                    _id: procedureId,
                    'assignees.reviewer': userId
                });
            }
            return !!result;
        }
        catch (error) {
            return false;
        }
    });
}
export { checkRolePermissions, isPolicyReviewer, isPolicyApprover, isPolicyAssignee, isPolicyVersionAssignee, isPolicyVersionReviewer, isPolicyVersionApprover, isProcedureReviewer, isProcedureApprover, isProcedureAssignee, isRiskReviewer, isRiskApprover, isRiskAssignee, isSuperAdmin, isAdmin };
