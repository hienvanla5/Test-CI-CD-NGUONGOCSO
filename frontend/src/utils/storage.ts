const TOKEN_KEY = 'access_token';
const USER_KEY = 'user_info';

export const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
}

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const setUser = (user: any) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export const getUser = (): any | null => {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
}