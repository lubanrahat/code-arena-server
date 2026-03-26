import http from "http";
import config from "./app/config/env";
import createApplication from "./app/app";
import { logger } from "./app/shared/logger/logger";

const app = createApplication();

function main() {
  if (process.env.VERCEL === "1") return;

  try {
    const port = Number(config.app.port);

    const server = http.createServer(app);

    server.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
  }
}

main();

export default app;

