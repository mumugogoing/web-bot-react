// Token管理
const tokenKey = 'jwt';
const idempotenceTokenKey = 'api-idempotence-token';

export const getToken = (): string | null => {
  return localStorage.getItem(tokenKey);
};

export const setToken = (token: string): void => {
  localStorage.setItem(tokenKey, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(tokenKey);
};

// 幂等性token管理
export const getIdempotenceToken = (): string | null => {
  return localStorage.getItem(idempotenceTokenKey);
};

export const setIdempotenceToken = (token: string): void => {
  localStorage.setItem(idempotenceTokenKey, token);
};

export const removeIdempotenceToken = (): void => {
  localStorage.removeItem(idempotenceTokenKey);
};
