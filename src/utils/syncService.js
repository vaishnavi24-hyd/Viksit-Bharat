import axios from "axios";
import { getAllRequests, clearRequests } from "./offlineDB";

export const syncRequests = async () => {
  const requests = await getAllRequests();

  if (!requests.length) return;

  console.log("🔄 Syncing offline data...");

  for (let req of requests) {
    try {
      if (req.type === 'complaint') {
        await axios.post("/api/complaints", req.data);
      } else if (req.type === 'sos') {
        await axios.post("/api/sos", req.data);
      }
    } catch (err) {
      console.error("❌ Sync failed for req", req.id, err);
      // Optional: continue instead of return to try syncing others
    }
  }

  await clearRequests();
  console.log("✅ All offline data synced");
};