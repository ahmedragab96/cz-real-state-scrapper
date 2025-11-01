import { fetchRealStateJob } from "./jobs/fetchRealState";

fetchRealStateJob()
  .then(() => {
    console.log("✅ Job completed successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Job failed:", err);
    process.exit(1);
  });
