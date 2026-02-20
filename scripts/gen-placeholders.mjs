import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = join(__dirname, '..', 'public', 'images');

// Wine glass SVG icon (simplified)
const wineGlass = `<path d="M50 15 C50 15 35 45 35 55 C35 65 42 72 47 74 L47 88 L38 88 L38 92 L62 92 L62 88 L53 88 L53 74 C58 72 65 65 65 55 C65 45 50 15 50 15Z" fill="__CLR__" opacity="0.3"/>`;

async function makePlaceholder(name, bgColor, accentColor, w, h) {
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${w}" height="${h}" fill="${bgColor}"/>
    <g transform="translate(${w/2 - 50}, ${h/2 - 55})">
      ${wineGlass.replace('__CLR__', accentColor)}
    </g>
  </svg>`;

  await sharp(Buffer.from(svg)).jpeg({ quality: 85 }).toFile(join(out, `${name}.jpg`));
  console.log(`Created ${name}.jpg (${w}x${h})`);
}

// Wine card images (600x800 portrait)
await makePlaceholder('wine-sparkling', '#2a2520', '#d4af37', 600, 800);
await makePlaceholder('wine-sparkling-2', '#302923', '#c9a830', 600, 800);
await makePlaceholder('wine-white', '#2e2a24', '#e8dcc8', 600, 800);
await makePlaceholder('wine-white-2', '#33302a', '#ddd0b8', 600, 800);
await makePlaceholder('wine-red', '#2a2025', '#8b2252', 600, 800);
await makePlaceholder('wine-red-2', '#2d2228', '#7a1e47', 600, 800);
await makePlaceholder('wine-orange', '#2e2620', '#d4884a', 600, 800);

// Hero image (1920x1080 landscape)
await makePlaceholder('hero', '#1a1715', '#3a3530', 1920, 1080);

// About page break image (1400x600 landscape)
await makePlaceholder('about-cellar', '#1e1b18', '#352f28', 1400, 600);

console.log('Done!');
