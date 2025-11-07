const fs = require('fs');
const path = require('path');
const selfsigned = require('selfsigned');

function ensureCertificates(keyPath, certPath) {
    if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
        const attrs = [{ name: 'commonName', value: 'localhost' }];
        const pems = selfsigned.generate(attrs, { days: 365 });
        fs.writeFileSync(certPath, pems.cert, 'utf-8');
        fs.writeFileSync(keyPath, pems.private, 'utf-8');
    }
    return {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
    };
}

module.exports = {
    ensureCertificates
};
