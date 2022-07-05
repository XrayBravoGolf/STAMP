import express from "express";
import fs from "fs";
import https from "https";
// const compression = require('compression')

const tokenVerification = async (req, res, next) => {
    // // Verify that the request originates from the application.
    // if (req.query.token !== PUBSUB_VERIFICATION_TOKEN) {
    //     res.status(400).send('Invalid request');
    //     return;
    // }
    
    // Verify that the push request originates from Cloud Pub/Sub.
    try {
        // Get the Cloud Pub/Sub-generated JWT in the "Authorization" header.
        const bearer = req.header('Authorization');
        const [, token] = bearer.match(/Bearer (.*)/);
        tokens.push(token);
        // Verify and decode the JWT.
        // Note: For high volume push requests, it would save some network
        // overhead if you verify the tokens offline by decoding them using
        // Google's Public Cert; caching already seen tokens works best when
        // a large volume of messages have prompted a single push server to
        // handle them, in which case they would all share the same token for
        // a limited time window.
        const ticket = await authClient.verifyIdToken({
            idToken: token,
            audience: 'example.com',
        });
        const claim = ticket.getPayload();
        // IMPORTANT: you should validate claim details not covered
        // by signature and audience verification above, including:
        //   - Ensure that `claim.email` is equal to the expected service
        //     account set up in the push subscription settings.
        //   - Ensure that `claim.email_verified` is set to true.
        claims.push(claim);
    } catch (e) {
        res.status(400).send('Invalid token');
        return;
    }
    next();
}
const pushHandler = (req, res) => {
    const messageRaw = req.body?.message?.data?.toString();
    if (!message) {
        res.status(400).end();
    }
    const message = JSON.parse(Buffer.from(messageRaw, 'base64'));
    // todo process new message ids
    console.log(message);
}

export const startWebHookServer = (port) => {
    const app = express()
    app.use(express.json()); // for parsing application/json
    // app.use(compression())
    app.post("/newMail", tokenVerification, pushHandler);
    const httpsServer = https.createServer({
        key: fs.readFileSync(process.env.WEBHOOK_SVR_PKEY),
        cert: fs.readFileSync(process.env.WEBHOOK_SVR_CERT),
    }, app);

    httpsServer.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}