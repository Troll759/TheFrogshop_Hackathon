import dotenv from "dotenv";

import { createApp } from "./app.js";
import { logger } from "./utils/logger.js";

dotenv.config();

const app = createApp();
const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  logger.info("server.started", {
    port,
    url: `http://localhost:${port}`,
  });
});
