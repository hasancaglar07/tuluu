const fs = require("node:fs");
const path = require("node:path");
const mongoose = require("mongoose");

function loadMongoUri() {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  const envPath = path.resolve(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) {
    return "";
  }

  const content = fs.readFileSync(envPath, "utf8");
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key === "MONGODB_URI" && value) {
      process.env.MONGODB_URI = value;
      return value;
    }
  }

  return "";
}

function parseTargetHearts() {
  const rawValue = process.argv[2] ?? process.env.TEST_HEARTS_BALANCE ?? "1500";
  const parsed = Number(rawValue);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(
      `Invalid hearts value "${rawValue}". Use a non-negative number.`
    );
  }

  return parsed;
}

async function main() {
  const targetHearts = parseTargetHearts();
  const mongoUri = loadMongoUri();

  if (!mongoUri) {
    throw new Error(
      "MONGODB_URI not found. Set it in environment or api/.env before running."
    );
  }

  await mongoose.connect(mongoUri);

  const usersCollection = mongoose.connection.collection("users");
  const result = await usersCollection.updateMany(
    {},
    { $set: { hearts: targetHearts } }
  );

  console.log(`Hearts updated to ${targetHearts}.`);
  console.log(`Matched users: ${result.matchedCount}`);
  console.log(`Modified users: ${result.modifiedCount}`);
}

main()
  .catch((error) => {
    console.error("Failed to update user hearts:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch {
      // no-op
    }
  });
