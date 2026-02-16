/**
 * Country name → ISO 3166-1 alpha-2 code mapping.
 * Used to render flag images via flagcdn.com so flags work on all platforms
 * (Windows does not render emoji flags).
 */
export const countryCodes: Record<string, string> = {
  "السعودية": "SA", "Saudi Arabia": "SA", "Arab Saudi": "SA", "Arabie Saoudite": "SA",
  "الإمارات": "AE", "UAE": "AE", "UEA": "AE", "EAU": "AE",
  "الكويت": "KW", "Kuwait": "KW", "Koweït": "KW",
  "البحرين": "BH", "Bahrain": "BH", "Bahreïn": "BH",
  "قطر": "QA", "Qatar": "QA",
  "عمان": "OM", "Oman": "OM",
  "مصر": "EG", "Egypt": "EG", "Mesir": "EG", "Égypte": "EG",
  "الأردن": "JO", "Jordan": "JO", "Yordania": "JO", "Jordanie": "JO",
  "العراق": "IQ", "Iraq": "IQ", "Irak": "IQ",
  "فلسطين": "PS", "Palestine": "PS", "Palestina": "PS",
  "لبنان": "LB", "Lebanon": "LB", "Liban": "LB",
  "سوريا": "SY", "Syria": "SY", "Suriah": "SY", "Syrie": "SY",
  "اليمن": "YE", "Yemen": "YE", "Yaman": "YE", "Yémen": "YE",
  "ليبيا": "LY", "Libya": "LY", "Libye": "LY",
  "تونس": "TN", "Tunisia": "TN", "Tunisie": "TN",
  "الجزائر": "DZ", "Algeria": "DZ", "Aljazair": "DZ", "Algérie": "DZ",
  "المغرب": "MA", "Morocco": "MA", "Maroko": "MA", "Maroc": "MA",
  "السودان": "SD", "Sudan": "SD", "Soudan": "SD",
  "الصومال": "SO", "Somalia": "SO", "Somalie": "SO",
  "جيبوتي": "DJ", "Djibouti": "DJ",
  "موريتانيا": "MR", "Mauritania": "MR", "Mauritanie": "MR",
  "تركيا": "TR", "Turkey": "TR", "Turki": "TR", "Turquie": "TR",
  "ماليزيا": "MY", "Malaysia": "MY", "Malaisie": "MY",
  "إندونيسيا": "ID", "Indonesia": "ID", "Indonésie": "ID",
  "باكستان": "PK", "Pakistan": "PK",
  "الهند": "IN", "India": "IN", "Inde": "IN",
  "فرنسا": "FR", "France": "FR", "Prancis": "FR",
  "بريطانيا": "GB", "UK": "GB", "Inggris": "GB", "Royaume-Uni": "GB",
  "أمريكا": "US", "USA": "US", "Amerika": "US", "États-Unis": "US",
  "كندا": "CA", "Canada": "CA", "Kanada": "CA",
  "ألمانيا": "DE", "Germany": "DE", "Jerman": "DE", "Allemagne": "DE",
};

/** Returns a small flag image URL for a given country name, or null. */
export function getFlagUrl(country: string, size: number = 16): string | null {
  const code = countryCodes[country];
  if (!code) return null;
  return `https://flagcdn.com/${size}x${Math.round(size * 0.75)}/${code.toLowerCase()}.png`;
}
