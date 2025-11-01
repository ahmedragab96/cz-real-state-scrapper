import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cron from "node-cron";
import { fetchProperties as fetchSrealityProperties, fetchPropertyDetails } from "./scrapers/sreality";
import { sendEmail } from "./email/sendEmail";
import { filterNewListings, saveRegionListingsToDB } from "./db/mongo";
import { fetchRealStateJob } from "./jobs/fetchRealState";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/properties", async (req: Request, res: Response) => {
  try {
    const listings = await fetchSrealityProperties();
    const newListings = await filterNewListings(listings.allPropertiesWithDetails);

    if (Object.keys(newListings).length <= 0) {
      res.json({
        success: true,
        message: "No new listings found",
      });
      return;
    }
    // Send email with new listings
    await sendEmail(newListings);
    // Save listings to database
    await saveRegionListingsToDB(newListings);
    res.json({
      success: true,
      count: Object.values(newListings).reduce((sum, p) => sum + p.count, 0),
      listings: newListings,
    });
  } catch (err: any) {
    console.error("Error fetching properties data:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/properties/:id", async (req: Request, res: Response) => {
  try {
    const propertyId = req.params.id;
    const propertyDetails = await fetchPropertyDetails(propertyId);
    res.json({
      success: true,
      property: propertyDetails,
    });
  } catch (err: any) {

  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});