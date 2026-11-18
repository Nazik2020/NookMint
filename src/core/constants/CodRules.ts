/**
 * SADP - Domain Business Rules (Sri Lanka Local Retail)
 * Cash on Delivery (COD) configuration and fraud-prevention thresholds in LKR.
 */

export const COD_RULES = {
  MIN_ORDER_AMOUNT: 0,          // Allow all product orders (e.g. Rs. 200 - 680+) to use Cash on Delivery
  MAX_ORDER_AMOUNT: 100000,     // Generous cap for retail household orders
  COD_HANDLING_FEE: 0,          // No hidden handling surcharge
  FREE_COD_THRESHOLD: 0,        // 100% COD available across all order amounts
  OTP_VERIFICATION_REQUIRED: false, // 1-click fast checkout without blocking SMS verification
  BLOCKED_PINCODES: [] as readonly string[], // 100% Islandwide coverage across all 25 districts
};
