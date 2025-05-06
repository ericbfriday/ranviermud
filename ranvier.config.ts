import configJson from './ranvier.json' with { type: 'json' };
import { ConfigSchema } from '@friday/ranvier';
import * as v from '@valibot/valibot';

type ConfigKeys =
    | 'port'
    | 'webPort'
    | 'bundles'
    | 'dataSources'
    | 'entityLoaders'
    | 'logLevel'
    | 'maxAccountNameLength'
    | 'minAccountNameLength'
    | 'maxPlayerNameLength'
    | 'minPlayerNameLength'
    | 'maxCharacters'
    | 'reportToAdmins'
    | 'startingRoom'
    | 'moveCommand'
    | 'skillLag'
    | 'defaultMaxPlayerInventory'
    | 'maxIdleTime';

const entityLoadersConfig = {
    'accounts': {
        'source': 'JsonDirectory',
        'config': {
            'path': 'data/account',
        },
    },
    'players': {
        'source': 'JsonDirectory',
        'config': {
            'path': 'data/player',
        },
    },
    'areas': {
        'source': 'YamlArea',
        'config': {
            'path': 'bundles/[BUNDLE]/areas',
        },
    },
    'npcs': {
        'source': 'Yaml',
        'config': {
            'path': 'bundles/[BUNDLE]/areas/[AREA]/npcs.yml',
        },
    },
    'items': {
        'source': 'Yaml',
        'config': {
            'path': 'bundles/[BUNDLE]/areas/[AREA]/items.yml',
        },
    },
    'rooms': {
        'source': 'Yaml',
        'config': {
            'path': 'bundles/[BUNDLE]/areas/[AREA]/rooms.yml',
        },
    },
    'quests': {
        'source': 'Yaml',
        'config': {
            'path': 'bundles/[BUNDLE]/areas/[AREA]/quests.yml',
        },
    },
    'help': {
        'source': 'YamlDirectory',
        'config': {
            'path': 'bundles/[BUNDLE]/help',
        },
    },
};

const dataSourcesConfig = {
    'YamlArea': {
        'require': '@friday/ranvier-datasource-file.YamlAreaDataSource',
    },
    'Yaml': {
        'require': '@friday/ranvier-datasource-file.YamlDataSource',
    },
    'YamlDirectory': {
        'require': '@friday/ranvier-datasource-file.YamlDirectoryDataSource',
    },
    'JsonDirectory': {
        'require': '@friday/ranvier-datasource-file.JsonDirectoryDataSource',
    },
    // 'Json': {
    //     'require':
    // }
};

const ranvierConfig = {
    ...configJson,
    'port': 4000,
    'webPort': 4000,
    'bundles': [
        'bundle-example-areas',
        'bundle-example-channels',
        'bundle-example-classes',
        'bundle-example-combat',
        'bundle-example-commands',
        'bundle-example-debug',
        'bundle-example-effects',
        'bundle-example-input-events',
        'bundle-example-lib',
        'bundle-example-npc-behaviors',
        'bundle-example-player-events',
        'bundle-example-quests',
        'simple-crafting',
        'vendor-npcs',
        'player-groups',
        'progressive-respawn',
        'telnet-networking',
        'ranvier-telnet',
        'websocket-networking',
    ],
    'dataSources': dataSourcesConfig,
    'entityLoaders': entityLoadersConfig,
    'maxAccountNameLength': 30,
    'minAccountNameLength': 3,
    'maxPlayerNameLength': 20,
    'minPlayerNameLength': 3,
    'maxCharacters': 5,
    'reportToAdmins': false,
    'startingRoom': 'limbo:white',
    'moveCommand': 'move',
    'skillLag': 2000,
    'defaultMaxPlayerInventory': 16,
    'maxIdleTime': 20,
    'logLevel': 'debug',
} satisfies Record<ConfigKeys, unknown>;

try {
    v.parse(ConfigSchema, ranvierConfig);
} catch (e) {
    console.error('Config validation failed:', e);
    throw new Error('Config validation failed');
}
export default ranvierConfig;
