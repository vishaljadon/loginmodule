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
import * as userController from "../controllers/userController.js";
import { getAllNotifications } from "../controllers/notificationController.js";
const userRouter = Router();
// CREATE
userRouter.post('/invite', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { email } = req.body;
    if (isEmpty(email)) {
        res.sendStatus(404);
    }
    else {
        var data = yield userController.inviteUser(email, req.uId);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
}));
// RETRIVE
userRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    var page = parseInt((_a = req.query.page) === null || _a === void 0 ? void 0 : _a.toString());
    var count = parseInt((_b = req.query.count) === null || _b === void 0 ? void 0 : _b.toString());
    var username = req.query.username;
    if (isEmpty(page, count)) {
        res.sendStatus(404);
    }
    else {
        var data = yield userController.getUsers(page, count, username === null || username === void 0 ? void 0 : username.toString(), req.uId);
        data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
    }
}));
userRouter.get("/profile", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var data = yield userController.getUser(req.uId, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
userRouter.get("/notifications", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var data = yield getAllNotifications(req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
userRouter.get("/profile/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var data = yield userController.getUser(req.params.id, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
userRouter.get("/export/:type", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var type = req.params.type;
    var data = yield userController.exportUsers(type, req.uId);
    if (data.status && data.contentType) {
        res.setHeader('Content-Type', data.contentType);
        res.setHeader('Content-Disposition', `attachment; filename=${data.filename}`);
        res.send(data.data);
    }
    else {
        res.status(404).json(data);
    }
}));
// CHECK
userRouter.post('/acceptInvite', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { token, firstname, lastname, password } = req.body;
    var data = yield userController.saveUserByLink(token, firstname, lastname, password);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// LINK
userRouter.put("/link/:userId/:roleId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { userId, roleId } = req.params;
    var data = yield userController.linkRolesToUser(userId, roleId, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
userRouter.get("/logout", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(req.uId);
}));
// Update 
userRouter.put("/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var userId = req.params.userId;
    var { firstname, lastname, jobTitle, phone, mobilePhone, country, locale, active, image } = req.body;
    var data = yield userController.update(userId, {
        firstname,
        lastname,
        jobTitle,
        phone,
        mobilePhone,
        country,
        locale,
        active,
        image
    }, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// DELETE
userRouter.delete('/deleteBulk', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { ids } = req.body;
    var data = yield userController.deleteBulkUser(ids, req.uId);
    data.status ? res.json(data) : res.status(404).json(data);
}));
userRouter.delete('/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var userId = req.params.userId;
    var data = yield userController.deleteUser(userId, req.uId);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// inactive & active user
userRouter.put('/inactiveBulkUser', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { ids } = req.body;
    var data = yield userController.inactiveBulkUser(ids, req.uId);
    data.status ? res.json(data) : res.status(404).json(data);
}));
userRouter.put('/activeBulkUser', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { ids } = req.body;
    var data = yield userController.activeBulkUser(ids, req.uId);
    data.status ? res.json(data) : res.status(404).json(data);
}));
userRouter.put('/inactiveUser/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var userId = req.params.userId;
    var data = yield userController.inactiveUser(userId, req.uId);
    data.status ? res.json(data) : res.status(404).json(data);
}));
userRouter.put('/activeUser/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var userId = req.params.userId;
    var data = yield userController.activeUser(userId, req.uId);
    data.status ? res.json(data) : res.status(404).json(data);
}));
// CREATE DEMO
userRouter.post('/createUser', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var data = yield userController.saveUserDEMO(req.body);
    data.status ? res.json(data) : res.status(404).json(data); // send status code acc. to data.status
}));
// super admin email change
userRouter.post('/emailUpdateSA', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { email, otp } = req.body;
    var data = yield userController.updateEmail(email, otp, req.uId);
    data.status ? res.json(data) : res.status(404).json(data);
}));
userRouter.post('/updateSAEmailOTP', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var data = yield userController.changeEmailOTP(req.uId);
    data.status ? res.json(data) : res.status(404).json(data);
}));
// SA details
userRouter.post('/SADetails', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var data = yield userController.SADetails(req.uId);
    data.status ? res.json(data) : res.status(404).json(data);
}));
// change user password
userRouter.post('/changeUserPassword', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { email, password } = req.body;
    var data = yield userController.changeUserPassword(req.uId, email, password);
    data.status ? res.json(data) : res.status(404).json(data);
}));
export default userRouter;
