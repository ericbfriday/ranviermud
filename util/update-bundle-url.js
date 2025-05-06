#!/usr/bin / env node

// deno-lint-ignore-file
import process from 'node:process';

import fs from 'node:fs';
import { execSync } from 'child_process';
import commander from 'commander';

const gitRoot = execSync('git rev-parse --show-toplevel').toString('utf8').trim();

process.chdir(gitRoot);

commander.command('update-bundle-remote <bundle name> <remote url>');
commander.parse(process.argv);

if (commander.args.length < 2) {
    console.error(`Syntax: ${process.argv0} <bundle> <remote url>`);
    process.exit(0);
}

const [bundle, remote] = commander.args;

if (!fs.existsSync(gitRoot + `/bundles/${bundle}`)) {
    console.error('Not a valid bundle name');
    process.exit(0);
}

try {
    execSync(`git ls-remote ${remote}`);
} catch (err) {
    process.exit(0);
}

console.log('Updating remote url...');
execSync(`git config -f .gitmodules "submodule.bundles/${bundle}.url" ${remote}`, { stdio: 'ignore' });
console.log('Syncing...');
execSync('git submodule sync', { stdio: 'ignore' });
console.log('Updating...');
execSync('git submodule update --init --recursive --remote', { stdio: 'ignore' });
