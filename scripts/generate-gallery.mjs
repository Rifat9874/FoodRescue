// Generates the built-in food image gallery: 30 original SVG illustrations.
//   node scripts/generate-gallery.mjs
// Output: public/images/food/*.svg  and  lib/gallery.json
// To use real photos instead, drop files with the same names (e.g. chicken-biryani.jpg) into
// public/images/food/ and change the extension in lib/gallery.js.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "images", "food");
mkdirSync(outDir, { recursive: true });

// ---------- drawing helpers (canvas 800 x 500, food sits around x=400, y=300) ----------
const shadow = (cx = 400, cy = 400, rx = 230, ry = 28) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#000" opacity=".14"/>`;

const steam = (x = 400, y = 170) =>
  [-40, 0, 40]
    .map(
      (dx, i) =>
        `<path d="M${x + dx} ${y + 40} q-18 -20 0 -40 q18 -20 0 -40" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity="${0.55 - i * 0.08}"/>`
    )
    .join("");

const dots = (list, r = 9) => list.map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`).join("");

const bowl = ({ food, rim = "#f8fafc", body = "#e2e8f0", topping = [], hot = true }) => `
  ${shadow(400, 410, 230, 26)}
  ${hot ? steam(400, 150) : ""}
  <path d="M170 290 Q400 150 630 290 Z" fill="${food}"/>
  ${dots(topping)}
  <path d="M150 290 H650 Q650 420 400 420 Q150 420 150 290 Z" fill="${body}"/>
  <path d="M150 290 H650 Q652 304 640 318 H160 Q148 304 150 290 Z" fill="${rim}"/>
  <path d="M190 330 Q400 400 610 330" fill="none" stroke="#fff" stroke-width="6" opacity=".5" stroke-linecap="round"/>`;

const plate = ({ food, topping = [], extra = "" }) => `
  ${shadow(400, 400, 260, 30)}
  <ellipse cx="400" cy="340" rx="270" ry="68" fill="#e2e8f0"/>
  <ellipse cx="400" cy="330" rx="270" ry="68" fill="#f8fafc"/>
  <ellipse cx="400" cy="330" rx="210" ry="48" fill="#eef2f7"/>
  ${food}
  ${dots(topping, 8)}
  ${extra}`;

const loaf = ({ crust = "#c98a4b", dark = "#a8692f" }) => `
  ${shadow(400, 400, 250, 26)}
  <path d="M130 330 Q110 200 260 180 H540 Q690 200 670 330 Q665 400 560 400 H240 Q135 400 130 330 Z" fill="${crust}"/>
  <path d="M130 330 Q135 400 240 400 H560 Q665 400 670 330 Q640 380 560 380 H240 Q160 380 130 330 Z" fill="${dark}" opacity=".5"/>
  ${[250, 340, 430, 520].map((x) => `<path d="M${x} 215 q35 20 28 80" fill="none" stroke="#f3d9b0" stroke-width="12" stroke-linecap="round"/>`).join("")}`;

const croissant = () => `
  ${shadow(400, 400, 270, 24)}
  ${[[-170, 40, -25, 0.7], [170, 40, 25, 0.7], [-95, 5, -12, 0.85], [95, 5, 12, 0.85], [0, -20, 0, 1]]
    .map(
      ([dx, dy, rot, s]) =>
        `<g transform="translate(${400 + dx} ${300 + dy}) rotate(${rot}) scale(${s})"><ellipse cx="0" cy="0" rx="105" ry="85" fill="#d9993f"/><ellipse cx="0" cy="-10" rx="85" ry="62" fill="#e8b15d"/><path d="M-60 -50 q60 30 120 0 M-70 -10 q70 30 140 0 M-60 30 q60 30 120 0" fill="none" stroke="#b97a2a" stroke-width="7" stroke-linecap="round"/></g>`
    )
    .join("")}`;

const cake = () => `
  ${shadow(400, 410, 240, 24)}
  <ellipse cx="400" cy="390" rx="210" ry="40" fill="#f1f5f9"/>
  <path d="M215 260 V370 Q400 430 585 370 V260 Z" fill="#5b3a29"/>
  <ellipse cx="400" cy="260" rx="185" ry="48" fill="#7a4e36"/>
  <path d="M215 300 H585" stroke="#f5deb3" stroke-width="12"/>
  <path d="M230 262 q15 55 30 0 q15 70 30 0 q15 50 30 0 q15 65 30 0 q15 55 30 0 q15 60 30 0 q15 55 30 0 q15 60 30 0 q15 45 30 0 q15 55 30 0" fill="#3f2518"/>
  ${dots([[330, 235, "#e11d48"], [400, 225, "#e11d48"], [470, 235, "#e11d48"]], 14)}`;

const donuts = ({ glaze = "#f9a8d4", extra = "#fde68a" }) =>
  `${shadow(400, 410, 270, 24)}` +
  [[-150, 30, glaze], [150, 30, extra], [0, -25, "#c4b5fd"]]
    .map(
      ([dx, dy, c]) =>
        `<g transform="translate(${400 + dx} ${310 + dy})"><ellipse rx="115" ry="88" fill="#d9a05b"/><ellipse rx="105" ry="78" cy="-6" fill="${c}"/><ellipse rx="36" ry="26" cy="-4" fill="#f8fafc"/>${[[-70, -30], [-30, -62], [40, -55], [75, -20], [60, 30], [-55, 25]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="16" height="6" rx="3" fill="${["#fff", "#38bdf8", "#facc15"][i % 3]}" transform="rotate(${i * 40} ${x} ${y})"/>`).join("")}</g>`
    )
    .join("");

const rolls = () =>
  `${shadow(400, 410, 270, 24)}` +
  [[-170, 50], [0, 60], [170, 50], [-85, -30], [85, -30]]
    .map(
      ([dx, dy]) =>
        `<g transform="translate(${400 + dx} ${310 + dy})"><ellipse rx="85" ry="70" fill="#c98a4b"/><ellipse rx="72" ry="55" cy="-8" fill="#e0a862"/><path d="M-30 -25 q30 12 60 0" fill="none" stroke="#b97a2a" stroke-width="6" stroke-linecap="round"/></g>`
    )
    .join("");

const apple = (x, y, s, c = "#dc2626") =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -60 C-90 -90 -120 40 -50 90 C-20 110 20 110 50 90 C120 40 90 -90 0 -60 Z" fill="${c}"/><path d="M-60 -10 q10 -40 40 -45" fill="none" stroke="#fff" stroke-width="10" opacity=".35" stroke-linecap="round"/><path d="M0 -60 q5 -30 20 -45" stroke="#6b3f1d" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M12 -85 q40 -35 70 -5 q-35 30 -70 5Z" fill="#16a34a"/></g>`;

const round = (x, y, r, c, hl = "#fff", dimple = false) =>
  `<g><circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.22}" fill="${hl}" opacity=".35"/>${dimple ? `<path d="M${x - 14} ${y - r + 4} q14 -14 28 0 q-14 14 -28 0Z" fill="#15803d"/>` : ""}</g>`;

const bananas = () => `
  ${shadow(400, 405, 250, 22)}
  ${[0, 1, 2]
    .map(
      (i) =>
        `<path d="M${190 + i * 22} ${200 + i * 28} Q${380 + i * 20} ${470 + i * 8} ${640 - i * 10} ${190 + i * 24} Q${520} ${390 + i * 8} ${230 + i * 14} ${180 + i * 36} Z" fill="${["#facc15", "#fde047", "#eab308"][i]}" stroke="#ca8a04" stroke-width="4"/>`
    )
    .join("")}
  <path d="M190 200 l-18 -40 h30 l12 40Z" fill="#6b4f1d"/>`;

const carrots = () =>
  `${shadow(400, 410, 260, 22)}` +
  [-120, 0, 120]
    .map(
      (dx, i) =>
        `<g transform="translate(${400 + dx} ${300 + (i === 1 ? -20 : 10)}) rotate(${(i - 1) * 18})"><path d="M-38 -80 Q0 -100 38 -80 L8 140 Q0 152 -8 140 Z" fill="#f97316"/><path d="M-22 -40 h26 M-18 10 h24 M-12 60 h20" stroke="#c2410c" stroke-width="5" stroke-linecap="round"/><path d="M0 -84 q-40 -50 -55 -80 q40 10 55 55 q15 -55 55 -65 q-15 40 -55 90Z" fill="#16a34a"/></g>`
    )
    .join("");

const box = ({ body = "#f59e0b", accent = "#fff7ed", label = "#b45309", icon = "cookie" }) => `
  ${shadow(400, 420, 220, 22)}
  <rect x="250" y="130" width="300" height="280" rx="14" fill="${body}"/>
  <rect x="250" y="130" width="300" height="46" rx="14" fill="${label}" opacity=".9"/>
  <rect x="278" y="205" width="244" height="150" rx="16" fill="${accent}"/>
  ${
    icon === "cookie"
      ? `<circle cx="400" cy="280" r="55" fill="#d9993f"/>${dots([[380, 262, "#5b3a29"], [420, 270, "#5b3a29"], [395, 305, "#5b3a29"], [425, 308, "#5b3a29"], [370, 290, "#5b3a29"]], 7)}`
      : `<path d="M330 330 Q400 180 470 330 Z" fill="#fde68a"/><path d="M345 320 Q400 220 455 320" stroke="#f59e0b" stroke-width="9" fill="none"/>`
  }
  <rect x="250" y="392" width="300" height="18" rx="9" fill="#000" opacity=".1"/>`;

const can = ({ body = "#b45309", label = "#fde68a", icon = "#78350f" }) => `
  ${shadow(400, 425, 170, 20)}
  <path d="M290 150 V400 Q290 430 400 430 Q510 430 510 400 V150 Z" fill="#cbd5e1"/>
  <rect x="290" y="190" width="220" height="190" fill="${body}"/>
  <rect x="290" y="225" width="220" height="120" fill="${label}"/>
  <ellipse cx="400" cy="150" rx="110" ry="26" fill="#e2e8f0"/>
  <ellipse cx="400" cy="150" rx="80" ry="16" fill="#94a3b8"/>
  ${dots([[350, 285, icon], [400, 270, icon], [445, 292, icon], [380, 310, icon]], 17)}
  <path d="M300 200 v170" stroke="#fff" stroke-width="10" opacity=".25"/>`;

const pouch = ({ body = "#f59e0b", band = "#fde68a" }) => `
  ${shadow(400, 420, 210, 20)}
  <path d="M250 120 H550 L535 400 Q400 430 265 400 Z" fill="${body}"/>
  <path d="M250 120 H550 L548 160 H252Z" fill="#000" opacity=".15"/>
  <path d="M252 140 h296" stroke="#fff" stroke-width="5" stroke-dasharray="10 8" opacity=".6"/>
  <rect x="285" y="215" width="230" height="110" rx="55" fill="${band}"/>
  <path d="M320 270 q15 -35 30 0 t30 0 t30 0 t30 0 t30 0" stroke="#d97706" stroke-width="9" fill="none" stroke-linecap="round"/>`;

const bottle = ({ liquid = "#fb923c", cap = "#15803d", label = "#fff7ed" }) => `
  ${shadow(400, 430, 120, 18)}
  <rect x="365" y="90" width="70" height="38" rx="8" fill="${cap}"/>
  <path d="M372 128 H428 V180 Q490 215 490 270 V400 Q490 432 458 432 H342 Q310 432 310 400 V270 Q310 215 372 180 Z" fill="#e0f2fe" opacity=".95"/>
  <path d="M312 262 Q312 230 350 205 H450 Q488 230 488 262 V400 Q488 430 458 430 H342 Q312 430 312 400 Z" fill="${liquid}"/>
  <rect x="310" y="290" width="180" height="90" fill="${label}"/>
  <circle cx="400" cy="335" r="26" fill="${liquid}"/>
  <path d="M335 215 v190" stroke="#fff" stroke-width="9" opacity=".4" stroke-linecap="round"/>`;

const cup = ({ drink = "#b45309", cupColor = "#f8fafc", leaf = true }) => `
  ${shadow(400, 420, 250, 24)}
  ${steam(380, 120)}
  <ellipse cx="400" cy="400" rx="240" ry="34" fill="#e2e8f0"/>
  <path d="M250 230 H550 Q540 400 400 400 Q260 400 250 230Z" fill="${cupColor}"/>
  <path d="M550 260 q90 -10 70 55 q-20 55 -90 45" fill="none" stroke="${cupColor}" stroke-width="22" stroke-linecap="round"/>
  <ellipse cx="400" cy="232" rx="150" ry="30" fill="${drink}"/>
  <ellipse cx="400" cy="232" rx="150" ry="30" fill="none" stroke="#e2e8f0" stroke-width="8"/>
  ${leaf ? `<path d="M285 330 q30 -50 80 -20 q-30 50 -80 20Z" fill="#16a34a" opacity=".8"/>` : ""}`;

const carton = ({ body = "#f8fafc", band = "#3b82f6", icon = "drop" }) => `
  ${shadow(400, 430, 190, 20)}
  <path d="M300 160 L400 90 L500 160 Z" fill="#cbd5e1"/>
  <rect x="300" y="160" width="200" height="270" rx="6" fill="${body}"/>
  <rect x="300" y="160" width="200" height="270" rx="6" fill="none" stroke="#cbd5e1" stroke-width="4"/>
  <rect x="300" y="250" width="200" height="110" fill="${band}"/>
  ${
    icon === "drop"
      ? `<path d="M400 265 C370 305 370 335 400 345 C430 335 430 305 400 265Z" fill="#fff"/>`
      : `<circle cx="400" cy="305" r="34" fill="#fde68a"/><path d="M385 285 q15 -12 30 0" stroke="#16a34a" stroke-width="7" fill="none"/>`
  }
  <path d="M312 175 v240" stroke="#fff" stroke-width="8" opacity=".55"/>`;

const yogurt = () =>
  `${shadow(400, 420, 280, 22)}` +
  [-160, 0, 160]
    .map(
      (dx, i) =>
        `<g transform="translate(${400 + dx} 290)"><path d="M-70 -60 H70 L52 110 Q0 126 -52 110 Z" fill="#f8fafc" stroke="#e2e8f0" stroke-width="4"/><path d="M-66 -20 H66 L58 80 H-58Z" fill="${["#f9a8d4", "#a7f3d0", "#fde68a"][i]}"/><ellipse cx="0" cy="-60" rx="70" ry="14" fill="#cbd5e1"/><circle cx="0" cy="30" r="20" fill="#fff" opacity=".85"/></g>`
    )
    .join("");

const cheese = () => `
  ${shadow(400, 410, 250, 22)}
  <path d="M140 360 L620 190 L650 360 Z" fill="#facc15"/>
  <path d="M140 360 H650 V395 H140Z" fill="#eab308"/>
  <path d="M620 190 L650 360 V395 L650 360Z" fill="#ca8a04"/>
  ${dots([[300, 330, "#ca8a04"], [430, 290, "#ca8a04"], [530, 320, "#ca8a04"], [380, 345, "#ca8a04"]], 18)}
  ${dots([[510, 250, "#ca8a04"]], 11)}`;

const basket = () => `
  ${shadow(400, 430, 260, 22)}
  <path d="M210 200 q190 -150 380 0" fill="none" stroke="#a16207" stroke-width="16" stroke-linecap="round"/>
  ${round(310, 235, 52, "#dc2626", "#fff", true)}${round(400, 215, 48, "#f97316")}${round(480, 235, 50, "#facc15")}
  <path d="M365 260 q12 -80 40 -100 q22 60 5 100Z" fill="#16a34a"/>
  <path d="M150 260 H650 L600 420 H200 Z" fill="#ca8a04"/>
  ${[300, 340, 380].map((y) => `<path d="M${165 + (y - 260) * 0.3} ${y - 20} H${635 - (y - 260) * 0.3}" stroke="#a16207" stroke-width="8"/>`).join("")}
  ${[260, 340, 420, 500, 580].map((x) => `<path d="M${x} 262 L${x < 400 ? x + 6 : x - 6} 418" stroke="#a16207" stroke-width="7"/>`).join("")}`;

const lunchbox = () => `
  ${shadow(400, 420, 270, 24)}
  <rect x="160" y="200" width="480" height="210" rx="28" fill="#0ea5e9"/>
  <rect x="160" y="200" width="480" height="64" rx="28" fill="#0284c7"/>
  <rect x="190" y="280" width="420" height="100" rx="18" fill="#f0f9ff"/>
  <rect x="205" y="292" width="180" height="76" rx="12" fill="#fde68a"/><path d="M215 330 q35 -30 70 0 t70 0" stroke="#d97706" stroke-width="8" fill="none"/>
  <rect x="400" y="292" width="195" height="76" rx="12" fill="#bbf7d0"/>${dots([[440, 330, "#dc2626"], [490, 322, "#16a34a"], [540, 334, "#f97316"]], 14)}
  <rect x="360" y="170" width="80" height="34" rx="12" fill="#075985"/>`;

const hamper = () => `
  ${shadow(400, 430, 260, 22)}
  <path d="M160 230 H640 L600 420 H200 Z" fill="#a16207"/>
  <path d="M150 215 H650 V245 H150Z" fill="#ca8a04"/>
  <path d="M250 215 Q250 100 400 100 Q550 100 550 215" fill="none" stroke="#854d0e" stroke-width="16" stroke-linecap="round"/>
  <rect x="215" y="150" width="90" height="70" rx="10" fill="#f59e0b"/>
  <rect x="320" y="120" width="70" height="100" rx="12" fill="#dc2626"/><rect x="326" y="150" width="58" height="34" fill="#fee2e2"/>
  <circle cx="450" cy="180" r="42" fill="#f97316"/>
  <path d="M510 220 L520 140 L560 140 L570 220Z" fill="#65a30d"/>
  <path d="M170 290 H630 M180 340 H620 M190 390 H610" stroke="#854d0e" stroke-width="7" opacity=".7"/>`;

// ---------- the 30 gallery items ----------
const bg = {
  "Cooked Meals": ["#fff1e0", "#fed7aa"],
  Bakery: ["#fef3c7", "#fde68a"],
  "Fruits & Vegetables": ["#ecfccb", "#bbf7d0"],
  "Packaged Food": ["#e0f2fe", "#bae6fd"],
  Beverages: ["#ffe4e6", "#fecdd3"],
  Dairy: ["#eff6ff", "#dbeafe"],
  Other: ["#f3e8ff", "#e9d5ff"],
};

const ITEMS = [
  // Cooked Meals
  ["chicken-biryani", "Chicken Biryani", "Cooked Meals", () => bowl({ food: "#f59e0b", topping: [[330, 250, "#92400e"], [400, 225, "#dc2626"], [470, 255, "#92400e"], [440, 275, "#16a34a"]], body: "#fca5a5" })],
  ["vegetable-curry", "Vegetable Curry", "Cooked Meals", () => bowl({ food: "#ea580c", topping: [[340, 258, "#facc15"], [410, 238, "#16a34a"], [470, 262, "#f97316"], [380, 275, "#fde68a"]], body: "#cbd5e1" })],
  ["lentil-soup", "Lentil Soup", "Cooked Meals", () => bowl({ food: "#d97706", topping: [[390, 250, "#16a34a"], [430, 262, "#fde68a"]], body: "#93c5fd" })],
  ["fried-rice", "Vegetable Fried Rice", "Cooked Meals", () => bowl({ food: "#fde68a", topping: [[320, 255, "#16a34a"], [380, 232, "#dc2626"], [450, 245, "#f97316"], [490, 268, "#16a34a"], [410, 270, "#92400e"]], body: "#86efac" })],
  ["pasta-marinara", "Pasta Marinara", "Cooked Meals", () => plate({ food: `<path d="M240 330 Q400 160 560 330 Q400 380 240 330Z" fill="#fcd34d"/><path d="M290 320 Q400 220 510 320 Q400 345 290 320Z" fill="#dc2626"/>`, topping: [[380, 260, "#16a34a"], [430, 270, "#16a34a"]] }), ],
  ["mixed-khichuri", "Mixed Khichuri", "Cooked Meals", () => bowl({ food: "#fbbf24", topping: [[350, 255, "#f97316"], [420, 235, "#16a34a"], [480, 262, "#f97316"]], body: "#fdba74", rim: "#fff7ed" })],
  // Bakery
  ["sourdough-loaf", "Sourdough Loaf", "Bakery", () => loaf({})],
  ["butter-croissants", "Butter Croissants", "Bakery", croissant],
  ["chocolate-cake", "Chocolate Cake", "Bakery", cake],
  ["glazed-donuts", "Glazed Donuts", "Bakery", () => donuts({})],
  ["dinner-rolls", "Dinner Rolls", "Bakery", rolls],
  // Fruits & Vegetables
  ["red-apples", "Red Apples", "Fruits & Vegetables", () => `${shadow(400, 410, 260, 22)}${apple(260, 310, 1.05)}${apple(540, 310, 1.05, "#b91c1c")}${apple(400, 270, 1.2, "#ef4444")}`],
  ["ripe-bananas", "Ripe Bananas", "Fruits & Vegetables", bananas],
  ["fresh-oranges", "Fresh Oranges", "Fruits & Vegetables", () => `${shadow(400, 410, 260, 22)}${round(280, 320, 88, "#f97316", "#fff", true)}${round(500, 320, 88, "#fb923c", "#fff", true)}${round(390, 250, 92, "#f97316", "#fff", true)}`],
  ["ripe-tomatoes", "Ripe Tomatoes", "Fruits & Vegetables", () => `${shadow(400, 410, 260, 22)}${round(270, 330, 82, "#ef4444", "#fff", true)}${round(520, 330, 84, "#dc2626", "#fff", true)}${round(395, 260, 90, "#ef4444", "#fff", true)}`],
  ["fresh-carrots", "Fresh Carrots", "Fruits & Vegetables", carrots],
  // Packaged Food
  ["biscuit-box", "Biscuit Box", "Packaged Food", () => box({})],
  ["canned-beans", "Canned Beans", "Packaged Food", () => can({})],
  ["instant-noodles", "Instant Noodles Pack", "Packaged Food", () => pouch({ body: "#ef4444", band: "#fde68a" })],
  ["breakfast-cereal", "Breakfast Cereal", "Packaged Food", () => box({ body: "#22c55e", label: "#166534", accent: "#f0fdf4", icon: "cereal" })],
  // Beverages
  ["orange-juice", "Orange Juice Bottle", "Beverages", () => bottle({})],
  ["drinking-water", "Drinking Water", "Beverages", () => bottle({ liquid: "#7dd3fc", cap: "#0ea5e9", label: "#e0f2fe" })],
  ["masala-tea", "Masala Tea", "Beverages", () => cup({ leaf: false })],
  ["mango-juice-pack", "Mango Juice Pack", "Beverages", () => carton({ band: "#f59e0b", icon: "mango" })],
  // Dairy
  ["fresh-milk", "Fresh Milk Carton", "Dairy", () => carton({})],
  ["yogurt-cups", "Yogurt Cups", "Dairy", yogurt],
  ["cheese-wedge", "Cheese Wedge", "Dairy", cheese],
  // Other
  ["grocery-basket", "Mixed Grocery Basket", "Other", basket],
  ["sandwich-lunchbox", "Packed Lunch Box", "Other", lunchbox],
  ["snack-hamper", "Snack Hamper", "Other", hamper],
];

const svg = (id, category, art) => {
  const [a, b] = bg[category];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" role="img" aria-label="${id.replaceAll("-", " ")}">
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
<rect width="800" height="500" fill="url(#bg)"/>
<circle cx="680" cy="90" r="120" fill="#fff" opacity=".35"/><circle cx="90" cy="440" r="90" fill="#fff" opacity=".25"/>
${art}
</svg>
`;
};

for (const [id, , category, art] of ITEMS) {
  writeFileSync(join(outDir, `${id}.svg`), svg(id, category, art()));
}

const gallery = ITEMS.map(([id, label, category]) => ({ id, label, category, src: `/images/food/${id}.svg` }));
writeFileSync(join(root, "lib", "gallery.json"), JSON.stringify(gallery, null, 2) + "\n");
writeFileSync(
  join(root, "lib", "gallery.js"),
  `// Built-in food image gallery (files live in /public/images/food). Data comes from gallery.json,
// which is written by scripts/generate-gallery.mjs and updated by scripts/fetch-photos.mjs.
import data from "./gallery.json";

export const GALLERY = data;

export const GALLERY_PATHS = GALLERY.map((image) => image.src);

// Gallery images that fit a category (used by the listing form).
export const galleryFor = (category) => GALLERY.filter((image) => image.category === category);
`
);

console.log(`Generated ${ITEMS.length} gallery images in public/images/food`);
