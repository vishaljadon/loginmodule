import { Schema, model } from "mongoose";
const ssoSchema = new Schema({
    idP_Name: {
        type: String,
        required: true
    },
    issuer: {
        type: String,
        required: true
    },
    ssoUrl: {
        type: String,
        required: true
    },
    cert: {
        type: String,
        required: true
    },
});
const ssoModel = model("sso", ssoSchema);
export default ssoModel;
