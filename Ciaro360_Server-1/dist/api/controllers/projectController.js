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
import { checkRolePermissions } from "../../utils/roles.js";
import projectModel from "../models/projectModel.js";
import policyModel from "../models/policyModel.js";
import { Types } from "mongoose";
// CREATE
function create(name, description, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // auth
            var auth = yield checkRolePermissions(uId, [
                { admin: true }
            ]);
            assert(auth, "Auth Failed");
            var project = yield projectModel.create({
                name,
                description,
                created_by: uId
            });
            return {
                status: true,
                msg: project._id
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
function getAll() {
    return __awaiter(this, arguments, void 0, function* (page = 1, count = 10, name = "", uId) {
        try {
            // Do auth
            var auth = yield checkRolePermissions(uId, [
                { admin: true }
            ]);
            assert(auth, "Auth Failed");
            var projects = yield projectModel.aggregate([
                { $match: { name: { $regex: name, $options: "i" } } },
                { $project: { name: 1, description: 1 } },
                { $skip: (page - 1) * count },
                { $limit: count }
            ]);
            return {
                status: true,
                projects
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
function getProject(projectId, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Do auth
            var auth = yield checkRolePermissions(uId, [
                { admin: true }
            ]);
            assert(auth, "Auth Failed");
            var project = yield projectModel
                .findById(projectId)
                .populate("scopes", "name")
                .populate("policies", "title");
            assert(project, "Project not found");
            return {
                status: true,
                project
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
function getProjectPolicies(projectId_1, page_1, count_1) {
    return __awaiter(this, arguments, void 0, function* (projectId, page, count, policyTitle = "", uId) {
        try {
            // Do auth
            var auth = yield checkRolePermissions(uId, [
                { admin: true }
            ]);
            assert(auth, "Auth Failed");
            const project = yield policyModel.aggregate([
                { $match: { project: new Types.ObjectId(projectId) } },
                { $match: { title: { $regex: policyTitle, $options: "i" } } },
                { $project: { title: 1 } },
                { $skip: (page - 1) * count },
                { $limit: count },
            ]);
            assert(project, "Project policies not found");
            return {
                status: true,
                project
            };
        }
        catch (error) {
            if (error instanceof AssertionError)
                return {
                    status: false,
                    msg: error.message
                };
            console.log(error);
            return {
                status: false,
                msg: "Error"
            };
        }
    });
}
// Update
function updateProject(projectId, name, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Do auth
            var auth = yield checkRolePermissions(uId, [
                { admin: true }
            ]);
            assert(auth, "Auth Failed");
            var exists = yield projectModel.exists({ _id: projectId });
            assert(exists, "Project not found");
            var update = yield projectModel.updateOne({ _id: projectId }, {
                $set: { name }
            });
            assert(update, "Nothing to update");
            return {
                status: true,
                msg: "updated"
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
//  DELETE
function deleteProject(projectId, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Do auth
            var auth = yield checkRolePermissions(uId, [
                { admin: true }
            ]);
            assert(auth, "Auth Failed");
            var project = yield projectModel.findByIdAndDelete(projectId);
            assert(project, "Project not found");
            return {
                status: true,
                msg: "deleted"
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
export { create, getAll, getProject, getProjectPolicies, updateProject, deleteProject };
