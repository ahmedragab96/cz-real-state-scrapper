import axios from 'axios';
import pLimit from 'p-limit';
import { PropertyDetails, PropertyListing, CZ_COUNTRY_ID, BUILDING_CONDITION, CATEGORY_MAIN_CB_HOUSE, CATEGORY_SUB_CB, CATEGORY_TYPE_CB_SALE, DISTRICT_IDS, ESTATE_AREA_FROM, PRICE_TO, RegionListings, propertyInfo } from '../types';
import { filterValidProperties, mapPropertyDetails, mapPropertyListing } from './mappers';

const limit = pLimit(5);

const instance = axios.create({
  baseURL: 'https://www.sreality.cz/api/cs/v2',
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "cs-CZ,cs;q=0.9,en;q=0.8",
    "Referer": "https://www.sreality.cz/",
  },
  timeout: 10000,
});

const mapPropertyListings = (listings: Record<string, PropertyListing[]>) => {
  const newObject: RegionListings = {};
  Object.entries(listings).map((values) => {
    const districtName = values[0];
    const properties = values[1];
    const mappedProperties = properties.filter(filterValidProperties).map(mapPropertyListing);
    newObject[districtName] = { count: mappedProperties.length, data: mappedProperties as propertyInfo[] };
  });

  return newObject;
};

export async function fetchProperties() {
  const allListings: Record<string, PropertyListing[]> = {};
  const tasks: (() => Promise<void>)[] = [];

  for (const district of DISTRICT_IDS) {
    for (const sub of CATEGORY_SUB_CB) {
      for (const condition of BUILDING_CONDITION) {
        const params = {
          locality_country_id: CZ_COUNTRY_ID,
          locality_district_id: district.id,
          category_main_cb: CATEGORY_MAIN_CB_HOUSE,
          category_type_cb: CATEGORY_TYPE_CB_SALE,
          category_sub_cb: sub,
          building_condition: condition,
          estate_area_from: ESTATE_AREA_FROM,
          price_to: PRICE_TO,
          per_page: 100,
          page: 1,
        };

        tasks.push(
          () => limit(async () => {
            try {
              const res = await instance.get('/estates', { params });
              const estates = res.data._embedded?.estates ?? [];

              const current = allListings[district.name] || [];
              allListings[district.name] = [...current, ...estates];

              console.log(
                `Fetched ${estates.length} estates for ${district.name} (sub=${sub}, cond=${condition})`
              );
            } catch (err: any) {
              console.error(
                `Failed for ${district.name} (sub=${sub}, cond=${condition}):`,
                err.message
              );
            }
          })
        );
      }
    }
  }

  await Promise.all(tasks.map((t) => t()));

  const detailedListings = mapPropertyListings(allListings);

  const allPropertiesWithDetails = await fetchAllPropertiesDetails(detailedListings);

  return {
    allPropertiesWithDetails,
    propertiesCount: Object.values(detailedListings).reduce((sum, p) => sum + p.count, 0),
  };
}

export const fetchPropertyDetails = async (propertyId: string) => {
  const response = await instance.get(`/estates/${propertyId}`);
  return response.data;
};

export async function fetchAllPropertiesDetails(
  properties: RegionListings
): Promise<RegionListings> {
  const updated: typeof properties = {};

  const tasks: (() => Promise<void>)[] = [];

  for (const [district, { count, data }] of Object.entries(properties)) {
    updated[district] = { count, data: [] };

    for (const listing of data) {
      tasks.push(
        () => limit(async () => {
          try {
            const detail = await fetchPropertyDetails(listing.id);

            let isAuction = false;
            if (detail?.items) {
              isAuction = detail.items.some((item: any) => item.name === "Vyvolávací cena");
            }

            if (isAuction) {
              console.log(`⚠️ Skipping auction property ID ${listing.id}`);
              updated[district].count -= 1;
              return;
            }

            const parsed = mapPropertyDetails(listing.id, detail);
            updated[district].data.push({
              ...listing,
              ...parsed,
            });
            console.log(`✅ Fetched details for ${district} | ID ${listing.id}`);
          } catch (err: any) {
            console.error(`❌ Failed to fetch detail for ${listing.id}:`, err.message);
          }
        })
      );
    }
  }

  // Run all requests concurrently with limit
  await Promise.all(tasks.map((t) => t()));

  console.log("✅ All property details fetched");
  return updated;
}