import {
  Server,
  Socket,
} from 'socket.io';
import chalk from 'chalk';
import {
  Player,
} from './models';
import {
  BoardIcons,
  MessageSocketEnum,
} from './constants';

export class WebsocketServer {
  wss: Server;

  connections: number = 0;

  createdPlayers: number = 0;

  activeGame: string = '';

  player1: Partial<Player> & {
    socket: Socket
  };

  player2: Partial<Player> & {
    socket: Socket
  };

  gameSize: number = 2;

  constructor() {
    this.wss = new Server(8080);
    this.setupSocketEvents();
  }

  setupSocketEvents() {
    this.wss.on('connection', (socket) => {
      console.log('Connected:', socket.id);
      this.connections++;

      socket.on(MessageSocketEnum.ALL_ACTIVE_GAMES, () => {
        socket.emit(MessageSocketEnum.ALL_ACTIVE_GAMES, [this.activeGame]);
      });

      socket.on(MessageSocketEnum.CREATE_GAME, ({ name, size }: { name: string, size: number}) => {
        this.player1 = {
          socket,
        };
        this.activeGame = name;
        this.gameSize = size;
      });

      socket.on(MessageSocketEnum.CONNECT_TO_GAME, () => {
        this.player2 = {
          socket,
        };
        this.player1.socket.emit(MessageSocketEnum.START_GAME, {
          boardSize: this.gameSize,
        });
        this.player2.socket.emit(MessageSocketEnum.START_GAME, {
          boardSize: this.gameSize,
        });
      });

      socket.on(MessageSocketEnum.CREATE_PLAYER, (player: Player) => {
        if (this.player1.socket.id === socket.id) {
          this.player1 = {
            ...this.player1,
            ...player,
          };
        } else {
          this.player2 = {
            ...this.player2,
            ...player,
          };
        }

        this.createdPlayers++;

        if (this.createdPlayers === 2) {
          this.player1.socket.emit(MessageSocketEnum.STEP);
        }
      });

      socket.on(MessageSocketEnum.PUNCH, (coords: {col: number, row: number}) => {
        if (this.player1.socket.id === socket.id) {
          this.makePunch(this.player1 as Player & { socket: Socket }, this.player2 as Player & { socket: Socket }, coords);
        } else {
          this.makePunch(this.player2 as Player & { socket: Socket }, this.player1 as Player & { socket: Socket }, coords);
        }
      });
    });
  }

  makePunch(player: Player & { socket: Socket }, opponent: Player & { socket: Socket }, coords: { col: number, row: number }) {
    if (opponent.board.board[coords.row][coords.col] === BoardIcons.SHIP_CELL) {
      player.opponentBoard.board[coords.row][coords.col] = BoardIcons.HIT_CELL;
      opponent.board.board[coords.row][coords.col] = chalk.red(BoardIcons.SHIP_CELL);

      player.socket.emit(MessageSocketEnum.MY_SHOT, {
        row: coords.row,
        col: coords.col,
        result: BoardIcons.HIT_CELL,
      });

      opponent.socket.emit(MessageSocketEnum.OPPONENT_SHOT, {
        row: coords.row,
        col: coords.col,
        result: chalk.red(BoardIcons.SHIP_CELL),
      });
    } else {
      player.opponentBoard.board[coords.row][coords.col] = BoardIcons.MISS_CELL;
      opponent.board.board[coords.row][coords.col] = BoardIcons.MISS_CELL;

      player.socket.emit(MessageSocketEnum.MY_SHOT, {
        row: coords.row,
        col: coords.col,
        result: BoardIcons.MISS_CELL,
      });

      opponent.socket.emit(MessageSocketEnum.OPPONENT_SHOT, {
        row: coords.row,
        col: coords.col,
        result: BoardIcons.MISS_CELL,
      });
    }

    if (this.isGameOver(opponent)) {
      player.socket.emit(MessageSocketEnum.GAME_OVER, true);
      opponent.socket.emit(MessageSocketEnum.GAME_OVER, false);

      this.activeGame = '';
    } else {
      opponent.socket.emit(MessageSocketEnum.STEP);
    }
  }

  isGameOver(player: Player) {
    return player.ships.every((ship) => ship.coordinates.every(({ row, col }) => player.board.board[row][col] === chalk.red(BoardIcons.SHIP_CELL)));
  }
}
