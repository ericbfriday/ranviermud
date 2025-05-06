
import { Broadcast } from '@friday/ranvier';
import ItemUtil from '../../bundle-example-lib/lib/ItemUtil';

export default {
    usage: 'inventory',
    command: (state) => (args, player) => {
        if (!player.inventory || !player.inventory.size) {
            return Broadcast.sayAt(player, "You aren't carrying anything.");
        }

        Broadcast.at(player, 'You are carrying');
        if (isFinite(player.inventory.getMax())) {
            Broadcast.at(player, ` (${player.inventory.size}/${player.inventory.getMax()})`);
        }
        Broadcast.sayAt(player, ':');

        // TODO: Implement grouping
        for (const [, item] of player.inventory) {
            Broadcast.sayAt(player, ItemUtil.display(item));
        }
    },
};
