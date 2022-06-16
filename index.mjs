import 'dotenv/config'
import { startWebHookServer } from './server.mjs'
import { authorizeOAuth, listLabels, startWatching } from './gmail.mjs';

const PORT = 8443;
// allow GCP to use our server
startWebHookServer(PORT);
await authorize();
// listLabels(gmailAuth);
await startWatching();
