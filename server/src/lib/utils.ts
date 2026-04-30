export const getSlug = (name: string) => {
  return name.toLowerCase().replace(/\s+/g, "-");
};
