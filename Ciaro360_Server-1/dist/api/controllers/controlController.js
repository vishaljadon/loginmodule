var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import controlsModel from "../models/controlsModel.js";
import { checkRolePermissions } from "../../utils/roles.js";
import assert, { AssertionError } from "assert";
import controlGroupsModel from "../models/controlGroupsModel.js";
import { getAndSetControlCounter } from "../models/counterModel.js";
// CREATE
function saveControl(uId, name, group, content) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { control: { fullAccess: true } }
            ]);
            assert(auth, "Auth Failed");
            var counterId = (yield getAndSetControlCounter()).toString();
            var control = yield controlsModel.create({
                content,
                name,
                nameId: counterId,
                group,
                created_by: uId,
                updated_by: uId,
                custom: true
            });
        }
        catch (error) {
            // console.log(error)
            return {
                status: false,
                msg: "Error creating Policy",
            };
        }
        return {
            status: true,
            msg: control.id,
        };
    });
}
function createControlGroup(groupName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var group = yield controlGroupsModel.create({ name: groupName });
            assert(group, "Group not created");
            return {
                status: true,
                msg: group._id
            };
        }
        catch (error) {
            if (error instanceof AssertionError)
                return {
                    status: true,
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
// async function getAllControls(_page: string, _count: string,search:string,uId: string): Promise<myResponse> {
//     try {
//         var auth = await checkRolePermissions(uId, [
//             { control: { view: true } }
//         ])
//         assert(auth, "Auth Failed")
//         var page = parseInt(_page)
//         var count = parseInt(_count)
//         const pipeline:PipelineStage[] = []
//         if(!!search){
//             pipeline.push({ $match: { $or:[
//                 {nameId: { $regex: `^${search}`, $options: "i" }},
//                 {name: { $regex: `${search}`, $options: "i" }},
//             ] } })
//         }
//         pipeline.push(
//             { $project: { content: 1, created_by: 1, created_at: 1, updated_at: 1, updated_by: 1} },
//             { $skip: (page - 1) * count },
//             { $limit: count },
//         )
//         const controls = await controlsModel.aggregate(pipeline);
//         return {
//             status: true,
//             controls
//         }
//     } catch (error) {
//         // console.log(error)
//         if (error instanceof AssertionError) return {
//             status: true,
//             msg: error.message
//         }
//         return {
//             status: false,
//             msg: "Error"
//         }
//     }
// }
function getAllControlsFromGroup(_page, _count, search, groupId, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { control: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            var page = parseInt(_page);
            var count = parseInt(_count);
            var matchPipeline = { $match: {} };
            if (!!groupId) {
                var group = yield controlGroupsModel.findById(groupId);
                matchPipeline.$match["_id"] = { $in: (group === null || group === void 0 ? void 0 : group.controls) || [] };
            }
            if (!!search) {
                matchPipeline.$match["$or"] = [
                    { nameId: { $regex: `^${search}`, $options: "i" } },
                    { name: { $regex: `${search}`, $options: "i" } },
                ];
            }
            const pipeline = [];
            if (!!search || !!groupId) {
                pipeline.push(matchPipeline);
            }
            pipeline.push({ $skip: (page - 1) * count }, { $limit: count });
            const controls = yield controlsModel.aggregate(pipeline);
            return {
                status: true,
                controls
            };
        }
        catch (error) {
            if (error instanceof AssertionError)
                return {
                    status: true,
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
function getAllGroups(_page, _count, search, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { control: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            var page = parseInt(_page);
            var count = parseInt(_count);
            const groups = yield controlGroupsModel.aggregate([
                { $match: { name: { $regex: search, $options: "i" } } },
                { $project: { name: 1 } },
                { $skip: (page - 1) * count },
                { $limit: count }
            ]);
            return {
                status: true,
                groups
            };
        }
        catch (error) {
            if (error instanceof AssertionError)
                return {
                    status: true,
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
function getSubControls(nameId, groupId, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { control: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            console.log(groupId);
            var group = yield controlGroupsModel.findById(groupId);
            assert(group, "Group not found");
            var controls = yield controlsModel.aggregate([
                { $match: {
                        _id: { $in: group.controls },
                        nameId: { $regex: `^${nameId}.`, $options: "i" },
                    } }
            ]);
            // var tmp = createNestedJsonWithSubDocs(controls)
            return {
                status: true,
                controls
                // controls:tmp
            };
        }
        catch (error) {
            if (error instanceof AssertionError)
                return {
                    status: true,
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
function getControl(id, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { control: { view: true } }
            ]);
            assert(auth, "Auth Failed");
            const control = yield controlsModel.findById(id);
            assert(control, "Control not found");
            return {
                status: true,
                control
            };
        }
        catch (error) {
            // console.log(error)
            if (error instanceof AssertionError)
                return {
                    status: true,
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
function updateControl(id, uId, content) {
    return __awaiter(this, void 0, void 0, function* () {
        // check if control exists
        try {
            var control = yield controlsModel.findById(id);
            if (control == null)
                return {
                    status: false,
                    msg: `No control with id: ${id}`
                };
            assert(control.custom, "Can't edit default controls");
            control.content = content;
            yield control.save();
            return {
                status: true,
                msg: `Control updated`
            };
        }
        catch (error) {
            return {
                status: false,
                msg: "Can't update"
            };
        }
    });
}
// DELETE
function deleteControl(id, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        // remove the control from database
        try {
            yield controlsModel.findByIdAndDelete(id);
        }
        catch (error) {
            // console.log(error)
            return {
                status: false,
                msg: `No control with id: ${id}`
            };
        }
        return {
            status: true,
            msg: `Control Deleted`
        };
    });
}
// CHECK
export { saveControl, 
// getAllControls,
createControlGroup, getAllControlsFromGroup, getSubControls, getAllGroups, getControl, updateControl, deleteControl };
