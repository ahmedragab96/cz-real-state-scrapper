import dotenv from "dotenv";
import cron from "node-cron";
import { fetchProperties as fetchSrealityProperties, fetchPropertyDetails } from "./scrapers/sreality";
import { sendEmail } from "./email/sendEmail";
import { filterNewListings, saveRegionListingsToDB } from "./db/mongo";


dotenv.config();

console.log("Scraper started...");

cron.schedule("0 7 * * *", async () => {
  try {
    const listings = await fetchSrealityProperties();
    const newListings = await filterNewListings(listings.allPropertiesWithDetails);

    if (Object.keys(newListings).length <= 0) {
      return;
    }
    // Send email with new listings
    await sendEmail(newListings);
    // Save listings to database
    await saveRegionListingsToDB(newListings);
  } catch (err: any) {
    console.error("Error fetching properties data:", err.message);
  }
});
