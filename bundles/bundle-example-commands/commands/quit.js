
import { Broadcast } from '@friday/ranvier';

export default {
    usage: 'quit',
    command: (state) => (args, player) => {
        if (player.isInCombat()) {
            return Broadcast.sayAt(player, "You're too busy fighting for your life!");
        }

        player.save(() => {
            Broadcast.sayAt(player, 'Goodbye!');
            Broadcast.sayAtExcept(player.room, `${player.name} disappears.`, player);
            state.PlayerManager.removePlayer(player, true);
        });
    },
};
