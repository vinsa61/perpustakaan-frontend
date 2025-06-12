import Cookies from 'universal-cookie';

const cookies = new Cookies();

export const getToken = (): string | undefined => {
  return cookies.get('@library/token') || localStorage.getItem('token');
};

export const setToken = (token: string): void => {
  cookies.set('@library/token', token, { path: '/' });
  localStorage.setItem('token', token);
};

export const removeToken = (): void => {
  cookies.remove('@library/token', { path: '/' });
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};