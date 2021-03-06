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
        console.log("got tokens, saving to file");
        fs.writeFileSync('secrets/token.json', JSON.stringify(tokens));
    });

    let tokens;
    try {
        tokens = JSON.parse(await fs.promises.readFile('secrets/token.json'));
    } catch (err) {
        tokens = undefined;
    }
    //get new token if we don't have one
    let expired = tokens?.expiry_date < (Math.floor(new Date() / 1000));
    let hasRefreshtoken = tokens?.refresh_token ? true : false;
    if (!(tokens?.access_token) || (expired && !hasRefreshtoken)) {
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
/**
 * Expected to be called once every 24 hours
 * @returns the current history id
 */
const startWatching = async () => {
    const gmail = google.gmail({ version: 'v1', oauth2Client });
    const res = await gmail.users.watch({
        userId: 'me',
        requestBody: {
            labelIds: ['UNREAD'],
            topicName: process.env.CLOUDPROJ_TOPIC_ID,
            labelFilterAction: 'include',
        }
    });
    return res.data.historyId;
}

/**
 * stops the gmail watch
 */
const stopWatching = async () => {
    const gmail = google.gmail({ version: 'v1', oauth2Client });
    const res = await gmail.users.stop({
        userId: 'me',
    });
    console.log(res.data);
}

/**
 * a function to get all updates since given history id
 */
const getHistory = async (prevHistory) => {
    const gmail = google.gmail({ version: 'v1', oauth2Client });
    const res = await gmail.users.history.list({
        userId: 'me',
        historyId: prevHistory,
    });
    return res.data.history;
}
/**
 * Lists the labels in the user's account.
 * @deprecated for demo only
 */
async function listLabels() {
    const auth = oauth2Client;
    google.options({ auth: auth });
    const gmail = google.gmail({ version: 'v1' });
    // const res = await gmail.users.labels.list({ userId: 'me' });
    const res = await gmail.users.labels.list({ //* API CALL
        // The user's email address. The special value `me` can be used to indicate the authenticated user.
        userId: 'me',
    });
    const labels = res.data.labels;
    if (labels.length) {
        console.log('Labels:');
        labels.forEach((label) => {
            console.log(`- ${label.name}`);
        });
    } else {
        console.log('No labels found.');
    }

}
export { authorizeOAuth, listLabels, startWatching, stopWatching, getHistory };