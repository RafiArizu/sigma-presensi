export type CachedUser = {
  id: string;
  name: string;
  user_name?: string;
  email: string | null;
  role: string;
};

const CACHE_KEY = 'sigma.currentUser';

export function getCachedUser<T extends CachedUser>(): T | null {
  try {
    const value = sessionStorage.getItem(CACHE_KEY);
    return value ? JSON.parse(value) as T : null;
  } catch {
    return null;
  }
}

export function cacheUser(user: CachedUser): void {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(user));
  } catch {
  }
}

export function clearCachedUser(): void {
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {
  }
}



