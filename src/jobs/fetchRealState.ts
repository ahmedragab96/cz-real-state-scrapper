import { fetchProperties as fetchSrealityProperties } from "../scrapers/Sreality";
import { sendEmail } from "../email/sendEmail";
import { filterNewListings, saveRegionListingsToDB } from "../db/mongo";
import { fetchIdnesListings } from "../scrapers/IdnesReality";
import { mergeRegionListings } from "../utils/mergeListings";

export const fetchRealStateJob = async () => {
  console.log("Starting scheduled job to fetch properties");
  const Srealitylistings = await fetchSrealityProperties();
  const IdnesListings = await fetchIdnesListings();
  const listings = mergeRegionListings(
    Srealitylistings.allPropertiesWithDetails,
    IdnesListings
  );
  const newListings = await filterNewListings(listings.allPropertiesWithDetails);

  if (Object.keys(newListings).length <= 0) {
    return;
  }
  // Send email with new listings
  await sendEmail(newListings);
  // Save listings to database
  await saveRegionListingsToDB(newListings);
  console.log("Job completed successfully");
};