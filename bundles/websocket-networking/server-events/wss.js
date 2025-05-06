
// import 3rd party websocket library
import { Server } from 'ws';

import { Logger } from '@friday/ranvier';

// import our adapter
import WebsocketStream from '../lib/WebsocketStream';

export const listeners = {
    startup: (state) => function (commander) {
        // create a new websocket server using the port command line argument
        const wss = new Server({ port: 4001 });

        // This creates a super basic "echo" websocket server
        wss.on('connection', function connection(ws) {
            // create our adapter
            const stream = new WebsocketStream();
            // and attach the raw websocket
            stream.attach(ws);

            // Register all of the input events (login, etc.)
            state.InputEventManager.attach(stream);

            stream.write('Connecting...\n');
            Logger.log('User connected via websocket...');

            // @see: bundles/ranvier-events/events/login.js
            stream.emit('intro', stream);
        });
        Logger.log(`Websocket server started on port: ${wss.options.port}...`);
    },

    shutdown: (state) => function () {
    },
};
