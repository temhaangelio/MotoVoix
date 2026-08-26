const CATEGORY_LABELS = {
  "bakım": { en: "Maintenance", fr: "Entretien" },
  "ekipman": { en: "Gear", fr: "Équipement" },
  "gezi": { en: "Travel", fr: "Voyage" },
  "güvenlik": { en: "Safety", fr: "Sécurité" },
  "motorcycle": { en: "Motorcycle", fr: "Moto" },
  "racing": { en: "Racing", fr: "Compétition" },
  "rehber": { en: "Guide", fr: "Guide" },
  "satın alma": { en: "Buying guide", fr: "Guide d’achat" },
  "sürüş": { en: "Riding", fr: "Conduite" },
  "teknoloji": { en: "Technology", fr: "Technologie" },
  "maintenance": { en: "Maintenance", fr: "Entretien" },
  "gear": { en: "Gear", fr: "Équipement" },
  "travel": { en: "Travel", fr: "Voyage" },
  "safety": { en: "Safety", fr: "Sécurité" },
  "moto": { en: "Motorcycle", fr: "Moto" },
  "competition": { en: "Racing", fr: "Compétition" },
  "guide": { en: "Guide", fr: "Guide" },
  "buying guide": { en: "Buying guide", fr: "Guide d’achat" },
  "riding": { en: "Riding", fr: "Conduite" },
  "technology": { en: "Technology", fr: "Technologie" },
};

export function getCategoryLabel(category, language = "en") {
  const key = String(category || "").trim().toLocaleLowerCase("tr-TR");
  return CATEGORY_LABELS[key]?.[language] || category;
}
