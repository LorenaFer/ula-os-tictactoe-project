<script lang="ts">
    import { board, currentTurn, playerSymbol, gameStatus, winner, makeMove, playerName, opponentName } from '$lib/sockets';
  
    function handleClick(index: number): void {
      if ($gameStatus === 'playing' && $currentTurn === $playerSymbol && $board[index] === null) {
        makeMove(index);
      }
    }
  
    function getPlayerBySymbol(symbol: 'X' | 'O' | null): string {
      if (symbol === $playerSymbol) {
        return $playerName || 'You';
      } else {
        return $opponentName || 'Opponent';
      }
    }
  </script>
  
  <div class="game-container">
    <div class="game-info">
      {#if $gameStatus === 'waiting'}
        <p>Waiting for another player to join...</p>
      {:else if $gameStatus === 'playing'}
        <p>Turn: <strong>{getPlayerBySymbol($currentTurn)}</strong> ({$currentTurn})</p>
        {#if $currentTurn === $playerSymbol}
          <p class="your-turn">It's your turn!</p>
        {:else}
          <p>Waiting for {$opponentName || 'opponent'} to make a move...</p>
        {/if}
      {:else if $gameStatus === 'finished'}
        {#if $winner === $playerSymbol}
          <p class="win-message">You won! ��</p>
        {:else if $winner === null}
          <p>It's a draw!</p>
        {:else}
          <p>{$opponentName || 'Opponent'} won.</p>
        {/if}
      {/if}
    </div>
  
    <div class="board">
      {#each $board as cell, index}
        <button 
          class="cell"
          disabled={$gameStatus !== 'playing' || $currentTurn !== $playerSymbol || $board[index] !== null}
          on:click={() => handleClick(index)}
        >
          {cell || ''}
        </button>
      {/each}
    </div>
  </div>
  
  <style>
    .game-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 2rem;
    }
  
    .game-info {
      margin-bottom: 1rem;
      text-align: center;
      padding: 1rem;
      background-color: #f8f8f8;
      border-radius: 4px;
      width: 100%;
      max-width: 310px;
    }
  
    .your-turn {
      color: #4a90e2;
      font-weight: bold;
    }
  
    .win-message {
      color: #2ecc71;
      font-weight: bold;
    }
  
    .board {
      display: grid;
      grid-template-columns: repeat(3, 100px);
      grid-template-rows: repeat(3, 100px);
      gap: 5px;
    }
  
    .cell {
      width: 100px;
      height: 100px;
      font-size: 2.5rem;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f0f0f0;
      border: none;
      cursor: pointer;
    }
  
    .cell:disabled {
      cursor: default;
    }
  
    .cell:not(:disabled):hover {
      background-color: #e0e0e0;
    }
  </style>