/**
 * Safely extracts CMS or Policy data object regardless of whether the API
 * returns an array [item], single object { ... }, or nested object { data: ... }.
 */
export function extractCmsData<T = any>(response: any): T | null {
    if (!response) return null;
    let data = response;
    if (data && typeof data === "object" && data.data !== undefined) {
        data = data.data;
    }
    if (Array.isArray(data)) {
        return data.length > 0 ? (data[0] as T) : null;
    }
    if (data && typeof data === "object") {
        return data as T;
    }
    return null;
}
