var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import jwt from "jsonwebtoken";
function authenticateToken(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (token == null)
            return res.sendStatus(401);
        try {
            var data = yield new Promise((resolve, reject) => {
                jwt.verify(token, process.env.SECRET, (err, decoded) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(decoded);
                    }
                });
            });
            req.uId = data.uId;
            next();
        }
        catch (error) {
            res.sendStatus(403);
        }
    });
}
function makeToken(data, sessionTimeDay = 1) {
    var expiryDate = new Date();
    data.expiryDate = expiryDate.setDate(expiryDate.getDate() + sessionTimeDay);
    return jwt.sign(data, process.env.SECRET);
}
function getTokenData(tok) {
    return new Promise((resolve, reject) => {
        jwt.verify(tok, process.env.SECRET, (err, decoded) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(decoded);
            }
        });
    });
}
function setPasswordToken(data, sessionTimeDay = 2) {
    var expiryDate = new Date();
    data.expiryDate = expiryDate.setDate(expiryDate.getDate() + sessionTimeDay);
    return jwt.sign(data, process.env.SECRET);
}
export default authenticateToken;
export { makeToken, getTokenData, setPasswordToken };
