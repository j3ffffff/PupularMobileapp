// ================================================================
// RescueGroups.org REST API v5
// Docs: https://api.rescuegroups.org/v5/public/docs
// Get your free API key: https://rescuegroups.org/services/adoptable-pet-data-api/
// ================================================================

const BASE_URL = 'https://api.rescuegroups.org/v5';

// 🔑 Your RescueGroups API key
export const API_KEY = 'EC1hI9ik';

const HEADERS = {
  'Content-Type': 'application/vnd.api+json',
  Authorization: API_KEY,
};

/**
 * Search for available animals near a postal code
 * Uses POST /public/animals/search/available with radius filter
 */
export async function searchAnimals({
  postalcode = '90210',
  miles = 100,
  species = null,       // 'dogs', 'cats', 'rabbits', etc.
  ageGroup = null,      // 'Baby', 'Young', 'Adult', 'Senior'
  sizeGroup = null,     // 'Small', 'Medium', 'Large', 'X-Large'
  sex = null,           // 'Male', 'Female'
  page = 1,
  limit = 20,
} = {}) {
  // Use species-specific URL path (e.g. available/dogs/) — confirmed working via API test.
  // Combined comma views like 'available,haspic' cause 500s.
  // Filter array for species also fails (animals.speciesID not a valid filter field).
  const viewName = species ? `available/${species}` : 'available';

  const filters = [];
  if (ageGroup) {
    filters.push({ fieldName: 'animals.ageGroup', operation: 'equal', criteria: ageGroup });
  }
  if (sizeGroup) {
    filters.push({ fieldName: 'animals.sizeGroup', operation: 'equal', criteria: sizeGroup });
  }
  if (sex) {
    filters.push({ fieldName: 'animals.sex', operation: 'equal', criteria: sex });
  }

  const body = {
    data: {
      filterRadius: {
        postalcode,
        miles,
      },
    },
  };

  if (filters.length > 0) {
    body.data.filters = filters;
  }

  const url = `${BASE_URL}/public/animals/search/${viewName}/?page=${page}&limit=${limit}&sort=random&include=pictures,species,breeds,orgs,locations`;

  // Try original radius, then expand, then go nationwide on persistent 500s
  const radiusFallbacks = [body, 
    { ...body, data: { ...body.data, filterRadius: { postalcode, miles: 250 } } },
    { ...body, data: { ...body.data, filterRadius: { postalcode: '90210', miles: 100 } } },
  ];

  let res;
  for (const attempt of radiusFallbacks) {
    for (let retry = 1; retry <= 3; retry++) {
      res = await fetch(url, { method: 'POST', headers: HEADERS, body: JSON.stringify(attempt) });
      if (res.ok || res.status !== 500) break;
      if (retry < 3) await new Promise((r) => setTimeout(r, retry * 600));
    }
    if (res.ok) break;
  }

  if (!res.ok) {
    throw new Error(`Couldn't load pets (server error ${res.status}). Tap retry — this is usually temporary.`);
  }

  const json = await res.json();
  return parseAnimalsResponse(json);
}

/**
 * Fetch a single animal by ID
 */
export async function fetchAnimalById(id) {
  const res = await fetch(
    `${BASE_URL}/public/animals/${id}?include=pictures,species,breeds,orgs,locations`,
    { headers: HEADERS }
  );
  if (!res.ok) throw new Error(`Animal ${id} not found`);
  const json = await res.json();
  const animal = Array.isArray(json.data) ? json.data[0] : json.data;
  return formatAnimal(animal, json.included || []);
}

/**
 * Parse the JSON:API response format into clean animal objects
 */
function parseAnimalsResponse(json) {
  const included = json.included || [];
  const animals = (json.data || []).map((a) => formatAnimal(a, included));

  return {
    animals,
    meta: json.meta || {},
    totalCount: json.meta?.count || 0,
    pages: json.meta?.pages || 1,
    page: json.meta?.pageReturned || 1,
  };
}

/**
 * Normalize a single RescueGroups animal into our app format
 */
function formatAnimal(animal, included = []) {
  const attr = animal.attributes || {};
  const relationships = animal.relationships || {};

  // Extract pictures from included
  const picIds = (relationships.pictures?.data || []).map((p) => p.id);
  const pictures = included
    .filter((i) => i.type === 'pictures' && picIds.includes(i.id))
    .sort((a, b) => (a.attributes?.order || 0) - (b.attributes?.order || 0));

  const photos = pictures
    .map((p) => p.attributes?.large?.url || p.attributes?.original?.url || p.attributes?.small?.url)
    .filter(Boolean);

  const primaryPhoto = photos[0] || attr.pictureThumbnailUrl || null;

  // Extract org
  const orgId = relationships.orgs?.data?.[0]?.id;
  const org = included.find((i) => i.type === 'orgs' && i.id === orgId);

  // Extract location
  const locId = relationships.locations?.data?.[0]?.id;
  const location = included.find((i) => i.type === 'locations' && i.id === locId);

  // Extract species
  const speciesId = relationships.species?.data?.[0]?.id;
  const species = included.find((i) => i.type === 'species' && i.id === speciesId);

  // Extract breeds
  const breedIds = (relationships.breeds?.data || []).map((b) => b.id);
  const breeds = included.filter((i) => i.type === 'breeds' && breedIds.includes(i.id));

  return {
    id: animal.id,
    name: attr.name || 'Unknown',
    species: species?.attributes?.singular || 'Pet',
    speciesPlural: species?.attributes?.plural || 'pets',
    breedPrimary: attr.breedPrimary || breeds[0]?.attributes?.name || 'Mixed Breed',
    breedSecondary: attr.breedSecondary || null,
    isMixed: attr.isBreedMixed || false,
    ageGroup: attr.ageGroup || 'Adult',
    ageString: attr.ageString || '',
    sex: attr.sex || 'Unknown',
    sizeGroup: attr.sizeGroup || 'Medium',
    sizeCurrent: attr.sizeCurrent || '',
    activityLevel: attr.activityLevel || null,
    energyLevel: attr.energyLevel || null,
    isKidsOk: attr.isKidsOk,
    isDogsOk: attr.isDogsOk,
    isCatsOk: attr.isCatsOk,
    isHousetrained: attr.isHousetrained,
    isAltered: attr.isAltered,
    isMicrochipped: attr.isMicrochipped,
    isCurrentVaccinations: attr.isCurrentVaccinations,
    isSpecialNeeds: attr.isSpecialNeeds,
    isNeedingFoster: attr.isNeedingFoster,
    coatLength: attr.coatLength,
    description: (attr.descriptionText || attr.summary || '').replace(/<[^>]*>/g, '').trim(),
    summary: attr.summary || '',
    photos,
    primaryPhoto,
    org: org
      ? {
          id: org.id,
          name: org.attributes?.name,
          email: org.attributes?.email,
          phone: org.attributes?.phone,
          url: org.attributes?.url,
          adoptionUrl: org.attributes?.adoptionUrl,
          city: org.attributes?.city,
          state: org.attributes?.state,
        }
      : null,
    location: location
      ? {
          city: location.attributes?.city,
          state: location.attributes?.state,
          postalcode: location.attributes?.postalcode,
        }
      : null,
    url: attr.url,
    distance: attr.distance || null,
    updatedDate: attr.updatedDate,
  };
}
