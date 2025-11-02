import axios from "axios";
import { isEqual } from 'lodash'
import * as cheerio from "cheerio";
import { DISTRICT_IDS, propertyInfo } from "../types";
import { extractBuiltUpArea, extractLandArea } from "../../utils/extractLandArea";

interface IdnesPropertyListing {
  title: string;
  price: string;
  url: string;
  img?: string;
  address: string;
  region?: string;
}

export function extractIdFromUrl(url: string): string | null {
  const match = url.match(/\/([a-z0-9]+)\/?$/i);
  return match ? match[1] : null;
}

const extractPrice = (priceStr: string): string => {
  return parseInt(priceStr.replace(/[^\d]/g, ""), 10).toString();
}

const mapIdnesListing = (listing: IdnesPropertyListing): propertyInfo => {
  const landArea = extractLandArea(listing.title);
  const builtUpArea = extractBuiltUpArea(listing.title);
  return {
    id: listing.url ? `${extractIdFromUrl(listing.url)}` : "",
    title: listing.title,
    fullDescription: "",
    url: listing.url,
    price: extractPrice(listing.price),
    location: {
      locality: listing.address,
    },
    images: listing.img ? [listing.img] : [],
    landArea: landArea || undefined,
    builtUpArea: builtUpArea || undefined,
  };
}

const mapResultsToRegionListings = (listings: propertyInfo[]) => {
  const regionListings: { [region: string]: { count: number; data: propertyInfo[] } } = {};

  listings.forEach(listing => {
    const region = listing.location?.locality?.split("okres").pop()?.trim() || "Unknown";
    if (!DISTRICT_IDS.some(id => id.name === region)) {
      return;
    }
    if (!regionListings[region]) {
      regionListings[region] = { count: 0, data: [] };
    }
    regionListings[region].data.push(listing);
    regionListings[region].count += 1;
  });

  return regionListings;
}

export async function fetchIdnesListings() {
  const allListings: IdnesPropertyListing[] = [];
  let lastListingsArray: IdnesPropertyListing[] = [];

  for (let page = 0; page <= 100; page++) {
    const url = `https://reality.idnes.cz/s/prodej/domy/rodinne/cena-do-6000000/stredocesky-kraj/?s-qc%5BgroundAreaMin%5D=1000&s-rd=3&page=${page}`;
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    const listings = $(".c-products__item").map((_, el) => {
      const title = $(el).find(".c-products__title").text().trim();
      const price = $(el).find(".c-products__price").text().trim();
      const address = $(el).find(".c-products__info").text().trim();
      const region = address.split("okres").pop()?.trim() || "";
      const url = $(el).find("a.c-products__link").attr("href");
      const img = $(el).find("img").attr("data-src");

      return { title, price, url, img, address, region };
    }).get().filter(listing => listing.title && listing.price && listing.url) as IdnesPropertyListing[];

    if (isEqual(listings, lastListingsArray)) {
      break;
    }

    allListings.push(...listings);
    lastListingsArray = [...listings];
  }

  return mapResultsToRegionListings(allListings.map(mapIdnesListing));
}
