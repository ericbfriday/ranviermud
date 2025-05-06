
import { Broadcast } from '@friday/ranvier';

/**
 * Flush the command queue
 */
export default {
    usage: 'flush',
    command: (state) => (args, player) => {
        player.commandQueue.flush();
        Broadcast.sayAt(player, '<bold><yellow>Queue flushed.</yellow></bold>');
    },
};
