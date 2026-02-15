export function isObjectId(value: string) {
  return /^[a-fA-F0-9]{24}$/.test(value);
}
