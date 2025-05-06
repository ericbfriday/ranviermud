
import { Broadcast } from '@friday/ranvier';

export default {
    usage: 'save',
    command: (state) => (args, player) => {
        player.save(() => {
            Broadcast.sayAt(player, 'Saved.');
        });
    },
};
