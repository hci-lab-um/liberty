const express = require('express');
const https = require('https');
const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

const app = express();

// Serve static files (adjust the directory as needed)
app.use(express.static('public'));

// Generate a self-signed certificate using node-forge
const pki = forge.pki;
const keys = pki.rsa.generateKeyPair(2048);
const cert = pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
const attrs = [
  { name: 'commonName', value: 'localhost' },
  { name: 'countryName', value: 'US' },
  { shortName: 'ST', value: 'Virginia' },
  { name: 'localityName', value: 'Blacksburg' },
  { name: 'organizationName', value: 'Test' },
  { shortName: 'OU', value: 'Test' }
];
cert.setSubject(attrs);
cert.setIssuer(attrs);
cert.sign(keys.privateKey);

const pem = pki.certificateToPem(cert);
const key = pki.privateKeyToPem(keys.privateKey);

// Create HTTPS server
const httpsServer = https.createServer({
  key: key,
  cert: pem,
}, app);

const PORT = 3000;
httpsServer.listen(PORT, () => console.log(`HTTPS server running on port ${PORT}`));
