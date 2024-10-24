var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { checkRolePermissions } from "../../utils/roles.js";
import rolesModel from "../models/rolesModel.js";
import { Types } from "mongoose";
import assert, { AssertionError } from "assert";
// CREATE
function create(body, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { userControl: { fullAccess: true } }
            ]);
            assert(auth, "Auth Failed");
            // delete body.superAdmin
            var role = yield rolesModel.create(body);
            return {
                status: true,
                msg: role.id
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
                msg: "Error"
            };
        }
    });
}
// RETRIVE
function getAllRoles() {
    return __awaiter(this, arguments, void 0, function* (page = 1, count = 10, name = "", uId) {
        try {
            // Do auth
            var auth = yield checkRolePermissions(uId, [
                { userControl: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            var roles = yield rolesModel.aggregate([
                { $match: { name: { $regex: name, $options: "i" } } },
                { $project: { name: 1 } },
                { $skip: (page - 1) * count },
                { $limit: count }
            ]);
            return {
                status: true,
                roles
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
                msg: "Error"
            };
        }
    });
}
function getRole(roleId, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Do auth
            var auth = yield checkRolePermissions(uId, [
                { userControl: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            var role = yield rolesModel.findById(roleId);
            assert(role, "role not found");
            return {
                status: true,
                role
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
                msg: "Error"
            };
        }
    });
}
// RETRIVE
function getTotalRolesCount(uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Do auth
            var auth = yield checkRolePermissions(uId, [
                { userControl: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            var count = yield rolesModel.countDocuments({});
            return {
                status: true,
                count
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
                msg: "Error"
            };
        }
    });
}
// UPDATE
function updateRole(roleId, body, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Do auth
            var auth = yield checkRolePermissions(uId, [
                { userControl: { fullAccess: true } }
            ]);
            assert(auth, "Auth Failed");
            var update = yield rolesModel.updateOne({ _id: new Types.ObjectId(roleId) }, body, { runValidators: true });
            assert(update.modifiedCount, "Nothing to modify");
            return {
                status: true,
                msg: "Role modified"
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
                msg: "Error"
            };
        }
    });
}
// LINK
// DELETE
function deleteById(id, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO ensure basic roles are not deleted
        try {
            var auth = yield checkRolePermissions(uId, [
                { userControl: { fullAccess: true } }
            ]);
            assert(auth, "Auth Failed");
            yield rolesModel.deleteOne({ _id: id });
            return {
                status: true,
                msg: "Role Deleted"
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
                msg: "Error"
            };
        }
    });
}
export { create, getAllRoles, getRole, updateRole, deleteById, getTotalRolesCount };
