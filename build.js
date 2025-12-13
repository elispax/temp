const fs = require("fs");
const path = require("path");
const mustache = require("mustache");

const templatesDir = path.join(__dirname, "templates");
const dataDir = path.join(__dirname, "data");
const pagesFile = path.join(__dirname, "pages/pages.json");
const distDir = path.join(__dirname, "dist");

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

const siteData = JSON.parse(
  fs.readFileSync(path.join(dataDir, "site.json"))
);

const pages = JSON.parse(fs.readFileSync(pagesFile));

pages.forEach(page => {
  const template = fs.readFileSync(
    path.join(templatesDir, page.template),
    "utf8"
  );

  const pageData = JSON.parse(
    fs.readFileSync(path.join(dataDir, page.data))
  );

  // merge global + page data
  const view = {
    site: siteData,
    ...pageData
  };

  // render page content
  const content = mustache.render(template, view);

  // wrap in layout
  const layout = fs.readFileSync(
    path.join(templatesDir, "layout.mustache"),
    "utf8"
  );

  const finalHtml = mustache.render(layout, {
    ...view,
    content
  });

  const outputPath = path.join(distDir, page.output);

  fs.writeFileSync(outputPath, finalHtml);
  console.log(`✅ Built: ${page.output}`);
});
