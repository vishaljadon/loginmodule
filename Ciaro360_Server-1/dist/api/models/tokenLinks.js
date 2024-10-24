import { Schema, model } from "mongoose";
const tokensSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: "users",
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    checkedIn: {
        type: Boolean,
        default: false,
    },
    expiryDate: {
        type: Date,
        required: true
    }
});
const tokensModel = model("links", tokensSchema);
export default tokensModel;
