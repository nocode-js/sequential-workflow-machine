const fs = require('fs');
const path = require('path');

const version = process.argv[2];
if (!version || !(/^\d+\.\d+\.\d+$/.test(version))) {
	console.log('Usage: node set-version.js 1.2.3');
	return;
}

const packageJsonPath = path.resolve('../machine/package.json');
const json = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
json['version'] = version;
fs.writeFileSync(packageJsonPath, JSON.stringify(json, null, '\t'), 'utf-8');
