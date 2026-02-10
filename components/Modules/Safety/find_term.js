
const fs = require('fs');
const path = 'c:\\Users\\Daniel\\Desktop\\EHS PRO\\components\\Modules\\Safety\\CipaModule.tsx';

try {
    const content = fs.readFileSync(path, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
        if (line.includes('const selectedTerm =')) {
            console.log(`Line ${index + 1}: ${line.trim()}`);
        }
    });
} catch (err) {
    console.error(err);
}
