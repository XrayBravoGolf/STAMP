import 'dotenv/config'
import { startWebHookServer } from './server.mjs'

const PORT = 8443;
// allow GCP to use our server
startWebHookServer(PORT);

