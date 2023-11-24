# Battleship-server

## Description

The battleship-server project is the server-side component for the Battleship game. It manages game 
creation, player connections, and communication between clients. The server uses WebSockets to 
establish real-time communication with connected [clients](https://github.com/Viktoriia-Bob/battleship-client).

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Gameplay](#gameplay)
- [Dependencies](#dependencies)
- [Collaboration](#collaboration)

## Installation

1. **Install Dependencies:**

```bash
npm install
```

2. **Environment variables**

Add the port for the websocket server:

```dotenv
WEBSOCKET_PORT=your_websocket_port
```

3. **Start the Server:**

```bash
npm start
```

## Usage

The server listens for incoming WebSocket connections on the specified address and port. Players 
connect to the server from the battleship-client and participate in multiplayer games.

## Gameplay

The server manages game sessions, player connections, and facilitates communication between clients.
Players can create games or join existing ones by connecting to the server.

## Dependencies

- [Node.js](https://nodejs.org/en)
- [Socket.io](https://socket.io/)

## Collaboration

Feel free to contribute to the development of this Battleship server. Fork the repository, make your changes, and submit a pull request.
