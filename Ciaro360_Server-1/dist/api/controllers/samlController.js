var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import passport from 'passport';
import { Strategy as SamlStrategy } from 'passport-saml';
import ssoModel from '../models/ssoModel.js';
export function updatePassportConfig() {
    return __awaiter(this, arguments, void 0, function* (unuse = true) {
        if (unuse)
            passport.unuse("samlAuth");
        var sso = yield ssoModel.findOne({});
        if (sso) {
            passport.use("samlAuth", new SamlStrategy({
                entryPoint: sso.ssoUrl,
                issuer: sso.issuer,
                callbackUrl: 'http://localhost:4444/auth/sso/success',
                cert: sso.cert,
            }, (profile, done) => {
                return done(null, profile);
            }));
            console.log("updated sso configs");
        }
    });
}
passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (user, done) {
    done(null, user);
});
export default passport;
