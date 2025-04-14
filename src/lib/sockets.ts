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
export const players: Writable<Player[]> = writable([]);

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
  
  // Store playerId in localStorage
  localStorage.setItem('playerId', data.playerId);
  
  // Initialize players array with the current player
  players.set([
    { id: data.playerId, symbol: data.symbol, name: data.playerName }
  ]);
});

socket.on('gameJoined', (data: GameJoinedEvent) => {
  gameId.set(data.gameId);
  playerId.set(data.playerId);
  playerSymbol.set(data.symbol);
  board.set(data.board);
  
  // Store playerId in localStorage
  localStorage.setItem('playerId', data.playerId);
  
  // Update players store with all players
  players.set(data.players);
  
  // Set player and opponent names based on the current player ID
  updatePlayerNames(data.playerId, data.players);
  
  error.set(null);
});

socket.on('gameStarted', (data: GameStartedEvent) => {
  gameStatus.set('playing');
  currentTurn.set(data.game.currentTurn);
  
  // Update the players store
  players.set(data.game.players);
  
  // Get current player ID from store or localStorage
  let currentPlayerId: string | null = null;
  playerId.subscribe(value => {
    currentPlayerId = value;
  })();
  
  if (!currentPlayerId) {
    currentPlayerId = localStorage.getItem('playerId');
  }
  
  if (currentPlayerId) {
    // Update player and opponent names
    updatePlayerNames(currentPlayerId, data.game.players);
  }
});

// Helper function to update player and opponent names
function updatePlayerNames(currentPlayerId: string, gamePlayers: Player[]) {
  const currentPlayer = gamePlayers.find(p => p.id === currentPlayerId);
  const opponent = gamePlayers.find(p => p.id !== currentPlayerId);
  
  if (currentPlayer) {
    playerName.set(currentPlayer.name);
    playerSymbol.set(currentPlayer.symbol);
  }
  
  if (opponent) {
    opponentName.set(opponent.name);
  }
}

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
}

export function joinGame(id: string, name: string): void {
  socket.emit('joinGame', { gameId: id, playerName: name || 'Player' });
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