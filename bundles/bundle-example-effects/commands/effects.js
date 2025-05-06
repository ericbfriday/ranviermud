
import { humanizeDuration } from 'humanize-duration';
const humanize = (sec) => {
    return humanizeDuration(sec, { round: true });
};
import { Broadcast as B, EffectFlag } from '@friday/ranvier';

export default {
    aliases: ['affects'],
    command: (state) => (args, player) => {
        B.sayAt(player, 'Current Effects:');

        const effects = player.effects.entries().filter((effect) => {
            return !effect.config.hidden;
        });

        if (!effects.length) {
            return B.sayAt(player, '  None.');
        }

        for (const effect of effects) {
            let color = 'white';
            if (effect.flags.includes(EffectFlag.BUFF)) {
                color = 'green';
            } else if (effect.flags.includes(EffectFlag.DEBUFF)) {
                color = 'red';
            }
            B.at(player, `<bold><${color}>  ${effect.name}</${color}></bold>`);
            if (effect.config.maxStacks) {
                B.at(player, ` (${effect.state.stacks || 1})`);
            }

            B.at(player, ':');

            if (effect.duration === Infinity) {
                B.sayAt(player, 'Permanent');
            } else {
                B.sayAt(player, ` ${humanize(effect.remaining)} remaining`);
            }
            B.sayAt(player, '\t' + effect.description);
        }
    },
};
