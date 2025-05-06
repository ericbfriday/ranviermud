
import fs from 'node:fs';

import { EventUtil } from '@friday/ranvier';

/**
 * MOTD event
 */
export default {
    event: (state) => (socket) => {
        const motd = fs.readFileSync(__dirname + '/../resources/motd').toString('utf8');
        if (motd) {
            EventUtil.genSay(socket)(motd);
        }

        return socket.emit('login', socket);
    },
};
