/**
 * Safe localStorage wrapper with error handling
 */
export function setLocalStorage(key: string, value: string): boolean {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error setting localStorage:', error);
    return false;
  }
}

export function getLocalStorage(key: string): string | null {
  try {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem(key);
    }
    return null;
  } catch (error) {
    console.error('Error getting localStorage:', error);
    return null;
  }
}

export function removeLocalStorage(key: string): boolean {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error removing localStorage:', error);
    return false;
  }
}
