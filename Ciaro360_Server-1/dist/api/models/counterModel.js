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
const counterSchema = new Schema({
    name: {
        type: String
    },
    seq: {
        type: Number,
        default: 0
    }
});
const counterModel = model("counter", counterSchema);
export function getAndSetPolicyCounter() {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield counterModel.findOneAndUpdate({ name: "policies" }, {
            $inc: {
                seq: 1
            }
        }, { upsert: true, returnOriginal: false })).seq;
    });
}
export function getAndSetControlCounter() {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield counterModel.findOneAndUpdate({ name: "controls" }, {
            $inc: {
                seq: 1
            }
        }, { upsert: true, returnOriginal: false })).seq;
    });
}
export default counterModel;
