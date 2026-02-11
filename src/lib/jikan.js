const JIKAN_BASE_URL = "https://api.jikan.moe/v4";

function truncate(text, maxLength) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 3))}...`;
}

async function searchJikan(endpoint, query, limit = 10) {
  const url = new URL(`${JIKAN_BASE_URL}/${endpoint}`);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Jikan request failed with status ${response.status}`);
  }

  const payload = await response.json();
  if (!payload?.data?.length) return null;
  return payload.data;
}

async function fetchCharacterAnime(characterId) {
  const response = await fetch(`${JIKAN_BASE_URL}/characters/${characterId}/anime`);
  if (!response.ok) return [];
  const payload = await response.json();
  return payload?.data || [];
}

async function fetchCharacterManga(characterId) {
  const response = await fetch(`${JIKAN_BASE_URL}/characters/${characterId}/manga`);
  if (!response.ok) return [];
  const payload = await response.json();
  return payload?.data || [];
}

async function fetchCharacterVoiceActors(characterId) {
  const response = await fetch(`${JIKAN_BASE_URL}/characters/${characterId}/voices`);
  if (!response.ok) return [];
  const payload = await response.json();
  return payload?.data || [];
}

module.exports = {
  truncate,
  searchAnime(query, limit = 10) {
    return searchJikan("anime", query, limit);
  },
  searchManga(query, limit = 10) {
    return searchJikan("manga", query, limit);
  },
  searchCharacter(query, limit = 10) {
    return searchJikan("characters", query, limit);
  },
  getCharacterAnime(characterId) {
    return fetchCharacterAnime(characterId);
  },
  getCharacterManga(characterId) {
    return fetchCharacterManga(characterId);
  },
  getCharacterVoiceActors(characterId) {
    return fetchCharacterVoiceActors(characterId);
  }
};
