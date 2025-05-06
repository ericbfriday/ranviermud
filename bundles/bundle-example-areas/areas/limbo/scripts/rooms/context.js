
import { Broadcast } from '@friday/ranvier';

export default {
    listeners: {
        command: (state) =>
            function (player, commandName, args) {
                Broadcast.sayAt(
                    player,
                    `You just executed room context command '${commandName}' with arguments ${args}`,
                );
            },
    },
};
