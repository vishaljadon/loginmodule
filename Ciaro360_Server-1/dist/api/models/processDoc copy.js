import { Schema, model } from "mongoose";
const processDocSchema = new Schema({
    procedures: {
        type: [Schema.Types.ObjectId],
        ref: "procedures",
    },
    methodology: {
        type: String,
    },
    guidlines: {
        type: String,
    },
    others: {
        type: [Schema.Types.ObjectId],
        ref: "files",
    }
});
const processDocModel = model("processDocs", processDocSchema);
export default processDocModel;
