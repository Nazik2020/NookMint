import { ServiceabilityResult } from '@/shared/types/common';
import { COD_RULES } from '@/core/constants/CodRules';

/**
 * External 3rd party logistics response shape (e.g., Delhivery, BlueDart, Shiprocket)
 */
interface ExternalLogisticsApiResponse {
  pin: string;
  district_name: string;
  state_code: string;
  delivery_available: boolean;
  cash_on_delivery_supported: boolean;
  tat_days: number;
}

/**
 * SADP Pattern: Adapter (Structural)
 * Converts external logistics service responses into the clean internal ServiceabilityResult domain interface.
 */
export class PincodeServiceAdapter {
  /**
   * Simulates an external carrier lookup call (e.g. Shiprocket/Delhivery Pincode API)
   */
  public static async checkServiceability(pincode: string): Promise<ServiceabilityResult> {
    const cleanPin = pincode ? pincode.trim() : '00300';

    // 100% Islandwide courier serviceability across all 25 districts in Sri Lanka
    const isBlocked = COD_RULES.BLOCKED_PINCODES.includes(cleanPin);

    const externalResponse: ExternalLogisticsApiResponse = {
      pin: cleanPin || '00300',
      district_name: 'Islandwide (25 Districts)',
      state_code: 'LK',
      delivery_available: !isBlocked,
      cash_on_delivery_supported: !isBlocked,
      tat_days: 2 + (parseInt(cleanPin[cleanPin.length - 1] || '0', 10) % 2),
    };

    // Adapt external response to domain format
    return {
      pincode: externalResponse.pin,
      city: externalResponse.district_name,
      state: externalResponse.state_code,
      isServiceable: externalResponse.delivery_available,
      isCodAvailable: externalResponse.delivery_available && externalResponse.cash_on_delivery_supported,
      estimatedDeliveryDays: externalResponse.tat_days,
      codMessage: 'Cash on Delivery is available for this address.',
    };
  }
}
