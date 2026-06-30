const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../assets/images/onboarding');

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

const skills = ['frontend', 'backend', 'ai_ml', 'devops', 'database', 'mobile', 'systems'];
const tech = [
    'react', 'typescript', 'javascript', 'python', 'java', 'node_js', 'express', 
    'django', 'flask', 'docker', 'kubernetes', 'git', 'github', 'firebase', 
    'mongodb', 'postgresql', 'aws', 'tailwind_css', 'default_tech'
];
const interests = [
    'ai', 'cybersecurity', 'gaming', 'photography', 'design', 'education', 'music', 
    'finance', 'travel', 'community', 'cloud', 'data_science', 'open_source', 
    'writing', 'innovation', 'health', 'movies', 'marketing', 'sustainability'
];

const allIcons = [...skills, ...tech, ...interests];

// Create a generic placeholder that looks like a tech logo (a hexagon with a circle inside)
// Hardcode the stroke color so it's visible on dark backgrounds, matching Figma's exported behavior
const placeholderSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F0F6EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
  <circle cx="12" cy="12" r="3" />
</svg>`;

allIcons.forEach(icon => {
    fs.writeFileSync(path.join(dir, `${icon}.svg`), placeholderSVG, 'utf-8');
});

console.log(`Updated ${allIcons.length} SVGs in ${dir}`);
