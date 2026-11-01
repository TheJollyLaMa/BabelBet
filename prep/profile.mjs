export const PROFILE_KEY = 'babelbet-preparation-profile-v1';
export const MAX_IMPORT_BYTES = 65536;
const limits = { nickname: 80, languages: 200, notes: 2000 };
export function emptyProfile() { return { version: 1, nickname: '', languages: '', notes: '' }; }
export function validateProfile(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || value.version !== 1 ||
      Object.keys(value).some(key => !['version', ...Object.keys(limits)].includes(key))) {
    throw new Error('Only version 1 local preparation profiles with nickname, languages and notes are accepted.');
  }
  const result = emptyProfile();
  for (const [key, limit] of Object.entries(limits)) {
    if (typeof value[key] !== 'string' || value[key].length > limit) throw new Error(`Invalid ${key}: text of at most ${limit} characters required.`);
    result[key] = value[key];
  }
  return result;
}
export function parseProfile(text) {
  if (new TextEncoder().encode(text).length > MAX_IMPORT_BYTES) throw new Error('Profile exceeds 64 KiB.');
  return validateProfile(JSON.parse(text));
}
export function readProfile(storage) {
  const value = storage.getItem(PROFILE_KEY);
  return value === null ? emptyProfile() : parseProfile(value);
}
export function persistProfile(storage, profile, consent) {
  const result = validateProfile(profile);
  if (consent) storage.setItem(PROFILE_KEY, JSON.stringify(result));
  else storage.removeItem(PROFILE_KEY);
  return result;
}
