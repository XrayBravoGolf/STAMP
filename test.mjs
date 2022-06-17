import { authorizeOAuth, listLabels } from "./gmail.mjs";
await authorizeOAuth();
await listLabels();