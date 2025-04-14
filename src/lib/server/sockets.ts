// src/lib/server/socket.ts
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { nanoid } from 'nanoid';

// Tipos para el juego
interface Player {
  id: string;
  symbol: 'X' | 'O';
  name: string;
}

interface Game {
  id: string;
  board: (null | 'X' | 'O')[];
  players: Player[];
  currentTurn: 'X' | 'O';
  status: 'waiting' | 'playing' | 'finished';
}

interface Games {
  [gameId: string]: Game;
}

interface CreateGamePayload {
  playerName: string;
}

interface JoinGamePayload {
  gameId: string;
  playerName: string;
}

interface MovePayload {
  gameId: string;
  index: number;
  symbol: 'X' | 'O';
}

// Singleton para el servidor Socket.IO
let io: Server;
let games: Games = {};

export function getSocketServer(server: HttpServer): Server {
  if (io) return io;

  io = new Server(server);

  setupSocketHandlers(io);

  return io;
}

// Main function to set up socket.io handlers
export function setupSocketHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // Create a new game
    socket.on('createGame', (data: CreateGamePayload) => {
      const gameId = nanoid(6);
      games[gameId] = {
        id: gameId,
        board: Array(9).fill(null),
        players: [{ id: socket.id, symbol: 'X', name: data.playerName || 'Player X' }],
        currentTurn: 'X',
        status: 'waiting'
      };
      
      socket.join(gameId);
      socket.emit('gameCreated', { 
        gameId, 
        playerId: socket.id, 
        symbol: 'X',
        playerName: data.playerName
      });
    });

    // Join an existing game
    socket.on('joinGame', (data: JoinGamePayload) => {
      const game = games[data.gameId];
      
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }
      
      if (game.players.length >= 2) {
        socket.emit('error', { message: 'Game is full' });
        return;
      }

      const playerName = data.playerName || 'Player O';
      game.players.push({ id: socket.id, symbol: 'O', name: playerName });
      game.status = 'playing';
      
      socket.join(data.gameId);
      socket.emit('gameJoined', { 
        gameId: data.gameId, 
        playerId: socket.id, 
        symbol: 'O', 
        board: game.board,
        players: game.players
      });
      
      // Notify all players in the game that a new player has joined
      io.to(data.gameId).emit('gameStarted', { 
        game: {
          ...game,
          players: game.players
        }
      });
    });

    // Handle player moves
    socket.on('makeMove', ({ gameId, index, symbol }: MovePayload) => {
      const game = games[gameId];
      
      if (!game || game.status !== 'playing' || game.currentTurn !== symbol || game.board[index] !== null) {
        return;
      }
      
      // Update the board
      game.board[index] = symbol;
      
      // Check for win or draw
      const winner = checkWinner(game.board);
      if (winner) {
        game.status = 'finished';
        io.to(gameId).emit('gameOver', { winner, board: game.board });
      } else if (!game.board.includes(null)) {
        game.status = 'finished';
        io.to(gameId).emit('gameOver', { winner: null, board: game.board }); // Draw
      } else {
        // Switch turns
        game.currentTurn = game.currentTurn === 'X' ? 'O' : 'X';
        io.to(gameId).emit('boardUpdated', { board: game.board, currentTurn: game.currentTurn });
      }
    });

    // Handle disconnections
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Find the game this player was in
      for (const gameId in games) {
        const game = games[gameId];
        const playerIndex = game.players.findIndex(p => p.id === socket.id);
        
        if (playerIndex !== -1) {
          if (game.status === 'playing') {
            // If the game was in progress, notify the other player and end the game
            game.status = 'finished';
            io.to(gameId).emit('playerDisconnected');
          }
          
          // If all players have left, clean up the game
          if (game.players.length <= 1) {
            delete games[gameId];
          } else {
            game.players.splice(playerIndex, 1);
          }
          break;
        }
      }
    });
  });
}

// Check for a winner
function checkWinner(board: (null | 'X' | 'O')[]): null | 'X' | 'O' {
  const winPatterns: number[][] = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}