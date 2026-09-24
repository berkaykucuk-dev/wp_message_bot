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
    if (c.includes('\\${')) {
        c = c.replace(/\\\$\{/g, '${');
        fs.writeFileSync(f, c);
        console.log("Fixed: " + f);
    }
});
