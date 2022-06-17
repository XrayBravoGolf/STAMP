/*
    stub to print oAuth code to console
*/

import express from "express";
const port = 8002

const app = express()
app.get("/", (req, res) => {
    const code = req.query.code?.toString();
    console.log(code);
    res.send(code).end();
});
app.listen(port, () => {
    console.log("Ready to print oAuth code from localhost:8002/");
});