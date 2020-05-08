const express = require("express");
const app = express();
const bodyParser = require("body-parser")
const cors = require('cors');

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(express.static(__dirname + "/uploaded"))
app.use(cors())

app.use("/api/data", require("./api_data.js"))
app.use("/api/cal", require("./api_calculate.js"))
app.use("/api/formular", require("./api_formular"))
app.use("/api/user", require("./api_user"))
app.use("/api/news", require("./api_news"))
app.use("/api/signal", require("./api_signal"))
app.use("/api/authen", require("./api_authen"))
app.use("/api/settings", require("./api_settings"))

require("./auto_send")

app.listen(8085, ()=>{
    console.log("Server is running...")
})

