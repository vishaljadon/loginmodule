// import passport from 'passport';
// import { Strategy as SamlStrategy, VerifiedCallback } from 'passport-saml';
// import ssoModel from '../models/ssoModel.js';
export {};
// export async function updatePassportConfig(unuse = true){
//     if(unuse) passport.unuse("samlAuth")
//     var sso = await ssoModel.findOne({})
//     if(sso){
//         passport.use("samlAuth",
//             new SamlStrategy(
//                 {
//                     entryPoint: sso.ssoUrl,
//                     issuer: sso.issuer,
//                     callbackUrl: 'http://localhost:4444/auth/saml',
//                     cert: sso.cert,
//                 },
//                 (profile: any, done: VerifiedCallback) => {
//                     return done(null, profile);
//                 }
//             )
//         );
//     }
// }
// passport.serializeUser(function (user, done) {
//     console.log(user)
//     done(null, user);
// });
// passport.deserializeUser(function (user: any, done) {
//     console.log(user)
//     done(null, user);
// });
// export default passport;
