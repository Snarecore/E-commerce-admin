import { IBlacklistItem } from '../pages/settings/blacklist/BlacklistPage';
import { postData, patchData, getData } from '../services/api-service';
import apiConfig from '../config/api.json';

const STORAGE_KEY = 'qligence_admin_blacklist_items_v1';

export const mockBlacklist: IBlacklistItem[] = [
  {
    id: 'bl-001',
    subjectType: 'PHONE',
    customerName: 'Qligence Limited testing',
    customerEmail: 'qligence.test@gmail.com',
    displayValue: '01765753380 (+8801765753380)',
    valueHash: 'a8f9c73e102b4d99e01827cf918a',
    severity: 'HARD_BLOCK',
    reasonCode: 'FRAUD_HISTORY',
    note: 'Repeated fake orders and chargebacks',
    status: 'ACTIVE',
    createdByAdminId: 'Admin (System)',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bl-002',
    subjectType: 'EXACT_IP',
    customerName: 'Automated Bot Spammer',
    customerEmail: 'bot.net@proxy.org',
    ipAddress: '103.145.78.53',
    severity: 'HARD_BLOCK',
    reasonCode: 'SUSPICIOUS_IP',
    note: 'Automated bot checkout spammer',
    status: 'ACTIVE',
    createdByAdminId: 'Super Admin',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'bl-003',
    subjectType: 'CIDR',
    customerName: 'Dhaka Subnet Range',
    networkAddress: '103.145.64.0',
    prefixLength: 20,
    severity: 'SUSPICIOUS_FLAG',
    reasonCode: 'POLICY_VIOLATION',
    note: 'Subnet flagged for manual review',
    status: 'ACTIVE',
    createdByAdminId: 'Risk Manager',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export function getBlacklistItems(): IBlacklistItem[] {
  if (typeof window === 'undefined') return mockBlacklist;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockBlacklist));
      return mockBlacklist;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : mockBlacklist;
  } catch (e) {
    console.error('Failed to read blacklist from storage:', e);
    return mockBlacklist;
  }
}

export function saveBlacklistItem(newItem: IBlacklistItem): IBlacklistItem[] {
  const current = getBlacklistItems();
  const updated = [newItem, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('blacklist_updated'));
  } catch (e) {
    console.error('Failed to save blacklist item locally:', e);
  }

  // Dual Persistence: Async sync to Backend REST API database
  postData({
    url: apiConfig.site.blacklistUrl,
    body: newItem as unknown as Record<string, unknown>,
  }).catch((err) => console.log('Backend sync notice (offline/mock mode fallback active):', err));

  return updated;
}

export function revokeBlacklistItem(id: string): IBlacklistItem[] {
  const current = getBlacklistItems();
  const updated = current.map((item) =>
    item.id === id ? { ...item, status: 'REVOKED' as const } : item
  );
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('blacklist_updated'));
  } catch (e) {
    console.error('Failed to revoke blacklist item locally:', e);
  }

  // Dual Persistence: Async sync to Backend REST API database
  patchData({
    url: `${apiConfig.site.blacklistUrl}/${id}`,
    body: { status: 'REVOKED' } as Record<string, unknown>,
  }).catch((err) => console.log('Backend revoke notice (offline/mock mode fallback active):', err));

  return updated;
}

export async function fetchBlacklistFromApi(): Promise<IBlacklistItem[]> {
  try {
    const res: any = await getData({ url: apiConfig.site.blacklistUrl });
    if (res && !res.error && Array.isArray(res.data || res)) {
      const items = res.data || res;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(new Event('blacklist_updated'));
      return items;
    }
  } catch (err) {
    console.log('Using local cached blacklist rules');
  }
  return getBlacklistItems();
}

function ipToInt(ip: string): number {
  return ip.split('.').reduce((acc, octet) => ((acc << 8) + (parseInt(octet, 10) || 0)) >>> 0, 0);
}

function isIpInSubnet(ip: string, networkIp: string, prefixLength: number): boolean {
  try {
    const ipNum = ipToInt(ip);
    const netNum = ipToInt(networkIp);
    const mask = prefixLength === 0 ? 0 : (~0 << (32 - prefixLength)) >>> 0;
    return (ipNum & mask) === (netNum & mask);
  } catch {
    return false;
  }
}

export function isCustomerBlacklisted(contactOrPhone?: string, email?: string, ipAddress?: string): boolean {
  if (!contactOrPhone && !email && !ipAddress) return false;
  const items = getBlacklistItems().filter((i) => i.status === 'ACTIVE' && i.severity === 'HARD_BLOCK');
  const cleanPhone = (contactOrPhone || '').replace(/\D/g, '');
  const cleanIp = (ipAddress || '').trim();

  return items.some((item) => {
    // Email check
    if (email && item.customerEmail && item.customerEmail.toLowerCase() === email.toLowerCase()) {
      return true;
    }
    // Phone check
    if (cleanPhone && item.displayValue) {
      const itemClean = item.displayValue.replace(/\D/g, '');
      if (itemClean && (itemClean.length >= 6 && cleanPhone.length >= 6) && (itemClean.includes(cleanPhone) || cleanPhone.includes(itemClean))) {
        return true;
      }
    }
    // Exact IP check
    if (cleanIp && item.subjectType === 'EXACT_IP' && item.ipAddress) {
      if (item.ipAddress.trim() === cleanIp) {
        return true;
      }
    }
    // CIDR Subnet check
    if (cleanIp && item.subjectType === 'CIDR' && item.networkAddress) {
      if (isIpInSubnet(cleanIp, item.networkAddress, item.prefixLength || 24)) {
        return true;
      }
    }
    return false;
  });
}
