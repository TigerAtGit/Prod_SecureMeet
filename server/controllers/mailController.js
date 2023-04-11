const nodemailer = require("nodemailer");
const dotenv = require('dotenv');

dotenv.config();

const user_email = process.env.MAIL_SENDER;
const password = process.env.MAIL_PASSWORD;

async function sendmail(req, res) {

    const { email } = req.body;

    const randomNum = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    const verificationCode = String(randomNum).slice(-6);

    let transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: user_email,
            pass: password,
        },
    });

    try {
        let info = await transporter.sendMail({
            from: '"SecureMeet" <tprojects@gmail.com>',
            to: email,
            subject: "OTP for Email verification",
            text: `Hello, your OTP for email verification is ${verificationCode}`,
        })
        console.log("Message sent: %s", info.messageId);
        res.status(200).json({
            success: true,
            verCode: verificationCode
        });
    } catch (err) {
        console.log("Error: %s", err);
        res.status(400).json({
            success: false
        });
    }

    // let info = await transporter.sendMail({
    //     from: '"SecureMeet" <tprojects@gmail.com>',
    //     to: email,
    //     subject: "OTP for Email verification",
    //     text: `Hello, your OTP for email verification is ${verificationCode}`,
    // }).then(() => {
    //     console.log("Message sent: %s", info.messageId);
    //     res.status(200).json({
    //         success: true,
    //         verCode: verificationCode
    //     });
    // }).catch(() => {
    //     res.status(400);
    // })

}


module.exports = sendmail;