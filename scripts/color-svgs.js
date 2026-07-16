const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../assets/images/onboarding');

const colorMap = {
    'frontend.svg': '#3B82F6', // Blue
    'backend.svg': '#10B981',  // Emerald
    'ai_ml.svg': '#8B5CF6',    // Violet
    'devops.svg': '#F97316',   // Orange
    'database.svg': '#EAB308', // Yellow
    'mobile.svg': '#06B6D4',   // Cyan
    'systems.svg': '#EC4899'   // Pink
};

Object.entries(colorMap).forEach(([filename, color]) => {
    const filePath = path.join(dir, filename);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf-8');
        // Replace the hardcoded #F0F6EB stroke with the new color
        content = content.replace(/stroke="#F0F6EB"/g, `stroke="${color}"`);
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated ${filename} with color ${color}`);
    } else {
        console.log(`File not found: ${filePath}`);
    }
});
