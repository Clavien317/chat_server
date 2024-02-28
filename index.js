const express = require("express")
const app = express()
const port = 4000
const cors = require("cors")
const route = require("./route/route")


app.use(cors());
app.use(express.json());
app.use(route)


app.listen(port, console.log("serveur demarre...."))