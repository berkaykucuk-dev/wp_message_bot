const fs = require('fs');
function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.vue') || file.endsWith('.ts') || file.endsWith('.js')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('.');
files.forEach(f => {
    let lines = fs.readFileSync(f, 'utf8').split('\n');
    let changed = false;
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Match both 'http://localhost:3000/...' and `http://localhost:3000/...`
        if (line.includes("'http://localhost:3000")) {
            // It's a single quote string. We replace the opening quote with backtick, 
            // localhost with ${window.location.hostname}, and closing quote with backtick.
            line = line.replace(/'http:\/\/localhost:3000([^']*)'/g, "\`http://\\${window.location.hostname}:3000$1\`");
            lines[i] = line;
            changed = true;
        } else if (line.includes("\`http://localhost:3000")) {
            // It's already a backtick string, just replace localhost
            line = line.replace(/\`http:\/\/localhost:3000/g, "\`http://\\${window.location.hostname}:3000");
            lines[i] = line;
            changed = true;
        }
    }
    if (changed) {
        fs.writeFileSync(f, lines.join('\n'));
        console.log("Fixed: " + f);
    }
});

