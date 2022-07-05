import 'dotenv/config'
import { startWebHookServer } from './server.mjs'
import { authorizeOAuth, listLabels, startWatching, stopWatching } from './gmail.mjs';
import { setHistoryId } from './history.mjs'; //! STATEFUL SINGLEGTON

try {
    const PORT = 8443;
    // allow GCP to use our server
    startWebHookServer(PORT);
    /*
    await authorizeOAuth();
    setHistoryId(await startWatching());
    // call watch and refresh the history id every 24 hours
    setInterval(async () => {
        setHistoryId(await startWatching());
    }, 24 * 60 * 60 * 1000);
    */
    // stop gmail watch on SIGINT
    process.on('SIGINT', async () => {
        console.log('SIGINT received, stopping gmail watch');
        await stopWatching();
        process.exit();
    });
} catch (err) {
    await stopWatching();
    console.error(err);
    throw err;
}