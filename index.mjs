import 'dotenv/config'
import { startWebHookServer } from './server.mjs'
import { authorizeOAuth, listLabels, startWatching } from './gmail.mjs';
import { setHistoryId } from './history.mjs';

const PORT = 8443;
// allow GCP to use our server
startWebHookServer(PORT);
await authorize();
// listLabels(gmailAuth);
let history = await startWatching();
setHistoryId(history);
// call watch and refresh the history id every 24 hours
setInterval(async () => { 
    setHistoryId(await startWatching());
}, 24 * 60 * 60 * 1000);