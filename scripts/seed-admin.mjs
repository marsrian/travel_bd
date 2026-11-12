
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "bangladesh_tourism";

const adminName = process.env.ADMIN_NAME || "Website Administrator";
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD;

if (!uri) {
  throw new Error("MONGODB_URI is missing from .env.local");
}

if (!adminEmail) {
  throw new Error("ADMIN_EMAIL is missing from .env.local");
}

if (!adminPassword || adminPassword.length < 12) {
  throw new Error(
    "ADMIN_PASSWORD must contain at least 12 characters."
  );
}

const client = new MongoClient(uri);

async function seedAdmin() {
  try {
    await client.connect();

    console.log("Connected to MongoDB.");

    const db = client.db(dbName);
    const adminsCollection = db.collection("admins");

    // Prevent duplicate admin email addresses
    await adminsCollection.createIndex(
      { email: 1 },
      { unique: true }
    );

    // Check whether this admin already exists
    const existingAdmin = await adminsCollection.findOne({
      email: adminEmail,
    });

    if (existingAdmin) {
      console.log("Admin account already exists.");
      console.log("No existing account was modified.");
      return;
    }

    // Hash the password before storing it
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    const admin = {
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: "admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await adminsCollection.insertOne(admin);

    console.log("Initial admin account created successfully.");
    console.log(`Admin email: ${adminEmail}`);
    console.log("Password saved as a secure hash.");
  } catch (error) {
    console.error("Admin seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

seedAdmin();
