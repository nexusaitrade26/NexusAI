/**
 * FORMULA RISK SCORE (Range 0 - 100):
 * 
 * Il punteggio di rischio (Risk Score) viene calcolato combinando 3 fattori ponderati:
 * 
 * 1. FATTORE CONCENTRAZIONE PER ASSET / SETTORE (Peso: 40%):
 *    - Calcola l'Herfindahl-Hirschman Index (HHI) normalizzato delle posizioni rispetto al capitale.
 *    - Se un singolo asset o settore domina il portafoglio (>50%), l'indice di concentrazione sale drasticamente.
 * 
 * 2. FATTORE DIMENSIONE POSIZIONI / LEVA (Peso: 35%):
 *    - Misura il rapporto tra il valore totale delle posizioni aperte e il capitale totale dell'utente.
 *    - Esposizione Totale / Capitale Totale. Più l'esposizione supera il capitale libero, più il rischio aumenta.
 * 
 * 3. FATTORE PRESENZA STOP LOSS (Peso: 25%):
 *    - Misura la percentuale di posizioni sprovviste di uno Stop Loss impostato.
 *    - Ogni posizione senza Stop Loss aggiunge una penalità diretta di rischio.
 * 
 * Risultato finale: punteggio compreso tra 0 (Rischio Minimo) e 100 (Rischio Massimo/Critico).
 */
export function calculateRiskScore(positions, totalCapital) {
  if (!positions || positions.length === 0 || !totalCapital || totalCapital <= 0) {
    return {
      score: 0,
      level: 'Basso',
      details: { concentrationRisk: 0, exposureRatio: 0, missingStopLossRatio: 0 }
    };
  }

  // 1. Calcolo del Valore Totale delle Posizioni
  let totalPositionValue = 0;
  let positionsWithoutStopLoss = 0;
  const assetValues = {};
  const categoryValues = {};

  positions.forEach((pos) => {
    const value = pos.quantity * pos.current_price;
    totalPositionValue += value;

    if (!pos.stop_loss) {
      positionsWithoutStopLoss += 1;
    }

    assetValues[pos.asset] = (assetValues[pos.asset] || 0) + value;
    categoryValues[pos.category] = (categoryValues[pos.category] || 0) + value;
  });

  // 1. Concentrazione per Asset/Settore (40%)
  // Troviamo il peso percentuale del settore principale
  let maxCategoryValue = 0;
  Object.values(categoryValues).forEach(val => {
    if (val > maxCategoryValue) maxCategoryValue = val;
  });
  const maxCategoryConcentration = totalPositionValue > 0 ? maxCategoryValue / totalPositionValue : 0;
  const concentrationScore = maxCategoryConcentration * 100 * 0.40;

  // 2. Dimensione Posizione rispetto al Capitale Totale (35%)
  const exposureRatio = totalPositionValue / totalCapital;
  // Se l'esposizione supera il 100% del capitale, il punteggio della dimensione va al massimo (100)
  const sizeScore = Math.min(exposureRatio, 1.0) * 100 * 0.35;

  // 3. Assenza di Stop Loss (25%)
  const missingSlRatio = positionsWithoutStopLoss / positions.length;
  const stopLossScore = missingSlRatio * 100 * 0.25;

  // Totale Risk Score
  const rawScore = Math.round(concentrationScore + sizeScore + stopLossScore);
  const score = Math.min(Math.max(rawScore, 0), 100);

  let level = 'Basso';
  if (score >= 70) level = 'Alto';
  else if (score >= 40) level = 'Moderato';

  return {
    score,
    level,
    details: {
      concentrationRiskPercent: Math.round(maxCategoryConcentration * 100),
      exposureRatioPercent: Math.round(exposureRatio * 100),
      missingStopLossPercent: Math.round(missingSlRatio * 100)
    }
  };
}

/**
 * Aggrega l'esposizione del portafoglio per categoria / settore
 */
export function calculateExposureByCategory(positions) {
  if (!positions || positions.length === 0) {
    return [];
  }

  const categoryTotals = {};
  let totalValue = 0;

  positions.forEach((pos) => {
    const value = pos.quantity * pos.current_price;
    totalValue += value;
    categoryTotals[pos.category] = (categoryTotals[pos.category] || 0) + value;
  });

  return Object.entries(categoryTotals).map(([category, value]) => ({
    category,
    value: parseFloat(value.toFixed(2)),
    percentage: totalValue > 0 ? parseFloat(((value / totalValue) * 100).toFixed(2)) : 0
  }));
}
