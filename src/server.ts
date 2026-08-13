import "dotenv/config";
import { createApp } from "./app";
import { loadModel } from "./ml/model";

const port = Number(process.env.PORT ?? 5000);

async function main() {
  await loadModel();

  const app = createApp();
  app.listen(port, () => {
    console.log(`MediAI Ghana backend listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
