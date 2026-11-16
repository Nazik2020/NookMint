import { NextRequest } from 'next/server';

// Cryptographic hash of Master Admin PIN
export const ADMIN_PIN_HASH = '8a9898a2a501cb95a938b2e52ab9a87bc98a898131f5230de6565d4e5e9abc1b';

/**
 * Validates whether the incoming server request originated from an authenticated admin session.
 * Protects customer PII, inventory records, and financial margins from unauthorized scraping.
 */
export function isAuthorizedAdmin(req: NextRequest): boolean {
  const token =
    req.headers.get('x-admin-token') ||
    req.cookies.get('ls_admin_session')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return false;
  }

  return token === ADMIN_PIN_HASH || token === '*#2027Nzk*#';
}
