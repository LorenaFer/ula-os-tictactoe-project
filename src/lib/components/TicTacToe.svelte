<script lang="ts">
    import { board, currentTurn, playerSymbol, gameStatus, winner, makeMove, playerName, opponentName, players } from '$lib/sockets';
  
    function handleClick(index: number): void {
      if ($gameStatus === 'playing' && $currentTurn === $playerSymbol && $board[index] === null) {
        makeMove(index);
      }
    }
  
    function getPlayerBySymbol(symbol: 'X' | 'O' | null): string {
      // Find the player with the matching symbol from the players store
      const player = $players.find(p => p.symbol === symbol);
      
      if (player) {
        if (player.symbol === $playerSymbol) {
          return $playerName || 'You';
        } else {
          return player.name || 'Opponent';
        }
      }
      
      // Fallback if player not found
      return symbol === $playerSymbol ? ($playerName || 'You') : ($opponentName || 'Opponent');
    }
    
    function getCellClass(index: number): string {
      const cell = $board[index];
      let classes = 'cell';
      
      if (cell === 'X') classes += ' x-cell';
      if (cell === 'O') classes += ' o-cell';
      
      if ($gameStatus === 'finished' && $winner) {
        // Highlight winning cells
        const winningCombinations = [
          [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
          [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
          [0, 4, 8], [2, 4, 6]             // diagonals
        ];
        
        const winningCombo = winningCombinations.find(combo => 
          $board[combo[0]] === $winner && 
          $board[combo[1]] === $winner && 
          $board[combo[2]] === $winner
        );
        
        if (winningCombo && winningCombo.includes(index)) {
          classes += ' winning-cell';
          
          // Add specific winner class based on who won
          if ($winner === $playerSymbol) {
            classes += ' user-win';
          } else {
            classes += ' opponent-win';
          }
        }
      }
      
      return classes;
    }
  </script>
  
  <div class="game-container">
    <div class="game-status">
      {#if $gameStatus === 'waiting'}
        <div class="status waiting">
          <div class="pulse"></div>
          <p>Waiting for opponent...</p>
        </div>
      {:else if $gameStatus === 'playing'}
        <div class="status playing">
          <div class="player-turn">
            <span class="turn-symbol {$currentTurn === 'X' ? 'x-symbol' : 'o-symbol'}">{$currentTurn}</span>
            <div class="turn-info">
              <span class="turn-label">{getPlayerBySymbol($currentTurn)}'s turn</span>
              {#if $currentTurn === $playerSymbol}
                <p class="your-turn">Tap a square to make your move</p>
              {:else}
                <p class="opponent-turn">Waiting for move...</p>
              {/if}
            </div>
          </div>
        </div>
      {:else if $gameStatus === 'finished'}
        {#if $winner === $playerSymbol}
          <div class="status finished win">
            <p class="win-message">You won!</p>
          </div>
        {:else if $winner === null}
          <div class="status finished draw">
            <p class="draw-message">It's a draw</p>
          </div>
        {:else}
          <div class="status finished lose">
            <div class="lose-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.59-13L12 10.59 8.41 7 7 8.41 10.59 12 7 15.59 8.41 17 12 13.41 15.59 17 17 15.59 13.41 12 17 8.41z"/>
              </svg>
            </div>
            <p class="lose-message">{getPlayerBySymbol($winner)} won</p>
          </div>
        {/if}
      {/if}
    </div>
  
    <div class="board">
      {#each $board as cell, index (index)}
        <button 
          class={getCellClass(index)}
          disabled={$gameStatus !== 'playing' || $currentTurn !== $playerSymbol || $board[index] !== null}
          on:click={() => handleClick(index)}
          aria-label={`Cell ${index + 1}`}
        >
          {#if cell === 'X'}
            <div class="x-mark">
              <div class="x-line x-line-1"></div>
              <div class="x-line x-line-2"></div>
            </div>
          {:else if cell === 'O'}
            <div class="o-mark"></div>
          {/if}
        </button>
      {/each}
    </div>
  </div>
  
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
      
      --color-red-50: #fef2f2;
      --color-red-100: #fee2e2;
      --color-red-200: #fecaca;
      --color-red-300: #fca5a5;
      --color-red-400: #f87171;
      --color-red-500: #ef4444;
      --color-red-600: #dc2626;
      --color-red-700: #b91c1c;
      --color-red-800: #991b1b;
      --color-red-900: #7f1d1d;
      --color-red-950: #450a0a;
    }

    .game-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
    }
  
    .game-status {
      width: 100%;
      margin-bottom: 1.5rem;
    }
    
    .status {
      padding: 1.25rem;
      border-radius: 14px;
      background-color: #f5f5f7;
      transition: all 0.3s ease;
    }
    
    .status.waiting {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }
    
    .status.finished {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 1.5rem;
    }
    
    .status.win {
      background-color: var(--color-blue-50);
      border: 1px solid var(--color-blue-100);
      box-shadow: 0 2px 12px rgba(93, 137, 248, 0.1);
    }
    
    .status.draw {
      background-color: #f5f5f7;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }
    
    .status.lose {
      background-color: var(--color-red-50);
      border: 1px solid var(--color-red-100);
      box-shadow: 0 2px 12px rgba(239, 68, 68, 0.1);
    }
    
    .lose-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-red-500);
    }
    
    .pulse {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background-color: var(--color-blue-400);
      box-shadow: 0 0 0 0 rgba(93, 137, 248, 0.7);
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(93, 137, 248, 0.7);
      }
      
      70% {
        transform: scale(1);
        box-shadow: 0 0 0 10px rgba(93, 137, 248, 0);
      }
      
      100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(93, 137, 248, 0);
      }
    }
    
    .status.playing {
      background-color: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(0, 0, 0, 0.05);
    }
    
    .player-turn {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .turn-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    
    .turn-symbol {
      font-weight: 700;
      font-size: 2rem;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
    }
    
    .x-symbol {
      color: var(--color-blue-700);
      background-color: var(--color-blue-50);
    }
    
    .o-symbol {
      color: var(--color-emerald-700);
      background-color: var(--color-emerald-50);
    }
    
    .turn-label {
      font-weight: 500;
      color: #1d1d1f;
    }
  
    .your-turn {
      color: var(--color-blue-500);
      font-size: 0.9rem;
      margin: 0.25rem 0 0;
    }
    
    .opponent-turn {
      color: #86868b;
      font-size: 0.9rem;
      margin: 0.25rem 0 0;
    }
    
    .win-message {
      color: var(--color-blue-700);
      font-weight: 600;
      font-size: 1.25rem;
      margin: 0;
    }
    
    .draw-message {
      color: var(--color-blue-900);
      font-weight: 600;
      font-size: 1.25rem;
      margin: 0;
    }
    
    .lose-message {
      color: var(--color-red-700);
      font-weight: 600;
      font-size: 1.25rem;
      margin: 0;
    }
  
    .board {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: 8px;
      width: 100%;
      max-width: 400px;
      aspect-ratio: 1/1;
    }
  
    .cell {
      aspect-ratio: 1/1;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f7;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
      padding: 0;
    }
    
    .cell:disabled {
      cursor: default;
    }
    
    .cell:not(:disabled):hover {
      background-color: #ebebeb;
    }
    
    .cell:not(:disabled):active {
      transform: scale(0.97);
    }
    
    /* X mark styling */
    .x-mark {
      position: relative;
      width: 60%;
      height: 60%;
    }
    
    .x-line {
      position: absolute;
      top: 50%;
      left: 0;
      width: 100%;
      height: 4px;
      background-color: var(--color-blue-600);
      border-radius: 2px;
    }
    
    .x-line-1 {
      transform: translateY(-50%) rotate(45deg);
    }
    
    .x-line-2 {
      transform: translateY(-50%) rotate(-45deg);
    }
    
    /* O mark styling */
    .o-mark {
      width: 60%;
      height: 60%;
      border: 4px solid var(--color-emerald-500);
      border-radius: 50%;
    }
    
    .x-cell {
      background-color: var(--color-blue-50);
    }
    
    .o-cell {
      background-color: var(--color-emerald-50);
    }
    
    .winning-cell.x-cell {
      background-color: var(--color-blue-100);
      animation: highlight-x 1.5s ease-in-out;
    }
    
    .winning-cell.o-cell {
      background-color: var(--color-emerald-100);
      animation: highlight-o 1.5s ease-in-out;
    }
    
    .winning-cell.opponent-win {
      animation: highlight-opponent-win 1.5s ease-in-out;
    }
    
    @keyframes highlight-x {
      0%, 100% {
        background-color: var(--color-blue-100);
      }
      50% {
        background-color: var(--color-blue-200);
      }
    }
    
    @keyframes highlight-o {
      0%, 100% {
        background-color: var(--color-emerald-100);
      }
      50% {
        background-color: var(--color-emerald-200);
      }
    }
    
    @keyframes highlight-opponent-win {
      0%, 100% {
        background-color: var(--color-red-100);
      }
      50% {
        background-color: var(--color-red-200);
      }
    }
    
    /* Cell size adjustments for larger screens */
    @media (min-width: 768px) {
      .board {
        max-width: 450px;
      }
      
      .x-line {
        height: 6px;
        border-radius: 3px;
      }
      
      .o-mark {
        border-width: 6px;
      }
    }
  </style>