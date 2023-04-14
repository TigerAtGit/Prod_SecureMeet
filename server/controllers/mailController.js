const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const senderEmail = process.env.MAIL_SENDER;
const password = process.env.MAIL_PASSWORD;

async function sendOtp(req, res) {

    const { email } = req.body;

    const randomNum = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    const generatedOtp = String(randomNum).slice(-6);

    let transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: senderEmail,
            pass: password,
        },
    });

    try {
        let info = await transporter.sendMail({
            from: '"SecureMeet" <tprojects@gmail.com>',
            to: email,
            subject: "OTP for Email verification",
            html: `Hello, your OTP for email verification is <b>${generatedOtp}</b><br>` +
                `OTP will expire in next 5 minutes.`,
        })
        res.status(200).json({
            success: true,
        });
    } catch (err) {
        console.log("Error: %s", err);
        res.status(400).json({
            success: false
        });
    }

    return { email, generatedOtp };
}


module.exports = sendOtp;