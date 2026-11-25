const ALLOWED_PROTOCOLS = ['http:', 'https:'];

// `ownHost` (ex. « localhost:3000 ») : le domaine d'ESGI.lnk lui-même.
export function isAllowedUrl(url: string, ownHost: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
    return false;
  }
  // Raccourcir un lien ESGI.lnk créerait une boucle de redirection.
  return parsed.host.toLowerCase() !== ownHost.toLowerCase();
}
