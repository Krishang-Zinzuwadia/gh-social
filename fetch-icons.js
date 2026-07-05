const https = require('https');
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'assets/icons');

if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

const downloadFile = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        }, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve(true);
                });
            } else if (response.statusCode === 302 || response.statusCode === 301) {
                downloadFile(response.headers.location, dest).then(resolve).catch(reject);
            } else {
                file.close();
                fs.unlink(dest, () => {});
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
            }
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
};

const lucideBase = 'https://unpkg.com/lucide-static@0.378.0/icons/';
const simpleIconsBase = 'https://raw.githubusercontent.com/simple-icons/simple-icons/master/icons/';

const lucideIcons = [
    'globe', 'server', 'brain-circuit', 'shield-check', 'database', 'smartphone', 'cpu', 
    'plus-circle', 'gamepad-2', 'graduation-cap', 'palette', 'megaphone', 'banknote', 
    'heart-pulse', 'music', 'code-2', 'brain', 'shield', 'bar-chart-3', 'pen-tool', 
    'leaf', 'clapperboard', 'plane', 'lightbulb', 'camera', 'users'
];

const simpleIconsMap = {
    'react': 'react',
    'nextjs': 'nextdotjs',
    'typescript': 'typescript',
    'javascript': 'javascript',
    'nodejs': 'nodedotjs',
    'express': 'express',
    'python': 'python',
    'django': 'django',
    'flask': 'flask',
    'postgresql': 'postgresql',
    'mongodb': 'mongodb',
    'mysql': 'mysql',
    'firebase': 'firebase',
    'docker': 'docker',
    'kubernetes': 'kubernetes',
    'aws': 'amazonwebservices',
    'git': 'git',
    'github': 'github',
    'tailwindcss': 'tailwindcss',
    'redis': 'redis',
};

const aliases = {
    'cpu-chip': 'cpu',
    'airplane': 'plane'
};

async function fetchIcons() {
    console.log('Fetching Lucide icons...');
    for (const icon of lucideIcons) {
        const dest = path.join(iconsDir, `${icon}.svg`);
        try {
            await downloadFile(`${lucideBase}${icon}.svg`, dest);
            console.log(`Downloaded ${icon}.svg`);
            
            for (const [alias, realName] of Object.entries(aliases)) {
                if (realName === icon) {
                    fs.copyFileSync(dest, path.join(iconsDir, `${alias}.svg`));
                    console.log(`Copied ${icon}.svg to ${alias}.svg`);
                }
            }
        } catch (e) {
            console.error(e.message);
            fs.writeFileSync(dest, `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`);
        }
    }

    console.log('Fetching Simple Icons...');
    for (const [filename, slug] of Object.entries(simpleIconsMap)) {
        const dest = path.join(iconsDir, `${filename}.svg`);
        try {
            await downloadFile(`${simpleIconsBase}${slug}.svg`, dest);
            console.log(`Downloaded ${filename}.svg`);
        } catch (e) {
            console.error(e.message);
            fs.writeFileSync(dest, `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`);
        }
    }
}

fetchIcons();
