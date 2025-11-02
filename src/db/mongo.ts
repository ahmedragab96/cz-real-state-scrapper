import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";
import { RegionListings } from "../scrapers/types";

dotenv.config();

const uri = process.env.MONGO_URI;
if (!uri) {
  throw new Error("Missing MONGO_URI in .env");
}

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDB(): Promise<Db> {
  if (db) return db;

  try {
    client = new MongoClient(uri as string);
    await client.connect();
    db = client.db();
    console.log("Connected to MongoDB");
    return db;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
}

export async function closeDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("MongoDB connection closed");
  }
}

export async function saveRegionListingsToDB(regionListings: RegionListings) {
  const db = await connectDB();
  const collection = db.collection("listings");

  const operations: any[] = [];

  for (const [regionName, regionData] of Object.entries(regionListings)) {
    for (const listing of regionData.data) {
      const id = `${regionName}-${listing.id}`;
      operations.push({
        updateOne: {
          filter: { id },
          update: {
            $set: {
              id,
              title: listing.title,
              price: listing.price,
              last_updated: listing.updated,
              url: listing.url,
              region: regionName,
            },
          },
          upsert: true,
        },
      });
    }
  }

  if (operations.length > 0) {
    await collection.bulkWrite(operations);
    console.log(`✅ Saved or updated ${operations.length} listings`);
  } else {
    console.log("⚠️ No listings to save");
  }
}

export async function filterNewListings(regionListings: RegionListings) {
  const db = await connectDB();
  const collection = db.collection("listings");

  const allListings = Object.entries(regionListings).flatMap(([region, data]) => data.data.map(listing => ({ ...listing, region })));

  const allIds = allListings.map(l => `${l.region}-${l.id}`);

  const existing = await collection
    .find({ id: { $in: allIds } })
    .project({ id: 1, last_updated: 1 })
    .toArray();

  const existingMap = new Map(existing.map(doc => [doc.id, doc.last_updated]));

  const newRegionListings: RegionListings = {};

  for (const [region, regionData] of Object.entries(regionListings)) {
    const newListings = regionData.data.filter(listing => {
      const id = `${region}-${listing.id}`;
      const existingUpdated = existingMap.get(id);
      if (!existingUpdated) return true;
      // Compare last_updated timestamps, return true if listing is newer
      return existingUpdated !== listing.updated;
    });

    if (newListings.length > 0) {
      newRegionListings[region] = {
        count: newListings.length,
        data: newListings,
      };
    }
  }

  return newRegionListings;
}
