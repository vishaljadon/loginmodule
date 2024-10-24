import { Schema, model } from "mongoose";
const fileSchema = new Schema({
    policyName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    filename: {
        type: String,
        required: true,
    },
    filePath: {
        type: String,
        required: true,
    },
    contentType: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
});
const File = model('File', fileSchema);
export default File;
