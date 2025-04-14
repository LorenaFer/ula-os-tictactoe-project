<script lang="ts">
    import { onMount } from 'svelte';
    import TicTacToe from '$lib/components/TicTacToe.svelte';
    import { createGame, joinGame, gameId, error, playerName, opponentName } from '$lib/sockets';
    
    let gameIdInput: string = '';
    let playerNameInput: string = '';
    
    function handleCreateGame(): void {
      if (playerNameInput) {
        createGame(playerNameInput);
      } else {
        alert('Please enter your name');
      }
    }
    
    function handleJoinGame(): void {
      if (gameIdInput && playerNameInput) {
        joinGame(gameIdInput, playerNameInput);
      } else {
        alert('Please enter your name and game ID');
      }
    }
  </script>
  
  <main>
    <h1>Tic Tac Toe en Tiempo Real</h1>
  
    {#if $error}
      <div class="error">
        <p>{$error}</p>
      </div>
    {/if}
  
    {#if !$gameId}
      <div class="game-setup">
        <div class="player-name">
          <label for="playerName">Your Name:</label>
          <input 
            type="text" 
            id="playerName"
            bind:value={playerNameInput} 
            placeholder="Enter your name"
          />
        </div>
        
        <button on:click={handleCreateGame}>Create New Game</button>
        
        <div class="join-game">
          <input 
            type="text" 
            bind:value={gameIdInput} 
            placeholder="Enter Game ID"
          />
          <button on:click={handleJoinGame}>Join Game</button>
        </div>
      </div>
    {:else}
      <div class="game-info">
        <p>Game ID: <strong>{$gameId}</strong></p>
        <p class="instructions">Share this ID with a friend so they can join your game</p>
        
        <div class="players-info">
          <p>You: <strong>{$playerName || 'Player'}</strong> {#if $opponentName}vs. <strong>{$opponentName}</strong>{/if}</p>
        </div>
      </div>
      
      <TicTacToe />
    {/if}
  </main>
  
  <style>
    main {
      max-width: 600px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }
  
    h1 {
      margin-bottom: 2rem;
    }
  
    .error {
      background-color: #ffeeee;
      color: red;
      padding: 0.5rem;
      margin-bottom: 1rem;
      border-radius: 4px;
    }
  
    .game-setup {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
  
    .player-name {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
  
    .join-game {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
  
    input {
      padding: 0.5rem;
      font-size: 1rem;
    }
  
    button {
      padding: 0.5rem 1rem;
      background-color: #4a90e2;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }
  
    button:hover {
      background-color: #357abD;
    }
  
    .game-info {
      margin-bottom: 1rem;
      padding: 1rem;
      background-color: #f0f0f0;
      border-radius: 4px;
    }
  
    .players-info {
      margin-top: 1rem;
      padding-top: 0.5rem;
      border-top: 1px solid #ddd;
    }
  
    .instructions {
      font-size: 0.9rem;
      color: #666;
    }
  </style>