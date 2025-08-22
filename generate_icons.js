const fs = require('fs');
const path = require('path');

// Create a simple SVG icon generator
function createSVGIcon(size) {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .bg { fill: #66BB6A; }
      .text { fill: white; font-family: Arial, sans-serif; font-weight: bold; text-anchor: middle; dominant-baseline: central; }
      .symbol { fill: #4CAF50; }
    </style>
  </defs>
  
  <!-- Background circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - size/10}" class="bg"/>
  
  <!-- MTG Text -->
  <text x="${size/2}" y="${size/2}" font-size="${Math.floor(size/5)}" class="text">MTG</text>
  
  <!-- Small mana symbol -->
  ${size >= 96 ? `<circle cx="${size - size/8 - size/10}" cy="${size/8 + size/10}" r="${size/16}" class="symbol"/>` : ''}
</svg>`;
    return svg;
}

// Create icons directory
if (!fs.existsSync('icons')) {
    fs.mkdirSync('icons');
}

// Required PWA icon sizes
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log('Generating PWA icons for MTG Collection Tracker...');

sizes.forEach(size => {
    const filename = `icons/icon-${size}x${size}.svg`;
    const svgContent = createSVGIcon(size);
    
    fs.writeFileSync(filename, svgContent);
    console.log(`✓ Created ${filename}`);
});

console.log(`\n✅ Successfully generated ${sizes.length} PWA icons!`);
console.log('Icons saved as SVG files in the icons/ directory');
console.log('\nNote: SVG icons work perfectly for PWAs and are smaller than PNG files.');

// Verify all files were created
console.log('\nVerifying icons:');
sizes.forEach(size => {
    const filename = `icons/icon-${size}x${size}.svg`;
    if (fs.existsSync(filename)) {
        const stats = fs.statSync(filename);
        console.log(`✓ ${filename} (${stats.size} bytes)`);
    } else {
        console.log(`✗ ${filename} - MISSING!`);
    }
});
