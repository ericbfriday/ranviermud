
export default {
    command: (state) => (args, player) => {
        state.CommandManager.get('help').execute('credits', player);
    },
};
