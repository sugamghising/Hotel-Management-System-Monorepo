export const guestTypeOptions = [
  { value: "TRANSIENT", label: "Transient" },
  { value: "CORPORATE", label: "Corporate" },
  { value: "GROUP", label: "Group" },
  { value: "CONTRACTUAL", label: "Contractual" },
  { value: "COMP", label: "Comp" },
  { value: "STAFF", label: "Staff" },
  { value: "FAMILY_FRIENDS", label: "Family & Friends" },
] as const;

export const vipOptions = [
  { value: "NONE", label: "None" },
  { value: "BRONZE", label: "Bronze" },
  { value: "SILVER", label: "Silver" },
  { value: "GOLD", label: "Gold" },
  { value: "PLATINUM", label: "Platinum" },
  { value: "BLACK", label: "Black" },
] as const;

export const languageOptions = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "ar", label: "Arabic" },
  { value: "zh", label: "Chinese" },
  { value: "other", label: "Other" },
] as const;

export const countryNames: Record<string, string> = {
  US: "United States", GB: "United Kingdom", CA: "Canada",
  AU: "Australia", DE: "Germany", FR: "France", IT: "Italy",
  ES: "Spain", NL: "Netherlands", BR: "Brazil", MX: "Mexico",
  JP: "Japan", CN: "China", IN: "India", AE: "United Arab Emirates",
  SA: "Saudi Arabia", SG: "Singapore", HK: "Hong Kong", KR: "South Korea",
  ZA: "South Africa",
};

export const countryOptions = Object.entries(countryNames).map(([value, label]) => ({
  value,
  label,
}));
