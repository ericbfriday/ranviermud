#!/usr/bin/env deno
import process, { type config } from 'node:process';

import fs from 'node:fs';
import * as Ranvier from '@friday/ranvier';
import { Command } from 'commander';

// Package.json for versioning
// import pkg from './package.json' with { type: 'json' };
import { assertIsRecord } from '@stdext/assert/is_record';
import type { IGameState, IGameStateStatic } from '../ranvier/src/GameState.ts';
import { createRequire } from 'node:module';

/**
 * Main file, use this to run the server:
 * node ranvier [options]
 *
 * Options:
 *   -v Verbose loggin
 *   --port Port to listen on
 */

const Config = Ranvier.Config;

const require = createRequire(import.meta.url);

const __filename = new URL('', import.meta.url).pathname;
// Will contain trailing slash
const __dirname = new URL('.', import.meta.url).pathname;

// Wrapper for ranvier.json
Ranvier.Data.setDataPath(__dirname + '/data/');
if (fs.existsSync('./ranvier.config.ts')) {
    try {
        const { default: configObj } = await import('./ranvier.config.ts');
        Config.load(configObj);
    } catch (err) {
        console.error(`Error loading ranvier.config.js`);
    }
    // using file = Deno.openSync('./ranvier.config.mjs', { read: true });
    // const { isFile, size } = await file.stat();
    // if (isFile) {
    //     const buf = new Uint8Array(size);
    //     await file.read(buf);
    //     const text = new TextDecoder().decode(buf);
    //     try {
    //         const configObj = JSON.parse(text);
    //         Config.load(configObj);
    //     } catch (err) {
    //         console.error(`Error loading ranvier.config.js`);
    //     }
    // }
} else if (fs.existsSync('./ranvier.json')) {
    const { default: jsonObj } = await import('./ranvier.json', {
        with: {
            type: 'json',
        },
    });
    assertIsRecord(jsonObj);
    Config.load(jsonObj);
} else {
    console.error('ERROR: No ranvier.json or ranvier.conf.js found');
    process.exit(1);
}

/* COMMAND LINE */

const commander = new Command();
commander.name('ranvier')
    .description('My spin on ranvier in Deno')
    .version('1.0.0')
    .option('--pretty-errors', 'enable pretty error output')
    .option('-h, --help <topic>', 'Read help about <topic>')
    .option('-v, --verbose', 'enable verbose output', Config.get('logLevel') || 'debug')
    .option('-p, --port <port>', 'Port to listen on', Config.get('port', '4000'));
// const args = parseArgs(Deno.args, {
//     alias: {
//         verbose: 'v',
//         port: 'p',
//         help: 'h',
//         prettyErrors: 'pe',
//     },
//     default: {
//         verbose: Config.get('logLevel') || 'debug',
//         port: Ranvier.Config.get('port', 23),
//         prettyErrors: false,
//     },
// });

// Set debug variable and encoding.
// 'net' by default to help find possible server errors.
// process.env.NODE_DEBUG = 'net';
process.stdin.setEncoding('utf8');

const Logger = Ranvier.Logger;
// const logfile = Ranvier.Config.get('logfile');
// if (logfile) {
//   Logger.setFileLogging(`${__dirname}/log/${logfile}`);
// }
commander.parse();
const args = commander.opts();
if (args.prettyErrors) {
    Logger.enablePrettyErrors();
}

// Set logging level based on CLI option or environment variable.
const logLevel = args.verbose ? 'verbose' : process.env.LOG_LEVEL || Config.get('logLevel') || 'debug';
Logger.setLevel(logLevel);

// Global state object, server instance and configurable intervals.
let saveInterval: number | undefined;
let tickInterval: number | undefined; // 100ms
let playerTickInterval: number | undefined; // 100ms

function consolidateGameState(
    staticState: IGameStateStatic,
    { BundleManager }: Record<'BundleManager', Ranvier.BundleManager>,
): IGameState {
    return { ...staticState, BundleManager };
}

let GameState: IGameState;

/**
 * Do the dirty work
 */
async function init(restartServer?: boolean) {
    Logger.log('START - Loading entities');
    restartServer = typeof restartServer === 'undefined' ? true : restartServer;

    const staticGameState = {
        AccountManager: new Ranvier.AccountManager(),
        AreaBehaviorManager: new Ranvier.BehaviorManager(),
        AreaFactory: new Ranvier.AreaFactory(),
        AreaManager: new Ranvier.AreaManager(),
        AttributeFactory: new Ranvier.AttributeFactory(),
        ChannelManager: new Ranvier.ChannelManager(),
        CommandManager: new Ranvier.CommandManager(),
        Config, // All global server settings like default respawn time, save interval, port, what bundles to load, etc.
        EffectFactory: new Ranvier.EffectFactory(),
        HelpManager: new Ranvier.HelpManager(),
        InputEventManager: new Ranvier.EventManager(),
        ItemBehaviorManager: new Ranvier.BehaviorManager(),
        ItemFactory: new Ranvier.ItemFactory(),
        ItemManager: new Ranvier.ItemManager(),
        MobBehaviorManager: new Ranvier.BehaviorManager(),
        MobFactory: new Ranvier.MobFactory(),
        MobManager: new Ranvier.MobManager(),
        PartyManager: new Ranvier.PartyManager(),
        PlayerManager: new Ranvier.PlayerManager(),
        QuestFactory: new Ranvier.QuestFactory(),
        QuestGoalManager: new Ranvier.QuestGoalManager(),
        QuestRewardManager: new Ranvier.QuestRewardManager(),
        RoomBehaviorManager: new Ranvier.BehaviorManager(),
        RoomFactory: new Ranvier.RoomFactory(),
        RoomManager: new Ranvier.RoomManager(),
        SkillManager: new Ranvier.SkillManager(),
        SpellManager: new Ranvier.SkillManager(),
        ServerEventManager: new Ranvier.EventManager(),
        GameServer: new Ranvier.GameServer(),
        DataLoader: Ranvier.Data,
        EntityLoaderRegistry: new Ranvier.EntityLoaderRegistry(),
        DataSourceRegistry: new Ranvier.DataSourceRegistry(),
    } satisfies IGameStateStatic;

    // setup entity loaders
    staticGameState.DataSourceRegistry.load(
        require,
        __dirname,
        Config.get('dataSources'),
    );
    staticGameState.EntityLoaderRegistry.load(
        staticGameState.DataSourceRegistry,
        Config.get('entityLoaders'),
    );
    staticGameState;
    staticGameState.AccountManager.setLoader(
        staticGameState.EntityLoaderRegistry.get('accounts' as const),
    );
    staticGameState.PlayerManager.setLoader(
        staticGameState.EntityLoaderRegistry.get('players' as const),
    );

    // Setup bundlemanager
    const BundleManager = new Ranvier.BundleManager(
        __dirname + '/bundles/',
        GameState,
    );

    await BundleManager.loadBundles();

    GameState = consolidateGameState(staticGameState, { BundleManager });

    GameState.ServerEventManager.attach(GameState.GameServer);

    if (restartServer) {
        Logger.log('START - Starting server');
        GameState.GameServer.startup(commander);

        // Ticks for effect processing and combat happen every 100ms
        clearInterval(tickInterval);
        tickInterval = setInterval(() => {
            GameState.AreaManager.tickAll(GameState);
            GameState.ItemManager.tickAll();
        }, Config.get('entityTickFrequency', 100));

        clearInterval(playerTickInterval);
        playerTickInterval = setInterval(() => {
            GameState.PlayerManager.emit('updateTick');
        }, Config.get('playerTickFrequency', 100));
    }
}

// START IT UP!
init(true);
// vim: set syn=javascript :
