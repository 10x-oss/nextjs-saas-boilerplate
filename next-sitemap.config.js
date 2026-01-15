module.exports = {
  // REQUIRED: add your own domain name here (e.g. https://markup.so),
  siteUrl: process.env.SITE_URL || "https://example.com",
  generateRobotsTxt: true,
  // use this to exclude routes from the sitemap (i.e. a user dashboard)
  // exclude: ["/app/*"],
};
