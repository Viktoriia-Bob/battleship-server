import {
  WebsocketServer,
} from './websocket-server';

(() => {
  const server = new WebsocketServer();
  console.log('Connections:', server.connections);
})();
