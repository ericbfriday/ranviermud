
import { Broadcast } from '@friday/ranvier';
import ItemUtil from '../../bundle-example-lib/lib/ItemUtil';

export default {
    aliases: ['worn'],
    usage: 'equipment',
    command: (state) => (args, player) => {
        if (!player.equipment.size) {
            return Broadcast.sayAt(player, 'You are completely naked!');
        }

        Broadcast.sayAt(player, 'Currently Equipped:');
        for (const [slot, item] of player.equipment) {
            Broadcast.sayAt(player, `  <${slot}> ${ItemUtil.display(item)}`);
        }
    },
};
