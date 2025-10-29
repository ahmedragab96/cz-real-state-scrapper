export const CZ_COUNTRY_ID = 112;

const KLADNO_DISTRICT_ID = {
  name: 'Kladno',
  id: 50,
};
const KOLIN_DISTRICT_ID = {
  name: 'Kolín',
  id: 51,
};
const KUTNA_HORA_DISTRICT_ID = {
  name: 'Kutná Hora',
  id: 52,
};
const MELNIK_DISTRICT_ID = {
  name: 'Mělník',
  id: 53,
};
const MLADA_BOLESLAV_DISTRICT_ID = {
  name: 'Mladá Boleslav',
  id: 54,
};
const NYMBURK_DISTRICT_ID = {
  name: 'Nymburk',
  id: 55,
};
const PRAGUE_VYCHOD_DISTRICT_ID = {
  name: 'Praha-východ',
  id: 58,
};
const RAKOVNIK_DISTRICT_ID = {
  name: 'Rakovník',
  id: 59,
};

export const DISTRICT_IDS = [KLADNO_DISTRICT_ID, KOLIN_DISTRICT_ID, KUTNA_HORA_DISTRICT_ID, MELNIK_DISTRICT_ID, MLADA_BOLESLAV_DISTRICT_ID, NYMBURK_DISTRICT_ID, PRAGUE_VYCHOD_DISTRICT_ID, RAKOVNIK_DISTRICT_ID];

export const CATEGORY_MAIN_CB_HOUSE = 2; // 2 - domy

export const CATEGORY_TYPE_CB_SALE = 1; // 1 - SALE

export const CATEGORY_SUB_CB = [37, 43]; // 37 - rodinne domy, 43 - cottage

export const BUILDING_CONDITION = [1, 2]; // 1 - velmi dobry, 2 - dobry

export const ESTATE_AREA_FROM = 1000; // in m²

export const PRICE_TO = 6000000; // in CZK

export interface PropertyListing {
  id: string;
  title: string;
  location: {
    longitude: number;
    latitude: number;
    locality: string;
  };
  price: string;
  isAuction: boolean;
  company: {
    name: string;
    logoUrl?: string;
  };
  isNew: boolean;
}

export interface PropertyDetails {
  price: string;
  priceNote?: string;
  listingId?: string;
  updated?: string;
  material?: string;
  condition?: string;
  type?: string;
  floors?: string;
  builtUpArea?: number;
  usableArea?: number;
  landArea?: number;
  gardenArea?: number;
  garageCount?: number;
  water?: string;
  gas?: string;
  waste?: string;
  electricity?: string;
  energyClass?: string;
  furnished?: boolean;
  url?: string;
  fullDescription: string;
  images: string[];
}

export interface propertyInfo extends PropertyListing, PropertyDetails {}

export interface RegionListings {
  [region: string]: {
    count: number;
    data: propertyInfo[];
  };
}