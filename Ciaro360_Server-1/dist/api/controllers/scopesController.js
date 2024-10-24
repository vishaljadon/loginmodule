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
import scopesModel from "../models/scopes.js";
import projectModel from "../models/projectModel.js";
// CREATE
function createScope(scopeName, description, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // TODO: auth code
            var scope = yield scopesModel.create({ name: scopeName, description });
            return {
                status: true,
                msg: scope.id
            };
        }
        catch (error) {
            if (error.name === "MongoServerError" && error.code === 11000)
                return {
                    status: false,
                    msg: "Name is dublicate",
                };
            return {
                status: false,
                msg: "Error"
            };
        }
    });
}
function addOneProjectToManyScopes(projectId, scopes, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // TODO: Auth check
            var projectCheck = yield projectModel.exists({ _id: projectId });
            assert(projectCheck, "Project not found");
            yield Promise.all(scopes.map((scope) => __awaiter(this, void 0, void 0, function* () {
                assert(yield scopesModel.exists({ _id: scope }), "Scope not found");
            })));
            var update = yield projectModel.updateOne({ _id: projectId }, {
                $addToSet: {
                    scopes: scopes
                }
            });
            var update = yield scopesModel.updateMany({ _id: scopes }, {
                $addToSet: {
                    projects: projectId
                }
            });
            return {
                status: true,
                msg: "Project linked to scopes"
            };
        }
        catch (error) {
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message
                };
            }
            return {
                status: false,
                msg: "Error"
            };
        }
    });
}
function addOneScopeToManyProjects(scopeId, projects, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // TODO: Auth check
            var scopeCheck = yield scopesModel.exists({ _id: scopeId });
            assert(scopeCheck, "Scope not found");
            // TODO: check if projects exists
            yield Promise.all(projects.map((project) => __awaiter(this, void 0, void 0, function* () {
                assert(yield projectModel.exists({ _id: project }), "Project not found");
            })));
            var update = yield scopesModel.updateOne({ _id: scopeId }, {
                $addToSet: {
                    projects: projects
                }
            });
            var update = yield projectModel.updateMany({ _id: projects }, {
                $addToSet: {
                    scopes: scopeId
                }
            });
            return {
                status: true,
                msg: "Scope linked to projects"
            };
        }
        catch (error) {
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message
                };
            }
            return {
                status: false,
                msg: "Error"
            };
        }
    });
}
// RETRIVE
function getAllScopes() {
    return __awaiter(this, arguments, void 0, function* (page = 1, count = 10, scopeName = "") {
        try {
            const scopes = yield scopesModel.aggregate([
                { $match: { name: { $regex: scopeName, $options: "i" } } },
                { $skip: (page - 1) * count },
                { $limit: count },
            ]);
            yield projectModel.populate(scopes, { path: "projects", select: { name: 1 } });
            return {
                status: true,
                scopes: scopes,
            };
        }
        catch (error) {
            console.log(error);
            return {
                status: false,
                msg: "Error",
            };
        }
    });
}
// UPDATE
function updateScope(scopeId, name, description, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // TODO: auth ?
            var scope = yield scopesModel.exists({ _id: scopeId });
            assert(scope, "Scope not found");
            yield scopesModel.updateOne({ _id: scopeId }, {
                $set: {
                    name, description
                }
            });
            return {
                status: true,
                msg: "Scope update",
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
                msg: "Error",
            };
        }
    });
}
// DELETE
function deleteScope(scopeId, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var scope = yield scopesModel.findByIdAndDelete({ _id: scopeId });
            assert(scope, `No scope with id: ${scopeId}`);
            // remove scopes from the projects
            if (scope.projects) {
                yield projectModel.updateMany({ _id: scope.projects }, { $pull: { scopes: scopeId } });
            }
            return {
                status: true,
                msg: "Deleted the scope",
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
                msg: "Error",
            };
        }
    });
}
function rmOneScopeFromManyProjects(scopeId_1) {
    return __awaiter(this, arguments, void 0, function* (scopeId, projects = [], uId) {
        try {
            var scope = yield scopesModel.exists({ _id: scopeId });
            assert(scope, `No scope with id: ${scopeId}`);
            yield Promise.all(projects.map((project) => __awaiter(this, void 0, void 0, function* () {
                assert(yield projectModel.exists({ _id: project }), "Project not found");
            })));
            yield scopesModel.updateOne({ _id: scopeId }, {
                $pull: {
                    projects: {
                        $in: projects
                    }
                }
            });
            return {
                status: true,
                msg: "removed projects from scope",
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
                msg: "Error",
            };
        }
    });
}
export { createScope, addOneProjectToManyScopes, addOneScopeToManyProjects, getAllScopes, updateScope, deleteScope, rmOneScopeFromManyProjects };
