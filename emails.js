const nodemailer = require("nodemailer");
var templateZero = require("./email-templates/templateZero.js");

const sender = (template, userEmail) => {
    
    async function main(){

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport(
            {
                host: "smtp.gmail.com",
                port: 465,
                domain: "google.com",
                secure: true, // true for 465, false for other ports
                service: "Gmail",
                auth: {
                    user: process.env.USERNAME, // generated ethereal user
                    pass: process.env.PASS // generated ethereal password
                }
                
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
        from: '"Fetchspot.io" <openwellsllc@gmail.com>', // sender address
        to: userEmail, // list of receivers
        subject: `Password reset request`, // Subject line
        text: "Opportunity to build a connection", // plain text body
        html:  template
        // html body
        });
    
        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }
    
    main().catch(console.error);
}

const sendResetPasswordEmail = (foundUser) => {
    console.log('found user: ' + foundUser);
    const userEmail = foundUser.email;
    const userName = foundUser.name;
    const userId = foundUser._id;
    sender(templateZero(userName, userId), userEmail);
}

module.exports = sendResetPasswordEmail;