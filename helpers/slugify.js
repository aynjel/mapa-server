import slugify from "slugify";

const slugifyChars = (str) => {
  const shortId = Math.random();
  return slugify(`${str}-${shortId}`, {
    lower: true,
    strict: true,
  });
};

export { slugifyChars };
