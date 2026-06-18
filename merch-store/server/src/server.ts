import { app } from "./app";
import { env } from "./config/env";
import { pendingOrdersSweeper } from "./modules/payments/pending-orders.sweeper";

app.listen(env.port, () => {
  console.log(`Server started on http://localhost:${env.port}`);
  pendingOrdersSweeper.startPendingOrdersSweeper();
});