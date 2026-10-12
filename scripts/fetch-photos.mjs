// Replaces the built-in illustrations with REAL food photos from Wikimedia Commons.
//   npm run photos                 (all 30 images)
//   npm run photos -- --only chicken-biryani,red-apples
//
// Needs internet access, so run it on your own computer once. Only freely licensed photos are
// used (CC0, public domain, CC BY, CC BY-SA). The author and licence of every photo are saved to
// lib/gallery.json and shown on the /credits page, which the CC BY licences require.
// Images that cannot be found keep their illustration, so the site never breaks.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const jsonPath = join(root, "lib", "gallery.json");
const outDir = join(root, "public", "images", "food");
mkdirSync(outDir, { recursive: true });

const API = "https://commons.wikimedia.org/w/api.php";
const HEADERS = { "User-Agent": "FoodRescue/1.0 (portfolio project; contact: your-email@example.com)" };
const ALLOWED = /^(CC0|Public domain|PD|CC BY(-SA)?)\b/i;

// What to search for on Commons. Edit a query if a result is not what you want.
const QUERIES = {
  "chicken-biryani": "chicken biryani plate",
  "vegetable-curry": "vegetable curry bowl",
  "lentil-soup": "lentil soup bowl",
  "fried-rice": "vegetable fried rice plate",
  "pasta-marinara": "spaghetti tomato sauce plate",
  "mixed-khichuri": "khichuri bengali food",
  "sourdough-loaf": "sourdough bread loaf",
  "butter-croissants": "croissants bakery",
  "chocolate-cake": "chocolate cake slice",
  "glazed-donuts": "glazed doughnuts",
  "dinner-rolls": "bread rolls basket",
  "red-apples": "red apples fruit",
  "ripe-bananas": "bananas bunch fruit",
  "fresh-oranges": "oranges fruit pile",
  "ripe-tomatoes": "tomatoes fresh vegetable",
  "fresh-carrots": "carrots fresh vegetable",
  "biscuit-box": "biscuits packet cookies",
  "canned-beans": "canned beans tin",
  "instant-noodles": "instant noodles packet",
  "breakfast-cereal": "breakfast cereal bowl",
  "orange-juice": "orange juice glass bottle",
  "drinking-water": "bottled water",
  "masala-tea": "masala chai cup",
  "mango-juice-pack": "mango juice",
  "fresh-milk": "milk glass bottle",
  "yogurt-cups": "yogurt cup",
  "cheese-wedge": "cheese wedge",
  "grocery-basket": "grocery basket vegetables fruit",
  "sandwich-lunchbox": "lunch box sandwich",
  "snack-hamper": "food hamper basket",
};

const flag = process.argv.findIndex((a) => a === "--only" || a.startsWith("--only="));
const only = flag === -1 ? [] : (process.argv[flag].includes("=") ? process.argv[flag].split("=")[1] : process.argv[flag + 1] || "").split(",").filter(Boolean);
const strip = (html = "") => html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function findPhoto(query) {
  const params = new URLSearchParams({
    action: "query", format: "json", generator: "search", gsrnamespace: "6",
    gsrsearch: `${query} filetype:bitmap`, gsrlimit: "20", prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata", iiurlwidth: "900",
    iiextmetadatafilter: "LicenseShortName|Artist|ObjectName",
  });
  const res = await fetch(`${API}?${params}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`Commons API ${res.status}`);
  const pages = Object.values((await res.json()).query?.pages ?? {}).sort((a, b) => a.index - b.index);
  for (const page of pages) {
    const info = page.imageinfo?.[0];
    if (!info || info.mime !== "image/jpeg") continue;
    if (info.width < 900 || info.height < 500 || info.width / info.height < 1.1) continue; // landscape, big enough
    const license = strip(info.extmetadata?.LicenseShortName?.value);
    if (!ALLOWED.test(license)) continue;
    return {
      url: info.thumburl,
      title: page.title.replace(/^File:/, ""),
      author: strip(info.extmetadata?.Artist?.value) || "Unknown",
      license,
      source: info.descriptionurl,
    };
  }
  return null;
}

const gallery = JSON.parse(readFileSync(jsonPath, "utf8"));
let done = 0;
for (const item of gallery) {
  if (only.length && !only.includes(item.id)) continue;
  try {
    const photo = await findPhoto(QUERIES[item.id] || item.label);
    if (!photo) { console.log(`- ${item.id}: no suitable free photo found, keeping illustration`); continue; }
    const img = await fetch(photo.url, { headers: HEADERS });
    if (!img.ok) throw new Error(`download ${img.status}`);
    writeFileSync(join(outDir, `${item.id}.jpg`), Buffer.from(await img.arrayBuffer()));
    item.src = `/images/food/${item.id}.jpg`;
    item.credit = { title: photo.title, author: photo.author, license: photo.license, source: photo.source };
    console.log(`✓ ${item.id}: ${photo.title} (${photo.license})`);
    done++;
  } catch (e) {
    console.log(`- ${item.id}: ${e.message}, keeping illustration`);
  }
  await sleep(700); // be polite to Wikimedia
}

writeFileSync(jsonPath, JSON.stringify(gallery, null, 2) + "\n");
console.log(`\n${done} real photos saved. Review them in public/images/food/, then run: npm run seed`);
