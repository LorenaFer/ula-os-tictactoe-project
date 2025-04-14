<script lang="ts">
    import { onMount } from 'svelte';
    import TicTacToe from '$lib/components/TicTacToe.svelte';
    import { createGame, joinGame, gameId, error, playerName, opponentName, playerSymbol, players } from '$lib/sockets';
    
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

    // Function to get player 1 (X) and player 2 (O) information
    function getPlayersInfo() {
      if ($players.length === 0) return { player1: $playerName, player2: $opponentName };
      
      const player1 = $players.find(p => p.symbol === 'X');
      const player2 = $players.find(p => p.symbol === 'O');
      
      return {
        player1: player1?.name || $playerName,
        player2: player2?.name || $opponentName
      };
    }
  </script>
  
  <main>
    <h1>Tic Tac Toe</h1>
  
    {#if $error}
      <div class="error">
        <p>{$error}</p>
      </div>
    {/if}
  
    {#if !$gameId}
      <div class="game-options">
        <div class="option create-game">
          <h2>Create a Game</h2>
          <div class="option-content">
            <input 
              type="text" 
              id="playerName"
              bind:value={playerNameInput} 
              placeholder="Your Name"
              class="name-input"
            />
            <button class="primary-button" on:click={handleCreateGame}>
              <span class="icon">+</span>
              Create New Game
            </button>
          </div>
        </div>
        
        <div class="option-divider">
          <span class="divider-text">or</span>
        </div>
        
        <div class="option join-game">
          <h2>Join a Game</h2>
          <div class="option-content">
            <input 
              type="text" 
              bind:value={gameIdInput} 
              placeholder="Game ID"
              class="code-input"
            />
            <input 
              type="text" 
              bind:value={playerNameInput} 
              placeholder="Your Name"
              class="name-input"
            />
            <button class="secondary-button" on:click={handleJoinGame}>
              <span class="icon">→</span>
              Join Game
            </button>
          </div>
        </div>
      </div>
    {:else}
      {@const { player1, player2 } = getPlayersInfo()}
      <div class="game-wrapper">
        <div class="game-info">
          <div class="game-id">
            <p>Game ID</p>
            <h2>{$gameId}</h2>
            <p class="instructions">Share this ID with a friend</p>
          </div>
          
          <div class="players-info">
            <div class="player player-1">
              <p class="label">Player 1</p>
              <p class="name">{player1 || 'Player'}</p>
            </div>
            
            {#if player2}
              <div class="versus">vs</div>
              <div class="player player-2">
                <p class="label">Player 2</p>
                <p class="name">{player2}</p>
              </div>
            {/if}
          </div>
        </div>
        
        <TicTacToe />
      </div>
    {/if}
  </main>
  
  <style>
    :root {
      --color-blue-50: #eff3ff;
      --color-blue-100: #dbe4fe;
      --color-blue-200: #c0d1fd;
      --color-blue-300: #94b4fc;
      --color-blue-400: #5d89f8;
      --color-blue-500: #3d65f4;
      --color-blue-600: #2744e9;
      --color-blue-700: #1f31d6;
      --color-blue-800: #202aad;
      --color-blue-900: #1f2a89;
      --color-blue-950: #181b53;
      
      --color-emerald-50: #ecfdf5;
      --color-emerald-100: #d1fae5;
      --color-emerald-200: #a7f3d0;
      --color-emerald-300: #6ee7b7;
      --color-emerald-400: #34d399;
      --color-emerald-500: #10b981;
      --color-emerald-600: #059669;
      --color-emerald-700: #047857;
      --color-emerald-800: #065f46;
      --color-emerald-900: #064e3b;
      --color-emerald-950: #022c22;
    }
    
    main {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
      text-align: center;
    }
  
    h1 {
      font-weight: 600;
      font-size: 2.5rem;
      letter-spacing: -0.02em;
      margin-bottom: 3rem;
      color: var(--color-blue-950);
    }
    
    h2 {
      font-weight: 600;
      font-size: 1.25rem;
      letter-spacing: -0.01em;
      margin: 0 0 1.5rem 0;
      color: #1d1d1f;
    }
  
    .error {
      background-color: #fff0f0;
      color: #ff3b30;
      padding: 0.75rem;
      margin-bottom: 1.5rem;
      border-radius: 10px;
      font-size: 0.9rem;
    }
    
    .game-options {
      display: flex;
      justify-content: center;
      align-items: stretch;
      gap: 0;
      margin-bottom: 2rem;
    }
    
    .option {
      flex: 1;
      padding: 2rem;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      max-width: 300px;
    }
    
    .option-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      height: 100%;
    }
    
    .create-game {
      background-color: var(--color-blue-50);
      border: 1px solid var(--color-blue-100);
    }
    
    .join-game {
      background-color: var(--color-emerald-50);
      border: 1px solid var(--color-emerald-100);
    }
    
    .option-divider {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      position: relative;
    }
    
    .divider-text {
      width: 40px;
      height: 40px;
      background: white;
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #86868b;
      font-size: 0.9rem;
      z-index: 2;
    }
    
    .option-divider::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 50%;
      width: 1px;
      background-color: rgba(0, 0, 0, 0.1);
      z-index: 1;
    }
  
    input {
      padding: 1rem;
      font-size: 1rem;
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 10px;
      transition: all 0.2s ease;
      background-color: white;
      color: #1d1d1f;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    .name-input:focus {
      outline: none;
      border-color: var(--color-blue-400);
      box-shadow: 0 0 0 4px rgba(93, 137, 248, 0.1);
    }
    
    .code-input:focus {
      outline: none;
      border-color: var(--color-emerald-400);
      box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.1);
    }
    
    input::placeholder {
      color: #86868b;
    }
  
    button {
      padding: 1rem;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 500;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .icon {
      font-size: 1.2rem;
      font-weight: 600;
    }
    
    .primary-button {
      background-color: var(--color-blue-500);
      color: white;
      margin-top: auto;
    }
    
    .primary-button:hover {
      background-color: var(--color-blue-600);
    }
    
    .secondary-button {
      background-color: var(--color-emerald-500);
      color: white;
      margin-top: auto;
    }
    
    .secondary-button:hover {
      background-color: var(--color-emerald-600);
    }
    
    .game-wrapper {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      gap: 2rem;
      margin: 0 auto;
    }
    
    .game-info {
      text-align: left;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      min-width: 200px;
    }
    
    .game-id {
      padding: 1.5rem;
      background-color: #f5f5f7;
      border-radius: 12px;
      text-align: center;
    }
    
    .game-id p {
      margin: 0;
      color: #86868b;
      font-size: 0.9rem;
    }
    
    .instructions {
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }
  
    .players-info {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1.25rem;
    }
    
    .player {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 1rem;
      border-radius: 10px;
    }
    
    .player-1 {
      background-color: var(--color-blue-50);
      border-left: 4px solid var(--color-blue-500);
    }
    
    .player-2 {
      background-color: var(--color-emerald-50);
      border-left: 4px solid var(--color-emerald-500);
    }
    
    .label {
      color: #86868b;
      font-size: 0.85rem;
      margin: 0;
    }
    
    .name {
      font-weight: 500;
      margin: 0;
    }
    
    .player-1 .name {
      color: var(--color-blue-700);
    }
    
    .player-2 .name {
      color: var(--color-emerald-700);
    }
    
    .versus {
      text-align: center;
      padding: 0.25rem 0;
      color: #86868b;
      font-size: 0.9rem;
    }
    
    /* Mobile responsive adjustments */
    @media (max-width: 768px) {
      .game-options {
        flex-direction: column;
        align-items: center;
      }
      
      .option {
        max-width: 100%;
        width: 100%;
      }
      
      .option-divider {
        height: 60px;
        width: 100%;
      }
      
      .option-divider::before {
        width: 100%;
        height: 1px;
        left: 0;
        top: 50%;
      }
      
      .game-wrapper {
        flex-direction: column;
        align-items: center;
      }
      
      .game-info {
        width: 100%;
      }
    }
  </style>