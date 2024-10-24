var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import logsModel from "../models/logsModel.js";
import policyModel from "../models/policyModel.js";
import { Types } from "mongoose";
import { checkRolePermissions } from "../../utils/roles.js";
import assert from "assert";
// CREATE
function addLog(_a) {
    return __awaiter(this, arguments, void 0, function* ({ objectType, objectId, userId, action, description }) {
        try {
            // if(!masterData.log.category[objectType]) return null;
            const log = yield logsModel.create({
                objectType,
                objectId,
                userId,
                action,
                description
            });
            return log.id;
        }
        catch (error) {
            return null;
        }
    });
}
// Retrive 
function logs(uId, page, count, sortBydate) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // auth
            var auth = yield checkRolePermissions(uId, [
                { admin: true }
            ]);
            assert(auth, "Auth Failed");
            const logs = yield logsModel.aggregate([
                {
                    $sort: {
                        timestamp: sortBydate === 1 ? 1 : -1
                    }
                },
                { $skip: (page - 1) * count },
                { $limit: count },
            ]);
            return {
                status: true,
                data: logs
            };
        }
        catch (error) {
            if (error instanceof assert.AssertionError)
                return {
                    status: false,
                    msg: error.message
                };
            return {
                status: true,
                msg: "Error"
            };
        }
    });
}
function logs_policy(id, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var auth = yield checkRolePermissions(uId, [
                { admin: true }
            ]);
            assert(auth, "Auth Failed");
            var logs = yield policyModel.aggregate([
                { $match: { _id: new Types.ObjectId(id) } },
                { $project: { logs: 1 } },
            ]);
            logs[0].logs.reverse();
            yield logsModel.populate(logs, { path: 'logs' });
            return logs[0].logs;
        }
        catch (error) {
            if (error instanceof assert.AssertionError)
                return {
                    status: false,
                    msg: error.message
                };
            return {
                status: true,
                msg: "Error"
            };
        }
    });
}
export { addLog, logs, logs_policy };
