// Financial + emissions constants used across the PDF report.
// Kept identical to the values that shipped in the original single-file ReportPDF.tsx.

export const MAINT_RATE = 0.04   // maintenance savings = 4% of current electricity cost
export const NPV_RATE = 0.11     // 11% discount rate for NPV

export const CARBON_TAX_RATE = 120          // R per tonne CO2e — carbon tax page
export const GRID_CO2_T_PER_KWH = 0.0005925 // carbon tax page factor (0.5925 t per 1,000 kWh)

// EPA GHG Equivalencies Calculator (indicative, US averages) — used only for the
// carbon page's real-world equivalency tiles, not for any financial calculation.
export const CAR_TCO2_PER_YEAR = 4.6         // tonnes CO2e per typical passenger vehicle per year
export const TREE_SEEDLING_TCO2_10YR = 0.060 // tonnes CO2e sequestered by one urban tree seedling grown 10 years
export const KM_TCO2_PER_KM = 0.000192       // tonnes CO2e per km of average passenger car driving
