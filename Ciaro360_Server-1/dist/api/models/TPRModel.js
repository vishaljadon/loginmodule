var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Schema, model } from "mongoose";
const qnaSchema = new Schema({
    question: {
        type: String,
    },
    ans: {
        type: String,
    },
    type: {
        type: String,
        enum: ["Boolean", "String"],
    },
});
const TPRSchema = new Schema({
    title: {
        type: String,
        unique: true,
        required: true,
    },
    author: {
        type: [{ type: Schema.Types.ObjectId, ref: "users" }],
        ref: "users",
        required: true,
    },
    TPRUsers: {
        type: [{ type: Schema.Types.ObjectId, ref: "users" }],
        ref: "users",
        required: true,
    },
    qna: {
        type: [qnaSchema],
        required: true,
    },
    approved: {
        type: Boolean,
        default: false,
    },
});
TPRSchema.statics.isAuthor = function (tprId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const exists = yield this.exists({
            _id: tprId,
            author: userId,
        });
        return exists !== null;
    });
};
TPRSchema.statics.isTPRUser = function (tprId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(userId);
        const exists = yield this.exists({
            _id: tprId,
            TPRUsers: userId,
        });
        return exists !== null;
    });
};
TPRSchema.statics.isValidUser = function (trpId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const exists = yield this.exists({
            _id: trpId,
            $or: [{ author: userId }, { TPRUsers: userId }],
        });
        return exists !== null;
    });
};
const TPRModel = model("TPR", TPRSchema);
export default TPRModel;
