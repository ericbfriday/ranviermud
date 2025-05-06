
import { Broadcast, ItemType } from '@friday/ranvier';
import ArgParser from '../../bundle-example-lib/lib/ArgParser';
import ItemUtil from '../../bundle-example-lib/lib/ItemUtil';

export default {
    aliases: ['unwield', 'unequip'],
    usage: 'remove <item>',
    command: (state) => (arg, player) => {
        if (!arg.length) {
            return Broadcast.sayAt(player, 'Remove what?');
        }

        const result = ArgParser.parseDot(arg, player.equipment, true);
        if (!result) {
            return Broadcast.sayAt(player, "You aren't wearing anything like that.");
        }

        const [slot, item] = result;
        Broadcast.sayAt(player, `<green>You un-equip: </green>${ItemUtil.display(item)}<green>.</green>`);
        player.unequip(slot);
    },
};
