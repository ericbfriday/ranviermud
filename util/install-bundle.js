import process from 'node:process';
import fs from 'node:fs';
import cp from 'node:child_process';
import os from 'node:os';
import { Command } from 'commander';
import parse from 'npm:git-url-parse';

const commander = new Command();

const gitRoot = cp.execSync('git rev-parse --show-toplevel').toString('utf8').trim();
process.chdir(gitRoot);

commander.command('install-bundle <remote url>');
commander.parse(process.argv);

if (commander.args.length < 1) {
    console.error(`Syntax: ${process.argv0} <remote url>`);
    process.exit(0);
}

const [remote] = commander.args;

if (fs.existsSync(gitRoot + `/bundles/${remote}`)) {
    console.error('Bundle already installed');
    process.exit(0);
}

try {
    cp.execSync(`git ls-remote ${remote}`);
} catch (err) {
    process.exit(0);
}

const { name } = parse(remote);

console.log('Adding bundle...');
cp.execSync(`git submodule add ${remote} bundles/${name}`);

console.log('Installing deps...');
if (fs.existsSync(`${gitRoot}/bundles/${name}/package.json`)) {
    const npmCmd = os.platform().startsWith('win') ? 'npm.cmd' : 'npm';
    cp.spawnSync(npmCmd, ['install', '--no-audit'], {
        cwd: `${gitRoot}/bundles/${name}`,
    });
}

console.log(`Bundle installed. Commit the bundle with: git commit -m \"Added ${name} bundle\"`);
