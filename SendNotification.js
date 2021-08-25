var nodemailer = require("nodemailer");
var globals = require("./globalvar");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: globals.user,
    pass: globals.pass,
  },
});

module.exports = {
  sendMail: function (mailOptions) {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  },
};
