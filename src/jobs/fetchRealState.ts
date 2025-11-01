import { fetchProperties as fetchSrealityProperties } from "../scrapers/sreality";
import { sendEmail } from "../email/sendEmail";
import { filterNewListings, saveRegionListingsToDB } from "../db/mongo";

export const fetchRealStateJob = async () => {
  const listings = await fetchSrealityProperties();
  const newListings = await filterNewListings(listings.allPropertiesWithDetails);

  if (Object.keys(newListings).length <= 0) {
    return;
  }
  // Send email with new listings
  await sendEmail(newListings);
  // Save listings to database
  await saveRegionListingsToDB(newListings);
};