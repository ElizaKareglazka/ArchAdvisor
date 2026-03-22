/**
 * Architecture recommendation algorithm for ArchAdvisor.
 *
 * Calculates weighted scores for each architecture style based on
 * the user's selected and key characteristics, then returns all
 * styles ranked by fit.
 */

const MAX_POSSIBLE_SCORE = 3 * 3 * 5 + 7 * 1 * 5; // 45 + 35 = 80

/**
 * Generate a Russian-language explanation of why a style is a good fit.
 *
 * @param {Object}   style            - Architecture style object (must have `scores`).
 * @param {string[]} selectedIds      - 10 selected characteristic IDs.
 * @param {string[]} keyIds           - 3 key characteristic IDs (subset of selectedIds).
 * @param {Object[]} characteristics  - Full characteristics data array, each with `id` and `nameRu`.
 * @returns {string} Explanation string in Russian.
 */
export function generateExplanation(style, selectedIds, keyIds, characteristics) {
  const charMap = new Map(characteristics.map((c) => [c.id, c]));

  // Rank the selected characteristics by their score in this style (descending).
  const ranked = [...selectedIds]
    .filter((id) => style.scores[id] !== undefined)
    .sort((a, b) => {
      const scoreA = style.scores[a] ?? 0;
      const scoreB = style.scores[b] ?? 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      // Prefer key characteristics when scores are equal.
      return (keyIds.includes(b) ? 1 : 0) - (keyIds.includes(a) ? 1 : 0);
    });

  const topNames = ranked
    .slice(0, 3)
    .map((id) => charMap.get(id)?.nameRu ?? id);

  if (topNames.length === 0) {
    return "Недостаточно данных для формирования рекомендации.";
  }

  if (topNames.length === 1) {
    return `Этот стиль хорошо подходит благодаря высоким оценкам в области ${topNames[0]}.`;
  }

  const last = topNames.pop();
  return `Этот стиль хорошо подходит благодаря высоким оценкам в области ${topNames.join(", ")} и ${last}.`;
}

/**
 * Calculate architecture style recommendations.
 *
 * @param {string[]} selectedIds - Array of 10 selected characteristic IDs.
 * @param {string[]} keyIds      - Array of 3 key characteristic IDs (subset of selectedIds).
 * @param {Object[]} styles      - Array of architecture style objects, each with a `scores`
 *                                 property mapping characteristicId -> score (1-5).
 * @param {Object[]} [characteristics] - Optional characteristics data array (with `id` and
 *                                       `nameRu`) used for generating explanations. When
 *                                       omitted, characteristic IDs are used in explanations.
 * @returns {Object[]} All styles sorted by totalScore descending.
 *   Each entry: { style, totalScore, matchPercent, explanation }
 */
export function recommend(selectedIds, keyIds, styles, characteristics = []) {
  const results = styles.map((style) => {
    let totalScore = 0;

    for (const id of selectedIds) {
      const score = style.scores[id] ?? 0;
      const weight = keyIds.includes(id) ? 3 : 1;
      totalScore += score * weight;
    }

    const matchPercent = Math.round((totalScore / MAX_POSSIBLE_SCORE) * 100);

    const explanation = generateExplanation(
      style,
      selectedIds,
      keyIds,
      characteristics,
    );

    return { style, totalScore, matchPercent, explanation };
  });

  results.sort((a, b) => b.totalScore - a.totalScore);

  return results;
}
