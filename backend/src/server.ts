import app from "./app";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(env.PORT, () => {
      console.log("===================================");
      console.log("🚀 HRMS Server Started");
      console.log(`🌍 Environment : ${env.NODE_ENV}`);
      console.log(`📡 Port        : ${env.PORT}`);
      console.log(`🔗 URL         : http://localhost:${env.PORT}`);
      console.log("===================================");
    });
  } catch (error) {
    console.error(error);
  }
};

startServer();