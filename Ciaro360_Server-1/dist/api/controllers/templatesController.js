var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import templatesModel from "../models/templatesModel.js";
// CREATE
// RETRIVE
function getAllTemplates(page, count) {
    return __awaiter(this, void 0, void 0, function* () {
        var data = yield templatesModel.find({})
            .skip((page - 1) * count)
            .limit(count);
        return {
            status: true,
            templates: data
        };
    });
}
// UPDATE
// DELETE
export { getAllTemplates };
