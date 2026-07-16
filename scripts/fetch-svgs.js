const https = require('https');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../assets/images/onboarding');

// Map of our filenames to simple-icons filenames
const logos = {
    'react.svg': 'react.svg',
    'javascript.svg': 'javascript.svg',
    'typescript.svg': 'typescript.svg',
    'python.svg': 'python.svg',
    'java.svg': 'java.svg',
    'node_js.svg': 'nodedotjs.svg',
    'express.svg': 'express.svg',
    'django.svg': 'django.svg',
    'flask.svg': 'flask.svg',
    'docker.svg': 'docker.svg',
    'kubernetes.svg': 'kubernetes.svg',
    'terraform.svg': 'terraform.svg',
    'jenkins.svg': 'jenkins.svg',
    'github.svg': 'github.svg',
    'git.svg': 'git.svg',
    'firebase.svg': 'firebase.svg',
    'mongodb.svg': 'mongodb.svg',
    'postgresql.svg': 'postgresql.svg',
    'aws.svg': 'amazonaws.svg',
    'azure.svg': 'microsoftazure.svg',
    'gcp.svg': 'googlecloud.svg',
    'tailwind_css.svg': 'tailwindcss.svg'
};

const missing = [
    'frontend.svg',
    'backend.svg',
    'database.svg',
    'devops.svg',
    'mobile.svg',
    'systems.svg',
    'ai_ml.svg',
    'community.svg',
    'gaming.svg',
    'travel.svg',
    'photography.svg',
    'finance.svg',
    'education.svg',
    'writing.svg',
    'music.svg',
    'innovation.svg',
    'cybersecurity.svg',
    'data_science.svg',
    'cloud.svg',
    'health.svg',
    'movies.svg',
    'marketing.svg',
    'sustainability.svg',
    'default_tech.svg'
];

async function downloadSVG(filename, simpleIconName) {
    return new Promise((resolve) => {
        const url = `https://raw.githubusercontent.com/simple-icons/simple-icons/master/icons/${simpleIconName}`;
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    // SimpleIcons come with fill colors sometimes, but mostly they are just paths. 
                    // Let's ensure it has fill="currentColor" to work well.
                    if (!data.includes('fill=')) {
                        data = data.replace('<svg ', '<svg fill="currentColor" ');
                    }
                    fs.writeFileSync(path.join(dir, filename), data, 'utf-8');
                    resolve(true);
                });
            } else {
                console.log(`Failed to download ${simpleIconName} - Status ${res.statusCode}`);
                resolve(false);
            }
        }).on('error', () => resolve(false));
    });
}

async function main() {
    let successCount = 0;
    for (const [filename, simpleIconName] of Object.entries(logos)) {
        const success = await downloadSVG(filename, simpleIconName);
        if (success) successCount++;
    }
    
    console.log(`Successfully downloaded ${successCount} SVGs.`);
    console.log('The following SVG assets are unavailable (custom illustrations needed from Figma):');
    missing.forEach(m => console.log(`- ${m}`));
}

main();
