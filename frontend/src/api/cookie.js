export const getCookie = (key) => {
  const cookie = document.cookie.split("; ").find((row) => row.startsWith(key));
  return cookie ? cookie.split("=")[1] : null;
};

export const setCookie = (key, value = "", days = 1) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${key}=${value}; expires=${date.toUTCString()}; path=/`;
};
