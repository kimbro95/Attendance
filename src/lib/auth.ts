const ADMIN_CODE = process.env.NEXT_PUBLIC_ADMIN_CODE || '000000';
const AUTH_COOKIE = 'admin_auth';

export const verifyAdminCode = (code: string): boolean => {
  return code === ADMIN_CODE;
};

export const setAuthCookie = (token: string): void => {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE}=${token}; path=/; max-age=2592000`; // 30일
};

export const getAuthCookie = (): string | null => {
  if (typeof document === 'undefined') return null;
  const name = AUTH_COOKIE + '=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');

  for (let cookie of cookieArray) {
    cookie = cookie.trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length);
    }
  }
  return null;
};

export const removeAuthCookie = (): void => {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0`;
};

export const generateAuthToken = (): string => {
  return 'admin_' + Date.now() + '_' + Math.random().toString(36).substring(7);
};
