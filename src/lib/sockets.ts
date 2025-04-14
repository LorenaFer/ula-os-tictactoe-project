// src/lib/socket.ts
import { io, Socket } from 'socket.io-client';
import { writable, type Writable } from 'svelte/store';

// Tipos para el juego
type CellValue = null | 'X' | 'O';
type GameStatus = 'waiting' | 'playing' | 'finished';

interface Player {
  id: string;
  symbol: 'X' | 'O';
  name: string;
}

interface GameCreatedEvent {
  gameId: string;
  playerId: string;
  symbol: 'X' | 'O';
  playerName: string;
}

interface GameJoinedEvent {
  gameId: string;
  playerId: string;
  symbol: 'X' | 'O';
  board: CellValue[];
  players: Player[];
}

interface GameStartedEvent {
  game: {
    id: string;
    board: CellValue[];
    players: Player[];
    currentTurn: 'X' | 'O';
    status: GameStatus;
  };
}

interface BoardUpdatedEvent {
  board: CellValue[];
  currentTurn: 'X' | 'O';
}

interface GameOverEvent {
  winner: CellValue;
  board: CellValue[];
}

interface ErrorEvent {
  message: string;
}

interface MovePayload {
  gameId: string;
  index: number;
  symbol: 'X' | 'O';
}

// Game state stores
export const gameId: Writable<string | null> = writable(null);
export const playerId: Writable<string | null> = writable(null);
export const playerSymbol: Writable<'X' | 'O' | null> = writable(null);
export const playerName: Writable<string | null> = writable(null);
export const opponentName: Writable<string | null> = writable(null);
export const board: Writable<CellValue[]> = writable(Array(9).fill(null));
export const gameStatus: Writable<GameStatus> = writable('waiting');
export const currentTurn: Writable<'X' | 'O' | null> = writable(null);
export const winner: Writable<CellValue> = writable(null);
export const error: Writable<string | null> = writable(null);

// Initialize socket connection with explicit URL
// This ensures we connect to the right socket.io endpoint
export const socket: Socket = io({
  path: '/socket.io'
});

// Setup socket event listeners
socket.on('gameCreated', (data: GameCreatedEvent) => {
  gameId.set(data.gameId);
  playerId.set(data.playerId);
  playerSymbol.set(data.symbol);
  playerName.set(data.playerName);
  board.set(Array(9).fill(null));
  gameStatus.set('waiting');
  error.set(null);
});

socket.on('gameJoined', (data: GameJoinedEvent) => {
  gameId.set(data.gameId);
  playerId.set(data.playerId);
  playerSymbol.set(data.symbol);
  board.set(data.board);
  
  // Set player and opponent names
  const currentPlayer = data.players.find(p => p.id === data.playerId);
  const opponent = data.players.find(p => p.id !== data.playerId);
  
  if (currentPlayer) {
    playerName.set(currentPlayer.name);
  }
  
  if (opponent) {
    opponentName.set(opponent.name);
  }
  
  error.set(null);
});

socket.on('gameStarted', (data: GameStartedEvent) => {
  gameStatus.set('playing');
  currentTurn.set(data.game.currentTurn);
  
  // Update opponent name if the game has started
  const myPlayerId = localStorage.getItem('playerId') || '';
  const opponent = data.game.players.find(p => p.id !== myPlayerId);
  
  if (opponent) {
    opponentName.set(opponent.name || 'Opponent');
  }
});

socket.on('boardUpdated', (data: BoardUpdatedEvent) => {
  board.set(data.board);
  currentTurn.set(data.currentTurn);
});

socket.on('gameOver', (data: GameOverEvent) => {
  board.set(data.board);
  winner.set(data.winner);
  gameStatus.set('finished');
});

socket.on('playerDisconnected', () => {
  error.set('The other player has disconnected');
  gameStatus.set('finished');
});

socket.on('error', (data: ErrorEvent) => {
  error.set(data.message);
});

// Game actions
export function createGame(name: string): void {
  socket.emit('createGame', { playerName: name || 'Player' });
  // Save player ID to localStorage to identify the player later
  socket.on('connect', () => {
    localStorage.setItem('playerId', socket.id || '');
  });
}

export function joinGame(id: string, name: string): void {
  socket.emit('joinGame', { gameId: id, playerName: name || 'Player' });
  // Save player ID to localStorage to identify the player later
  socket.on('connect', () => {
    localStorage.setItem('playerId', socket.id || '');
  });
}

export function makeMove(index: number): void {
  let currentSymbol: 'X' | 'O' | null = null;
  playerSymbol.subscribe(value => {
    currentSymbol = value;
  })();
  
  let currentGameId: string | null = null;
  gameId.subscribe(value => {
    currentGameId = value;
  })();
  
  if (currentSymbol && currentGameId) {
    socket.emit('makeMove', { 
      gameId: currentGameId, 
      index, 
      symbol: currentSymbol 
    } as MovePayload);
  }
}