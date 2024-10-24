var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createTransport } from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
// let from = '';
let from = process.env.EMAIL_ADDRESS || '';
let transport = null;
export default function initMailServer() {
    console.log('Initializing mail server...');
    try {
        // from = global.masterData.OrgDetails.emailServer.auth.emailAddress; 
        if (transport)
            transport.close();
        transport = createTransport({
            // host: global.masterData.OrgDetails.emailServer.host,
            host: process.env.HOST,
            port: parseInt(process.env.EMAIL_PORT || '587'),
            // port:process.env.EMAIL_PORT
            // port: global.masterData.OrgDetails.emailServer.port,
            auth: {
                // user: global.masterData.OrgDetails.emailServer.auth.username,
                // pass: global.masterData.OrgDetails.emailServer.auth.password,
                user: process.env.USER,
                pass: process.env.PASS,
            },
            secure: false, // Set to true if using SSL
        });
        transport.verify((err, success) => {
            if (err) {
                console.log(err);
                process.exit(0);
            }
            else {
                console.log('Server is ready to take our messages');
            }
        });
    }
    catch (error) {
        console.error('Error initializing mail server:', error);
        process.exit(1);
    }
}
function sendMail() {
    return __awaiter(this, arguments, void 0, function* (opts = { to: '', subject: '', text: '' }) {
        try {
            if (!transport) {
                initMailServer();
            }
            opts.from = opts.from || from;
            if (!transport) {
                throw new Error('Transport initialization failed');
            }
            return yield transport.sendMail(opts);
        }
        catch (error) {
            console.error('Failed to send email:', error);
            throw error;
        }
    });
}
export { sendMail };
