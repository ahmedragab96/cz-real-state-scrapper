import { ESTATE_AREA_FROM, PRICE_TO, PropertyDetails, propertyInfo, PropertyListing } from "./types";

export const mapPropertyListing = (property: any) => ({
  id: property.hash_id || property.hash || property.id,
  title: property.name,
  location: {
    longitude: property.gps?.lon,
    latitude: property.gps?.lat,
    locality: property.locality,
  },
  price: property.price,
  isAuction: property.is_auction,
  company: {
    name: property._embedded?.company?.name || "Unknown",
    logoUrl: property._embedded?.company?.logo_small || undefined,
  },
  isNew: property.new,
});

function extractLandArea(name: string): number | null {
  const match = name.match(/pozemek\s+([\d\s]+)\s*m²/i);
  if (!match) return null;
  return parseInt(match[1].replace(/\s/g, ""), 10);
}

// this happens before mapping. 
export const filterValidProperties = (property: any) => {
  const landArea = extractLandArea(property.name);
  const isLandAreaValid = landArea ? landArea >= ESTATE_AREA_FROM : true;
  const isPriceValid = property.price && +property.price > 1 && +property.price <= PRICE_TO;
  const isTitleValid = property.name && !property.name.includes("podílu");
  const isNotAuction = !property.is_auction;
  return isPriceValid && isLandAreaValid && isTitleValid && isNotAuction;
};

export const mapPropertyDetails = (propertyId: string, propertyDetails: any): PropertyDetails => {
  const items = propertyDetails.items as any[] || [];
  const get = (name: string) => items.find(i => i.name === name)?.value;

  return {
    price: get("Cena") || get("Celková cena"),
    priceNote: get("Poznámka k ceně"),
    listingId: get("ID zakázky"),
    updated: get("Aktualizace"),
    material: get("Stavba"),
    condition: get("Stav objektu"),
    type: get("Typ domu"),
    floors: get("Podlaží"),
    builtUpArea: Number(get("Plocha zastavěná")),
    usableArea: Number(get("Užitná plocha")),
    landArea: Number(get("Plocha pozemku")),
    gardenArea: Number(get("Plocha zahrady")),
    garageCount: Number(get("Garáž")),
    water: get("Voda")?.[0]?.value,
    gas: get("Plyn")?.[0]?.value,
    waste: get("Odpad")?.[0]?.value,
    electricity: get("Elektřina")?.[0]?.value,
    energyClass: get("Energetická náročnost budovy"),
    furnished: get("Vybavení"),
    url: `https://www.sreality.cz/detail/prodej/dum/rodinny/${propertyDetails.seo.locality}/${propertyId}`,
    fullDescription: propertyDetails.text.value,
    images: (propertyDetails._embedded.images?.map((img: any) => img._links.view.href) || []).slice(0, 4),
  };
}