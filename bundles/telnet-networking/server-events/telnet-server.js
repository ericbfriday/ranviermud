
import { TelnetServer, TelnetSocket, Sequences, Options } from 'ranvier-telnet';
import { Logger } from '@friday/ranvier';
import TelnetStream from '../lib/TelnetStream';

export const listeners = {
    startup: (state) => function (commander) {
        /**
         * Effectively the 'main' game loop but not really because it's a REPL
         */
        let server = new TelnetServer((rawSocket) => {
            let telnetSocket = new TelnetSocket();
            telnetSocket.attach(rawSocket);
            telnetSocket.telnetCommand(
                Sequences.WILL,
                Options.OPT_EOR);

            const stream = new TelnetStream();
            stream.attach(telnetSocket);

            stream.on('interrupt', () => {
                stream.write('\n*interrupt*\n');
            });

            stream.on('error', (err) => {
                if (err.errno === 'EPIPE') {
                    return Logger.error(
                        'EPIPE on write. A websocket client probably connected to the telnet port.');
                }

                Logger.error(err);
            });

            // Register all of the input events (login, etc.)
            state.InputEventManager.attach(stream);

            stream.write('Connecting...\n');
            Logger.log('User connected...');

            // @see: bundles/ranvier-events/events/login.js
            stream.emit('intro', stream);
        }).netServer;

        const port = commander.opts().port;

        // Start the server and setup error handlers.
        server.listen(port).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                Logger.error(
                    `Cannot start server on port ${port}, address is already in use.`);
                Logger.error('Do you have a MUD server already running?');
            } else if (err.code === 'EACCES') {
                Logger.error(
                    `Cannot start server on port ${port}: permission denied.`);
                Logger.error(
                    'Are you trying to start it on a privileged port without being root?');
            } else {
                Logger.error('Failed to start MUD server:');
                Logger.error(err);
            }
            process.exit(1);
        });

        Logger.log(`Telnet server started on port: ${port}...`);
    },

    shutdown: (state) => function () { },
};
