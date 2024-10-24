import {model,Schema} from "mongoose";

const riskTagsSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    risks: {
        type:[Schema.Types.ObjectId],
        ref: "risks",
    }
})

const riskTagsModel = model("riskTags",riskTagsSchema);
export default riskTagsModel;