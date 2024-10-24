var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from "express";
import isEmpty from "../../utils/functions.js";
import passport from "../controllers/samlController.js";
import * as userController from "../controllers/userController.js";
import assert from "assert";
const publicRouter = Router();
publicRouter.post('/createSuperAdmin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { username, email } = req.body;
    assert(!(isEmpty(username, email)));
    var data = yield userController.createSuperAdmin(username, email);
    data.status ? res.json(data) : res.status(404).json(data);
}));
publicRouter.post('/sendToken', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { username, email } = req.body;
    assert(!(isEmpty(username, email)));
    var data = yield userController.sendToken(username, email);
    data.status ? res.json(data) : res.status(404).json(data);
}));
// for first time super Admin login api
function isEmail(email) {
    const Email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    return Email;
}
publicRouter.post('/verifySuperAdminInitialCredentials', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { username, token } = req.body;
    assert(!(isEmpty(username, token)));
    var data = yield userController.verifyLink(username, token);
    data.status ? res.json(data) : res.status(data._errorCode || 404).json(data);
}));
publicRouter.post('/sendOTP', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { username } = req.body;
    assert(!(isEmpty(username)));
    var data = yield userController.sendOTPMail(username);
    data.status ? res.json(data) : res.status(data._errorCode || 404).json(data);
}));
publicRouter.post('/verifyOTP', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { username, otp } = req.body;
    assert(!(isEmpty(username, otp)));
    var data = yield userController.verifyMailOTP(username, otp);
    data.status ? res.json(data) : res.status(data._errorCode || 404).json(data);
}));
publicRouter.post('/setSuperAdminPassword', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { username, password } = req.body;
    assert(!(isEmpty(username, password)));
    var data = yield userController.setPassword(username, password);
    data.status ? res.json(data) : res.status(data._errorCode || 404).json(data);
}));
// super Admin forgot password process
publicRouter.post("/superAdminForgotPassword", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { username } = req.body;
    assert(!(isEmpty(username)));
    var data = yield userController.superAdminForgotPassword(username);
    data.status ? res.json(data) : res.status(data._errorCode || 404).json(data);
}));
publicRouter.post("/validatePasswordResetToken", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { token } = req.body;
    assert(!(isEmpty(token)));
    var data = yield userController.verifyResetPasswordLink(token);
    data.status ? res.json(data) : res.status(data._errorCode || 404).json(data);
}));
publicRouter.post("/superAdminResetPassword", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { username, password } = req.body;
    assert(!(isEmpty(username, password)));
    var data = yield userController.superAdminResetPassword(username, password);
    data.status ? res.json(data) : res.status(data._errorCode || 404).json(data);
}));
// for the employees
publicRouter.post('/createUser/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    const { email } = req.body;
    const data = yield userController.createUser(id, email);
    data.status ? res.json(data) : res.status(data._errorCode || 404).json(data);
}));
publicRouter.post('/verifyUserInitialCredentials', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { token, email } = req.body;
    var data = yield userController.validateAccessLink(token, email);
    data.status ? res.json(data) : res.status(data._errorCode || 404).json(data);
}));
publicRouter.get('/getPasswordComplexity/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var id = req.params.id;
    assert(!(isEmpty(id)));
    var data = yield userController.passwordComplexity(id);
    data.status ? res.json(data) : res.status(404).json(data);
}));
publicRouter.post('/setUserPassword', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { email, password } = req.body;
    assert(!(isEmpty(email, password)));
    var data = yield userController.setUserPassword(email, password);
    data.status ? res.json(data) : res.status(404).json(data);
}));
publicRouter.get('/getPassComplexity/:token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var token = req.params.token;
    console.log(token);
    assert(!(isEmpty(token)));
    var data = yield userController.getPassComplexity(token);
    data.status ? res.json(data) : res.status(404).json(data);
}));
// ******************************************************************************
publicRouter.post('/checkUsername', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { username } = req.body;
    assert(!(isEmpty(username)));
    var data = yield userController.checkUsername(username);
    data.status ? res.json(data) : res.status(data._errorCode || 404).json(data);
}));
publicRouter.post('/checkEmail', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { email } = req.body;
    assert(!(isEmpty(email)));
    var data = yield userController.checkEmail(email);
    data.status ? res.json(data) : res.status(data._errorCode || 404).json(data);
}));
publicRouter.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var { email, password, isSuperAdmin } = req.body;
        if (!isSuperAdmin) {
            var data = yield userController.login(email, password);
            if (data.status) {
                if (!data.accessToken) {
                    req.session.verified = true;
                    req.session.uId = data.uId;
                }
                res.json(data);
            }
            else {
                res.status(404).json(data);
            }
        }
        else {
            var user = yield userController.superAdminLogin(email, password);
            if (user.status) {
                res.json(user);
            }
            else {
                res.status(user._errorCode || 404).json(user);
            }
        }
    }
    catch (error) {
        res.sendStatus(404);
    }
}));
publicRouter.post('/forgotPassword', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var email = req.body.email;
    var data = yield userController.forgotPassword(email);
    data.status ? res.json(data) : res.status(data._errorCode || 404).json(data);
}));
publicRouter.post('/resetPassword', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { token, password } = req.body;
    var data = yield userController.resetPassword(token, password);
    data.status ? res.json(data) : res.status(data._errorCode || 404).json(data);
}));
publicRouter.post('/refreshToken', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { refToken } = req.body;
    var data = yield userController.updateRefToken(refToken);
    data.status ? res.json(data) : res.status(data._errorCode || 404).json(data);
}));
publicRouter.post('/setupMfa', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { email, password } = req.body;
    var data = yield userController.getMfaSetupQrcode(email, password);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
publicRouter.post('/verifyMfa', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.session.verified) {
        var { token, email } = req.body;
        var data = yield userController.verifyMfa(token, email);
        if (data.status) {
            req.session.verified = false;
            res.json(data);
        }
        else {
            res.status(404).json(data);
        }
    }
    else {
        res.status(404).json({
            status: false,
            msg: "Not verified"
        });
    }
}));
publicRouter.post('/verifyEmailMfa', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.session.verified) {
        var { token, email } = req.body;
        var data = yield userController.verifyEmailMfa(token, email);
        if (data.status) {
            req.session.verified = false;
            res.json(data);
        }
        else {
            res.status(404).json(data);
        }
    }
    else {
        res.status(404).json({
            status: false,
            msg: "Not verified"
        });
    }
}));
publicRouter.post('/sendEmailOtp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { email } = req.body;
    var data = yield userController.sendEmailOtp(email);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
publicRouter.get("/sso", (req, res, next) => {
    try {
        if (global.masterData.authSetup.sso) {
            next();
        }
        else {
            res.sendStatus(403);
        }
    }
    catch (error) {
        res.sendStatus(403);
    }
}, passport.authenticate('samlAuth'));
publicRouter.post("/sso/success", passport.authenticate('samlAuth', { failureRedirect: '/sso' }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const relayState = req.body.RelayState;
    var data = yield userController.ssoCheckNSaveUser((_a = req.session.passport) === null || _a === void 0 ? void 0 : _a.user.nameID);
    res.redirect(relayState);
    // res.redirect('http://192.168.0.170:3000/dashboard')
    // res.redirect('http://localhost:3000/dashboard')
    // data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
export default publicRouter;
