import { RegionListings, propertyInfo } from "../scrapers/types";

export function mergeRegionListings(
  sreality: RegionListings,
  idnes: RegionListings
): {
  allPropertiesWithDetails: RegionListings;
  propertiesCount: number;
} {
  const merged: RegionListings = {};

  const allRegions = new Set([...Object.keys(sreality), ...Object.keys(idnes)]);

  for (const region of allRegions) {
    const listingsA = sreality[region]?.data || [];
    const listingsB = idnes[region]?.data || [];

    const combined = [...listingsA, ...listingsB];
    const unique: propertyInfo[] = [];

    for (const listing of combined) {
      const duplicate = unique.find(
        (u) =>
          Math.abs((u.builtUpArea ?? 0) - (listing.builtUpArea ?? 0)) < 2 &&
          Math.abs((u.landArea ?? 0) - (listing.landArea ?? 0)) < 5 &&
          normalizePrice(u.price) === normalizePrice(listing.price)
      );

      if (!duplicate) {
        unique.push(listing);
      } else {
        // Prefer Sreality (check url or company)
        if (
          isSrealityListing(listing) &&
          !isSrealityListing(duplicate)
        ) {
          const index = unique.indexOf(duplicate);
          unique[index] = listing;
        }
      }
    }

    merged[region] = {
      count: unique.length,
      data: unique,
    };
  }

  return {
    allPropertiesWithDetails: merged,
    propertiesCount: Object.values(merged).reduce((sum, p) => sum + p.count, 0),
  };
}

function normalizePrice(price: string): number {
  return parseInt(price?.replace(/[^\d]/g, "") || "0", 10);
}

function isSrealityListing(listing: propertyInfo): boolean {
  return listing.url?.includes("sreality.cz") || false;
}

