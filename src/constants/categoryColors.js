export const CATEGORY_COLORS = {
  OUTDOOR: "#2E7D32",
  CULTURAL: "#FF7043",
  WELLNESS: "#4FC3F7",
  URBAN: "#00BCD4",
  NIGHT: "#8E24AA",
  FARM: "#FBC02D",
};

export const getCategoryColor = (category) => {
  if (!category) return CATEGORY_COLORS.OUTDOOR;
  return CATEGORY_COLORS[category.toUpperCase()] || CATEGORY_COLORS.OUTDOOR;
};
