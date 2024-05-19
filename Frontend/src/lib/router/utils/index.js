export const pathToRegex = (path) => {
  return new RegExp("^" + path.replace(/:\w+/g, "(.+)") + "$");
}