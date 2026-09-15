const logs = [];
const MAX_LOGS = 1000;

const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;
const originalInfo = console.info;

function captureLog(level, args) {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    // gelen log datalarını güvenli bir şekilde metne döküyoruz
    const message = args.map(a => {
        if (a instanceof Error) return a.stack || a.message;
        if (typeof a === 'object') {
            try {
                return JSON.stringify(a);
            } catch (e) {
                return '[Circular/Unserializable Object]';
            }
        }
        return String(a);
    }).join(' ');
    
    const logEntry = `[${timestamp}] [${level}] ${message}`;
    logs.push(logEntry);
    
    if (logs.length > MAX_LOGS) {
        logs.shift();
    }
}

function init() {
    console.log = function(...args) { captureLog('LOG', args); originalLog.apply(console, args); };
    console.error = function(...args) { captureLog('ERROR', args); originalError.apply(console, args); };
    console.warn = function(...args) { captureLog('WARN', args); originalWarn.apply(console, args); };
    console.info = function(...args) { captureLog('INFO', args); originalInfo.apply(console, args); };
}

function getLogs() {
    return logs;
}

module.exports = { init, getLogs };

