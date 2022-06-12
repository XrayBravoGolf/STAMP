import express from "express";
import fs from "fs";
import https from "https";
// const compression = require('compression')

const app = express()
const port = 8443
// app.use(compression())
app.post("/newMail", (req, res) => {
    //todo handle the sub
});
const httpsServer = https.createServer({
    key: fs.readFileSync(process.env.WEBHOOK_SVR_PKEY),
    cert: fs.readFileSync(process.env.WEBHOOK_SVR_CERT),
}, app);

httpsServer.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})
