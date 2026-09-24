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
    let c = fs.readFileSync(f, 'utf8');
    const regex = /(\`http:\/\/\$\{window\.location\.hostname\}:3000[^']+)'/g;
    if (regex.test(c)) {
        c = c.replace(regex, "$1\`");
        fs.writeFileSync(f, c);
        console.log("Fixed: " + f);
    }
});

