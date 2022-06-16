'use strict';
import { google } from "googleapis";
import fs from "fs";
import readline from "readline/promises";

let oauth2Client; // visible to module
const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/pubsub'
];

/**
 * Run authorize before using any other function. 
 * Behavior is undefined for which other methods are 
 * called without authorization, and likely results in error
 * 
 * Retrieves oAuth2 tokens from disk or obtain new one
 */
const authorizeOAuth = async () => {
    const credentialsFile = await fs.promises.readFile('secrets/credentials.json');
    const { client_secret, client_id, redirect_uris } = JSON.parse(credentialsFile).installed;
    oauth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
    );
    oauth2Client.on('tokens', (tokens) => {
        await fs.promises.writeFile('secrets/token.json', JSON.stringify(tokens));
    });

    let tokens;
    try {
        tokens = JSON.parse(await fs.promises.readFile('secrets/token.json'));
    } catch (err) {
        tokens = undefined;
    }
    //get new token if we don't have one
    if (!(tokens?.access_token && tokens?.refresh_token)) {
        // generate a url that asks permissions for Blogger and Google Calendar scopes
        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes
        });
        console.log('Visit this url to get a code: ', url);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        const code = await rl.question('Enter the code from that page here: ');
        rl.close();
        const getTokenRes = await oauth2Client.getToken(code);
        tokens = getTokenRes.tokens;
    }
    oauth2Client.setCredentials(tokens);

}

const startWatching = async (auth) => {
    const gmail = google.gmail({ version: 'v1', auth });
    gmail.users.watch({
        topicName: process.env.CLOUDPROJ_TOPIC_ID,
    });
    //TODO
}

/**
 * Lists the labels in the user's account.
 * @deprecated for demo only
 */
function listLabels() {
    const auth = oauth2Client;
    google.options({ auth: auth });
    const gmail = google.gmail({ version: 'v1' });
    gmail.users.labels.list({
        userId: 'me',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const labels = res.data.labels;
        if (labels.length) {
            console.log('Labels:');
            labels.forEach((label) => {
                console.log(`- ${label.name}`);
            });
        } else {
            console.log('No labels found.');
        }
    });
}
export { authorizeOAuth, listLabels, startWatching };