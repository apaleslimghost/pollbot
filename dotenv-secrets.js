#!/usr/bin/env node

const dotenv = require('dotenv');
const {execSync} = require('child_process');
const paramCase = require('param-case');

const env = dotenv.config();

const secrets = execSync('now secrets ls | grep sec_ | cut -d " " -f 5', {encoding: 'utf8'}).trim().split('\n');

Object.keys(env).forEach(key => {
	const secret = paramCase(key);
	const value = env[key];

	if(secrets.includes(secret)) {
		console.log(`Secret @${secret} already exists`);
		return;
	}

	execSync(`node_modules/.bin/now secret add "${secret}" "${value}"`);
	console.log(`Added ${key} as @${secret}`);
});
