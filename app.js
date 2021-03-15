const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const os = require("os");
var fs = require('fs');


const networkInterfaces = os.networkInterfaces();
console.log(networkInterfaces);
// const ip = networkInterfaces["Wi-Fi"][1].address;

// const networkInterfaces = os.networkInterfaces();
// const ip = networkInterfaces.Ethernet[1].address;
const ip = "127.0.0.1";
require("dotenv/config");

//import routes
const productRoute = require("./routes/product");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");
const favoriteRoute = require("./routes/favorite");
const authRoute = require("./routes/auth");
const notification = require("./middlewares/pushNotification");

//Connect to DB
const dbURI = process.env.DB_CONNECTION;
mongoose.connect(
  dbURI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  },
  () => {
    app.listen(process.env.PORT,()=>{
      console.log("Server is running in "+ip+" Port : " +process.env.PORT );
    });
  
    let dirPath = path.join(
      __dirname,
      "public/api/static/images/productPictures"
    );
    let dirPathUser = path.join(
      __dirname,
      "public/api/static/images/userprofile"
    );
    createDir(dirPath);
    createDir(dirPathUser);
    console.log("Connected to DB");
  }
);

function createDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true }, (err) => {
      if (err) {
        console.error("createDir Error:", err);
      } else {
        console.log("Directory is made!");
      }
    });
  }
}

//middleware & static files
app.use(morgan("dev"));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: false, limit: "10mb" }));

//routes
app.get("/expo", (req, res) => {
  const id = req.query.userid;
  const token = req.query.token;
  console.log(id, token);
  res.json(301, {
    Location: `exp://${ip}:19000/--/ResetPw?userid=${id}&token=${token}`,
  });
  res.end();
});
app.use(`/api/${process.env.VERSION}/product`, productRoute);
app.use(`/api/${process.env.VERSION}/cart`, cartRoute);
app.use(`/api/${process.env.VERSION}/order`, orderRoute);
app.use(`/api/${process.env.VERSION}/favoritelist`, favoriteRoute);
app.use(`/api/${process.env.VERSION}/user`, authRoute);
app.use(`/api/notification`, notification);
