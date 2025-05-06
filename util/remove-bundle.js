#!/usr/bin / env node

// deno-lint-ignore-file
import process from 'node:process';

import fs from 'node:fs';
import { execSync } from 'node:child_process';
import commander from 'commander';

const gitRoot = execSync('git rev-parse --show-toplevel').toString('utf8').trim();

process.chdir(gitRoot);

commander.command('remove-bundle <bundle name>');
commander.parse(process.argv);

if (commander.args.length < 1) {
    console.error(`Syntax: ${process.argv0} <bundle>`);
    process.exit(0);
}

const [bundle] = commander.args;

if (!fs.existsSync(gitRoot + `/bundles/${bundle}`)) {
    console.error('Not a valid bundle name');
    process.exit(0);
}

console.log('Removing submodule...');
execSync(`git submodule deinit bundles/${bundle}`, { stdio: 'ignore' });
execSync(`git rm bundles/${bundle}`, { stdio: 'ignore' });
execSync(`rm -rf .git/modules/bundles/${bundle}`);

console.log('Submodule removed.\nCommit the removal to git with `git commit -m "Removed ${bundle} bundle"`');
