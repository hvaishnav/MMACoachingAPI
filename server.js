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
  res.json({ message: "Welcome to MMA application. (10/09/2021)" });
});

//Registration
app.post("/api/signUp", async (req, res) => {
  try {
    const requestData = req.body;

    var queryToRegister =
      "SELECT * From scsecurity.createlogin(" +
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
      "' :: character varying," +
      requestData.p_appguid +
      " :: character varying, '" +
      requestData.p_createddate +
      "' :: timestamp(0))";
    const result = await dbConPool.query(queryToRegister);

    res.json(result["rows"]);
  } catch (err) {
    res.json({ status: 0, msg: JSON.stringify(err) });
  }
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

//Get category Detail
app.get("/api/GetCategoryList", async (req, res) => {
  var query = "Select * From scmasterdata.categorydetail;";
  const result = await dbConPool.query(query);

  res.json(result["rows"]);
});

// Add Daily Videos
app.post("/api/AddDailyVideos", async (req, res) => {
  try {
    const requestData = req.body;

    var queryToRegister =
      "SELECT * From scmasterdata.adddailyvideo(" +
      requestData.pdailyvideono +
      ":: integer, '" +
      requestData.ptitle +
      "' :: character varying, '" +
      requestData.plink +
      "' :: character varying," +
      requestData.pcategoryno +
      " :: integer,'" +
      requestData.pdate +
      "' :: timestamp without time zone," +
      requestData.pinactive +
      ":: boolean)";

    const result = await dbConPool.query(queryToRegister);

    res.json(result["rows"]);
  } catch (err) {}
});

//Get Daily Video based on user
app.post("/api/GetUserWiseDailyVideo", async (req, res) => {
  try {
    const requestData = req.body;
    var Query =
      "Select * From scmasterdata.getdailyvideo(" +
      requestData.pcategoryno +
      ":: int," +
      requestData.ploginno +
      ":: int)";

    const result = await dbConPool.query(Query);
    res.json(result["rows"]);
  } catch (err) {
    console.error(err.message);
  }
});

// Get Daily Video list
app.get("/api/GetDailyVideoList", async (req, res) => {
  var query = "Select * From scmasterdata.GetAllDailyVideo();";
  const result = await dbConPool.query(query);

  res.json(result["rows"]);
});

//GetSettingDetails
app.get("/api/GetSettingDetails", async (req, res) => {
  var query = "Select * From scutility.Setting;";
  const result = await dbConPool.query(query);

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
