var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import assert from "assert";
import masterRecordModel from "../models/masterRecordModel.js";
import { AssertionError } from "assert";
import { updatePassportConfig } from "./samlController.js";
import ssoModel from "../models/ssoModel.js";
import filesModel from "../models/filesModel.js";
import xml2js from 'xml2js';
// CREATE
function create(data, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // var auth = await checkRolePermissions(uId, [
            //     {onboarding:{fullAccess: true}}
            // ])
            // assert(auth, "Auth Failed")
            // @ts-ignore
            var _t = Object.keys(data.master.export.header).filter(_k => data.master.export.header[_k] === true).length;
            assert((_t <= 2) && (_t >= 1), "select max of 2 for header");
            // @ts-ignore
            var _t = Object.keys(data.master.export.footer).filter(_k => data.master.export.header[_k] === true).length;
            assert((_t <= 2) && (_t >= 1), "select max of 2 for footer");
            var _tmp = yield masterRecordModel.findOne({});
            assert(_tmp == null, "Onboarding is already compeleted");
            // const { licenseDetail, ...masterDataWithoutLicenseDetail } = data.master
            // await masterRecordModel.create(masterDataWithoutLicenseDetail)
            yield masterRecordModel.create(data.master);
            if (data.master.authSetup.sso.samlFile) {
                var _sso = yield readSamlFile(data.master.authSetup.sso.samlFile);
                if (_sso)
                    data.sso = _sso;
            }
            if (data.sso)
                yield ssoModel.create(data.sso);
            yield setGLobal();
            return {
                status: true
            };
        }
        catch (error) {
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message
                };
            }
            console.log(error);
            return {
                status: false,
                msg: "Error"
            };
        }
    });
}
function update(data, uId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // var auth = await checkRolePermissions(uId, [
            //     {onboarding:{fullAccess: true}}
            // ])
            // assert(auth, "Auth Failed")
            const _a = data.master, { licenseDetail, OrgDetails } = _a, masterDataWithoutLicenseDetail = __rest(_a, ["licenseDetail", "OrgDetails"]);
            // @ts-ignore
            var _tmpHeader = Object.keys(masterDataWithoutLicenseDetail.export.header).filter(_k => masterDataWithoutLicenseDetail.export.header[_k] === true).length;
            assert((_tmpHeader <= 2) && (_tmpHeader >= 1), "select max of 2 for header");
            // @ts-ignore
            var _tmpFooter = Object.keys(masterDataWithoutLicenseDetail.export.footer).filter(_k => masterDataWithoutLicenseDetail.export.footer[_k] === true).length;
            assert((_tmpFooter <= 2) && (_tmpFooter >= 1), "select max of 2 for footer");
            var updateQuery_1 = yield masterRecordModel.updateOne({}, masterDataWithoutLicenseDetail, { runValidators: true });
            if (global.masterData.authSetup.sso.enabled) {
                if (masterDataWithoutLicenseDetail.authSetup.sso.samlFile) {
                    var _sso = yield readSamlFile(masterDataWithoutLicenseDetail.authSetup.sso.samlFile);
                    if (_sso)
                        data.sso = _sso;
                }
                if (data.sso) {
                    var updateQuery_2 = yield masterRecordModel.updateOne({}, data.sso, { runValidators: true });
                    if (updateQuery_1.modifiedCount || updateQuery_2.modifiedCount)
                        yield setGLobal();
                }
            }
            else if (updateQuery_1.modifiedCount) {
                yield setGLobal();
            }
            return {
                status: true,
                data: global.masterData
            };
        }
        catch (error) {
            console.log(error.message);
            if (error instanceof AssertionError) {
                return {
                    status: false,
                    msg: error.message
                };
            }
            return {
                status: false,
                msg: "Error"
            };
        }
    });
}
function readSamlFile(fileId_1) {
    return __awaiter(this, arguments, void 0, function* (fileId, prevFileId = undefined) {
        try {
            // remove previous file
            if (prevFileId)
                yield filesModel.deleteOne({ _id: prevFileId });
            // read file
            var fileData = yield filesModel.findById(fileId);
            assert(fileData, "saml Not found");
            const parser = new xml2js.Parser();
            var data = yield new Promise((resolve, reject) => {
                parser.parseString(fileData.data.toString(), (err, metadata) => {
                    if (err) {
                        console.error('Error parsing SAML metadata:', err);
                        reject(err);
                        return;
                    }
                    resolve({
                        issuer: metadata.EntityDescriptor.$.entityID,
                        ssoUrl: metadata.EntityDescriptor.IDPSSODescriptor[0].SingleSignOnService[1].$.Location,
                        cert: `-----BEGIN CERTIFICATE-----\n${metadata.EntityDescriptor.IDPSSODescriptor[0].KeyDescriptor[0]['ds:KeyInfo'][0]['ds:X509Data'][0]['ds:X509Certificate'][0]}\n-----END CERTIFICATE-----\n`,
                    });
                });
            });
            assert(data);
            return {
                idP_Name: fileData.name.replace(".xml", ""),
                issuer: data.issuer,
                ssoUrl: data.ssoUrl,
                cert: data.cert
            };
        }
        catch (error) {
            return null;
        }
    });
}
function setGLobal() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        global.masterData = (yield masterRecordModel.findOne({}).lean());
        // if (global.masterData) initMailServer()
        // setup sso configs
        // read file 
        if ((_a = global.masterData) === null || _a === void 0 ? void 0 : _a.authSetup.sso.enabled)
            yield updatePassportConfig();
        console.log("MASTER DATA UPDATED");
    });
}
function view(uId, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // var auth = await checkRolePermissions(uId,[
            //     {admin: true}
            // ])
            // assert(auth,"Auth Failed")
            var masterData = yield masterRecordModel.findOne({});
            var ssoData = yield ssoModel.findOne({});
            const _a = (masterData === null || masterData === void 0 ? void 0 : masterData.toObject()) || {}, { apiKey, OrgDetails } = _a, masterWithoutApiKey = __rest(_a, ["apiKey", "OrgDetails"]);
            const _b = OrgDetails || {}, { date } = _b, orgDetailsWithoutDate = __rest(_b, ["date"]);
            // const { retentionPeriod, ...orgDetailsWithoutLogRtn} = log || {}
            const finalMasterData = Object.assign({ OrgDetails: orgDetailsWithoutDate }, masterWithoutApiKey);
            if (!(masterData === null || masterData === void 0 ? void 0 : masterData.authSetup.sso.enabled)) {
                return {
                    status: true,
                    data: {
                        master: finalMasterData
                    }
                };
            }
            return {
                status: true,
                data: {
                    master: finalMasterData,
                    sso: ssoData
                }
            };
        }
        catch (error) {
            if (error instanceof AssertionError)
                return {
                    status: false,
                    msg: error.message
                };
            return {
                status: false,
                msg: "Error"
            };
        }
    });
}
export { create, update, setGLobal, view };
