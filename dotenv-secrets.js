#!/usr/bin/env node

const dotenv = require('dotenv');
const {exec} = require('child_process');
const paramCase = require('param-case');

const env = dotenv.config();

Object.keys(env).forEach(key => {
	const secret = paramCase(key);
	const value = env[key];
	exec(`node_modules/.bin/now secret add "${secret}" "${value}"`, err => {
		if(err) {
			throw err;
		}

		console.log(`Added ${key} as @${secret}`);
	});
});
