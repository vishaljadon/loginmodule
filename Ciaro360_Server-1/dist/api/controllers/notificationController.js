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
import notificationModel from "../models/notificationModel.js";
import userModel from "../models/userModel.js";
// CREATE
function createNotification(userId, content) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var userExists = yield userModel.exists({ _id: userId });
            assert(userExists);
            var notification = yield notificationModel.exists({
                userId: userId
            });
            if (!notification) {
                // @ts-ignore
                var notification = yield notificationModel.create({
                    userId: userId
                });
            }
            assert(notification);
            yield notificationModel.updateOne({ _id: notification._id }, {
                $push: {
                    notifications: {
                        content,
                        date: Date.now(),
                        viewed: false
                    }
                }
            });
            return true;
        }
        catch (error) {
            return false;
        }
    });
}
// RETRIVE
function getAllNotifications(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // auth
            // var auth  = await isAdmin(uId)
            // var auth = userId == uId
            // if(auth){
            // }
            // assert(auth,"Auth Failed")
            var notification = yield notificationModel.findOne({
                userId
            });
            assert(notification, "No notifications");
            return {
                status: true,
                notifications: notification.notifications
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
export { createNotification, getAllNotifications };
