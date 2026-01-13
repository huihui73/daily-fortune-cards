// calculateEnergyLevel helper function
function calculateEnergyLevelHelper(elements) {
  const total = Object.values(elements).reduce((a, b) => a + Math.abs(b), 0);
  if (total <= 2) return "⭐⭐⭐⭐ 能量充沛";
  if (total <= 4) return "⭐⭐⭐ 能量良好";
  if (total <= 6) return "⭐⭐⭐ 能量中等";
  if (total <= 8) return "⭐⭐ 能量平稳";
  return "⭐ 能量温和";
}

// getDominantElement helper function
function getDominantElementHelper(elements) {
  const entries = Object.entries(elements);
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  const elementsMap = {
    'wood': '木',
    'fire': '火',
    'earth': '土',
    'metal': '金',
    'water': '水'
  };
  return elementsMap[sorted[0][0]];
}
