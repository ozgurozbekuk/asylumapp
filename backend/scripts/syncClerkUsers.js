import dotenv from "dotenv";
import { createClerkClient } from "@clerk/backend";
import { connectDb } from "../config/db.js";
import { UserProfile } from "../models/UserProfile.js";
import { normalizePlan } from "../services/planService.js";

dotenv.config({ path: new URL("../.env", import.meta.url) });

const REQUIRED_ENV = ["CLERK_SECRET_KEY", "MONGO_DB_URI"];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length) {
  // eslint-disable-next-line no-console
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const getPrimaryEmail = (user) => {
  if (!user?.emailAddresses?.length) return null;
  const primary = user.emailAddresses.find((item) => item.id === user.primaryEmailAddressId);
  return (primary || user.emailAddresses[0])?.emailAddress || null;
};

const getDisplayName = (user) => {
  const first = user?.firstName || "";
  const last = user?.lastName || "";
  const full = `${first} ${last}`.trim();
  return full || null;
};

const parsePlanFromClerkMetadata = (user) => {
  const candidates = [
    user?.publicMetadata?.plan,
    user?.privateMetadata?.plan,
    user?.unsafeMetadata?.plan,
    user?.publicMetadata?.subscriptionPlan,
    user?.privateMetadata?.subscriptionPlan,
  ];

  for (const value of candidates) {
    if (typeof value !== "string") continue;
    const normalized = normalizePlan(value.toLowerCase().trim());
    if (["free", "plus", "pro"].includes(normalized)) {
      return normalized;
    }
  }

  return null;
};

const syncUsers = async () => {
  const limit = 100;
  let offset = 0;
  let totalCount = 0;
  let processed = 0;
  let createdOrUpdated = 0;

  while (true) {
    const response = await clerkClient.users.getUserList({ limit, offset });
    const users = response?.data || [];
    totalCount = response?.totalCount || totalCount;

    if (!users.length) break;

    for (const user of users) {
      const planFromClerk = parsePlanFromClerkMetadata(user);
      const nowIso = new Date().toISOString();

      const set = {
        email: getPrimaryEmail(user),
        name: getDisplayName(user),
        "metadata.clerkSync.lastSyncedAt": nowIso,
        "metadata.clerkSync.clerkUserId": user.id,
        "metadata.clerkSync.clerkCreatedAt": user.createdAt || null,
        "metadata.clerkSync.clerkUpdatedAt": user.updatedAt || null,
        "metadata.clerkSync.lastSignInAt": user.lastSignInAt || null,
      };

      if (planFromClerk) {
        set.plan = planFromClerk;
      }

      const result = await UserProfile.updateOne(
        { userId: user.id },
        {
          $set: set,
          $setOnInsert: { userId: user.id, plan: "free" },
        },
        { upsert: true },
      );

      if (result?.matchedCount || result?.upsertedCount) {
        createdOrUpdated += 1;
      }
      processed += 1;
    }

    offset += users.length;
    if (totalCount && offset >= totalCount) break;
  }

  // eslint-disable-next-line no-console
  console.log(
    `Clerk user sync completed. processed=${processed}, upserted=${createdOrUpdated}, total=${totalCount || processed}`,
  );
};

const run = async () => {
  try {
    await connectDb();
    await syncUsers();
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to sync Clerk users:", error?.message || error);
    process.exit(1);
  }
};

run();

