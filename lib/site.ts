/** Public base URL of the site, used in links sent by email. */
export function siteUrl(): string {
  return (process.env.NEXTAUTH_URL || "https://www.certificategenerator.space").replace(/\/+$/, "");
}
