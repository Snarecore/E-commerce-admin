import { IBlacklistItem } from '../pages/settings/blacklist/BlacklistPage';
import { postData, patchData, getData } from '../services/api-service';
import apiConfig from '../config/api.json';

// In-memory runtime cache
let memoryBlacklist: IBlacklistItem[] = [];

export function getBlacklistItems(): IBlacklistItem[] {
  return memoryBlacklist;
}

export async function saveBlacklistItem(newItem: Partial<IBlacklistItem>): Promise<IBlacklistItem[]> {
  try {
    const res: any = await postData({
      url: apiConfig.site.blacklistUrl,
      body: newItem as unknown as Record<string, unknown>,
    });
    const saved = res?.data || res || newItem;
    memoryBlacklist = [saved, ...memoryBlacklist.filter((i) => i.id !== saved.id)];
  } catch (e) {
    console.error('Failed to save blacklist item to backend API:', e);
    memoryBlacklist = [newItem as IBlacklistItem, ...memoryBlacklist];
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('blacklist_updated'));
  }
  return memoryBlacklist;
}

export async function revokeBlacklistItem(id: string): Promise<IBlacklistItem[]> {
  try {
    await patchData({
      url: `${apiConfig.site.blacklistUrl}/${id}`,
      body: { status: 'REVOKED' } as Record<string, unknown>,
    });
  } catch (e) {
    console.error('Failed to revoke blacklist item on backend API:', e);
  }

  memoryBlacklist = memoryBlacklist.map((item) =>
    item.id === id ? { ...item, status: 'REVOKED' as const } : item
  );

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('blacklist_updated'));
  }
  return memoryBlacklist;
}

export async function fetchBlacklistFromApi(): Promise<IBlacklistItem[]> {
  try {
    const res: any = await getData({ url: apiConfig.site.blacklistUrl });
    if (res && !res.error) {
      const items = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
      memoryBlacklist = items;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('blacklist_updated'));
      }
      return items;
    }
  } catch (err) {
    console.error('Failed to fetch blacklist from API:', err);
  }
  return memoryBlacklist;
}

/**
 * @deprecated Read order.isBlacklisted directly from backend evaluated order response
 */
export function isCustomerBlacklisted(contactOrPhone?: string, email?: string, ipAddress?: string): boolean {
  if (!contactOrPhone && !email && !ipAddress) return false;
  const items = getBlacklistItems().filter((i) => i.status === 'ACTIVE' && i.severity === 'HARD_BLOCK');
  const cleanPhone = (contactOrPhone || '').replace(/\D/g, '');
  const cleanIp = (ipAddress || '').trim();

  for (const item of items) {
    if (item.subjectType === 'PHONE' && item.displayValue) {
      const itemPhone = item.displayValue.replace(/\D/g, '');
      if (itemPhone && (cleanPhone.includes(itemPhone) || itemPhone.includes(cleanPhone))) {
        return true;
      }
    }
    if (item.customerEmail && email && item.customerEmail.toLowerCase() === email.trim().toLowerCase()) {
      return true;
    }
    if (item.subjectType === 'EXACT_IP' && item.ipAddress && cleanIp === item.ipAddress) {
      return true;
    }
  }
  return false;
}

/**
 * @deprecated Read order.isSuspicious directly from backend evaluated order response
 */
export function isCustomerSuspicious(contactOrPhone?: string, email?: string, ipAddress?: string): boolean {
  if (!contactOrPhone && !email && !ipAddress) return false;
  const items = getBlacklistItems().filter((i) => i.status === 'ACTIVE' && i.severity === 'SUSPICIOUS_FLAG');
  const cleanPhone = (contactOrPhone || '').replace(/\D/g, '');
  const cleanIp = (ipAddress || '').trim();

  for (const item of items) {
    if (item.subjectType === 'PHONE' && item.displayValue) {
      const itemPhone = item.displayValue.replace(/\D/g, '');
      if (itemPhone && (cleanPhone.includes(itemPhone) || itemPhone.includes(cleanPhone))) {
        return true;
      }
    }
    if (item.customerEmail && email && item.customerEmail.toLowerCase() === email.trim().toLowerCase()) {
      return true;
    }
    if (item.subjectType === 'EXACT_IP' && item.ipAddress && cleanIp === item.ipAddress) {
      return true;
    }
  }
  return false;
}
