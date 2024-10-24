import { Schema, model } from "mongoose";
const imagesSchema = new Schema({
    data: {
        type: Buffer
    },
    mime: {
        type: String
    }
});
const imagesModel = model("images", imagesSchema);
export default imagesModel;
