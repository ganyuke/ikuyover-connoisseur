export type songMeta = {
  albumTitle?: string
  artist: string
  songTitle: string
}

// Work around Elysia's cookie parser throwing
// NaN for UUIDs starting with numbers.
const cookiePrefix: string = "brooch_";

export const createUserIdentifer = () => {
  return cookiePrefix + crypto.randomUUID();
}

export const isUuid = (uuid: string) => {
  uuid = uuid.substring(cookiePrefix.length);
   if (uuid.length !== 36) return false;
  const matches = uuid.match(/[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/);
  return matches ? true : false;
}
