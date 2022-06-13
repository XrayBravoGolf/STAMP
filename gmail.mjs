import fs from "fs";
import readline from "readline/promises";
import { google } from "googleapis";

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// TODO set SCOPES


/**
 * @return {Promise<google.auth.OAuth2>} A promise that resolves to an authorized OAuth2 client.
 */
const authorizeOAuthClient = async () => {
  // The file token.json stores the user's access and refresh tokens, and is
  // created automatically when the authorization flow completes for the first
  // time.
  const TOKEN_PATH = 'secrets/token.json';

  // Load client secrets from a local file.
  let content;
  try {
    content = await fs.readFile('secrets/credentials.json');
  } catch (err) {
    console.log('Error loading client secret file:', err);
    throw err;
  }
  // Authorize a client with credentials, then call the Gmail API.
  return await authorize(JSON.parse(content));
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @return {Object} The OAuth2 client.
 */
async function authorize(credentials) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  try {
    const token = await fs.promises.readFile(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
  } catch (err) {
    return await getNewToken(oAuth2Client);
  }
  return oAuth2Client;
}

/**
 * Get and store new token after prompting for user authorization, and then
 * return the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @return {google.auth.OAuth2} The OAuth2 client.
 */
async function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const code = await rl.question('Enter the code from that page here: ');
  rl.close();
  try {
    const token = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(token);
    // Store the token to disk for later program executions
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
      if (err) return console.error(err);
      console.log('Token stored to', TOKEN_PATH);
    });
    callback(oAuth2Client);
  } catch (err) {
    console.error('Error retrieving access token', err);
    throw err;
  }
  return oAuth2Client;
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
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

export { authorizeOAuthClient };