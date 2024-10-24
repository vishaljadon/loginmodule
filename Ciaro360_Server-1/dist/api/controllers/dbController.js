var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { connect } from 'mongoose';
import { setGLobal } from './onboardingController.js';
export const DB_URL = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}`;
export default function initDB() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            connect(DB_URL).then(() => __awaiter(this, void 0, void 0, function* () {
                console.log("DB Connected");
                yield setGLobal();
                resolve(true);
            })).catch(e => {
                console.log(e);
                resolve(false);
            });
        });
    });
}
