const express = require("express");
//const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const dbConPool = require("./config/db.config");
const SendNotification = require("./SendNotification");
var globals = require("./globalvar");
// request option
const request = require("request");

var corsOptions = {
  origin: "*",
  method: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// simple route
app.get("/", async (req, res) => {
  res.json({ message: "Welcome to MMA application." });
});

//Registration
app.post("/api/signUp", async (req, res) => {
  try {
    const requestData = req.body;

    var queryToRegister =
      "SELECT scsecurity.createlogin(" +
      requestData.p_loginno +
      "::integer,'" +
      requestData.p_loginid +
      "':: character varying,'" +
      requestData.p_pwd +
      "' ::text ," +
      requestData.p_logintypeno +
      ":: smallint,'" +
      requestData.p_printingname +
      "' :: character varying ,'" +
      requestData.p_phoneno +
      "' :: character varying,'" +
      requestData.p_email +
      "' :: character varying,'" +
      requestData.p_appguid +
      "' :: character varying)";

    const result = await dbConPool.query(queryToRegister);

    var strArr = result["rows"][0]["createlogin"];

    res.json({
      status: strArr.split("_")[0],
      message: strArr.split("_")[1],
    });
  } catch (err) {}
});

// Validate one device login
app.post("/api/validateDeviceLogin", async (req, res) => {
  try {
    const requestData = req.body;
    var Query =
      "SELECT * From scsecurity.CheckDeviceLogin(" +
      +requestData.p_loginno +
      ":: integer,'" +
      requestData.p_appguid +
      "':: character varying)";
    // console.log(Query);
    const result = await dbConPool.query(Query);
    res.json(result["rows"][0]);
  } catch (err) {
    console.error(err.message);
    res.json({ status: 0, msg: err.message });
  }
});

// //validate otp
// app.post("/api/validateOTP", async (req, res) => {
//   try {
//     const requestData = req.body;
//     var Query =
//       "SELECT scutility.validateotp('" +
//       +requestData.p_otp +
//       "':: character varying,'" +
//       requestData.p_toemail +
//       "':: character varying)";

//     // console.log(Query);
//     const result = await dbConPool.query(Query);
//     var strArr = result["rows"][0]["validateotp"];
//     // if (strArr.split("_")[0] == 1) {
//     //     await GenerateAndSendMail(2, requestData.p_toemail, 4);
//     // }
//     res.json({
//       status: strArr.split("_")[0],
//       message: strArr.split("_")[1],
//     });
//   } catch (err) {
//     console.error(err.message);
//   }
// });

//Login
app.post("/api/signIn", async (req, res) => {
  try {
    const requestData = req.body;
    var Query =
      "Select scsecurity.loginselect('" +
      requestData.p_loginid +
      "':: character varying,'" +
      requestData.p_pwd +
      "':: character varying,'" +
      requestData.p_loginguid +
      "':: character varying)";

    //console.log(Query);
    const result = await dbConPool.query(Query);
    var strRes = result["rows"][0]["loginselect"];
    strRes = strRes.replace("(", "");
    strRes = strRes.replace(")", "");

    res.json({ result: JSON.stringify(strRes) });
  } catch (err) {
    console.error(err.message);
  }
});

// //Resend OTP
// app.post("/api/resendOTP", async (req, res) => {
//   try {
//     const requestData = req.body;
//     await GenerateAndSendMail(1, requestData.p_toemail, 4);

//     res.json({
//       status: 1,
//       message: "Check OTP !! Mail sent to :" + requestData.p_toemail,
//     });
//   } catch (err) {
//     console.error(err.message);
//   }
// });

// //Send Mail
// async function GenerateAndSendMail(templateNo, toemail, loginNo) {
//   var queryGenerateMail =
//     "SELECT scutility.generatemail(" +
//     "'" +
//     toemail +
//     "' :: character varying," +
//     templateNo +
//     " :: smallint," +
//     loginNo +
//     " :: integer)";

//   const result = await dbConPool.query(queryGenerateMail);
//   var strRes = result["rows"][0]["generatemail"];
//   strRes = strRes.replace("(", "");
//   strRes = strRes.replace(")", "");

//   var strArr = strRes.split(",");

//   globals.user = strArr[0];
//   globals.pass = strArr[1];

//   var mailOptions = {
//     from: strArr[0],
//     to: strArr[7],
//     subject: strArr[5],
//     text: strArr[6],
//   };

//   SendNotification.sendMail(mailOptions);
//   return strRes;
// }

//GetSettingDetails
app.get("/api/GetSettingDetails", async (req, res) => {
  var queryGenerateMail = "Select * From scutility.Setting;";
  const result = await dbConPool.query(queryGenerateMail);

  res.json(result["rows"][0]);
});

// Get Login Detail
app.post("/api/GetAllUserDetail", async (req, res) => {
  try {
    const requestData = req.body;

    var queryToRegister =
      "SELECT * From scsecurity.GetAllUsers(" +
      requestData.p_logintypeno +
      "::integer)";

    const result = await dbConPool.query(queryToRegister);

    var Arr = result["rows"];
    res.json({ result: Arr });
  } catch (err) {}
});

// Make User Active Or InActive
app.post("/api/MakeUserActiveOrInActive", async (req, res) => {
  try {
    const requestData = req.body;
    var queryToRegister =
      "Select * From scsecurity.MakeUserActiveOrInActive('" +
      requestData.strLoginNo +
      "' :: varchar(100),'" +
      requestData.InActive +
      "':: boolean)";
    const result = await dbConPool.query(queryToRegister);
    res.json({ result: result["rows"] });
  } catch (err) {}
});

// Reset Auth Token
app.post("/api/ResetAuthToken", async (req, res) => {
  //console.log(req.body, "request");
  try {
    request.post(
      {
        url: "https://api.dailymotion.com/oauth/token",
        form: req.body,
      },
      async function (err, httpResponse, body) {
        if (body) {
          var updateTokens =
            "Update Scutility.setting set" +
            " accesstoken = '" +
            JSON.parse(body)["access_token"] +
            "' Where settingNo = 1";
          //console.log(updateTokens, "Query");
          const result = await dbConPool.query(updateTokens);
          res.json({ status: 1, result: body });
        }
      }
    );
  } catch (ex) {
    res.json({ status: 0, result: ex.message });
  }
});

// set port, listen for requests
const PORT = process.env.PORT || 50535;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
