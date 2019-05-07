<template>
  <div class="quip-sweeper">
    <div class="sweeper-header">Game Time: {{timer}}, difficulty: {{difficulty}}</div>
    <quip-sweeper
      :height="height"
      :width="width"
      :board="board"
      @click="handleBoardClick"
    >
    </quip-sweeper>
    <div
      class="sweeper-status"
      v-if="bestTime > 0"
    >
      Your best time on {{difficulty}} level is {{bestTime}} seconds.
    </div>
    <div
      class="sweeper-status"
      v-if="state === 'boom'"
    >
      You triggered a mine!
    </div>
    <div
      class="sweeper-status"
      v-if="state === 'won'"
    >
      You won!
    </div>
  </div>
</template>

<script>
import QuipSweeper from "./quip-sweeper/QuipSweeper.vue";

const BOARD_CONFIG = {
  easy: {
    height: 9,
    width: 9,
    count: 10
  },
  medium: {
    height: 16,
    width: 16,
    count: 40
  },
  hard: {
    height: 24,
    width: 24,
    count: 99
  }
};

export default {
  components: {
    QuipSweeper
  },
  props: ["isCreation"],
  data: function() {
    return {
      height: 9,
      width: 9,
      board: [],
      state: "playing",
      difficulty: "easy",
      timer: 0,
      bestTime: 0
    };
  },
  created: function() {
    quip.apps.updateToolbar({
      toolbarCommandIds: [quip.apps.DocumentMenuCommands.MENU_MAIN],
      highlightedCommandIds: ["sweeper-easy"],
      menuCommands: [
        {
          id: quip.apps.DocumentMenuCommands.MENU_MAIN,
          subCommands: [
            "sweeper-easy",
            "sweeper-medium",
            "sweeper-hard",
            quip.apps.DocumentMenuCommands.SEPARATOR,
            "sweeper-restart"
          ]
        },
        {
          id: "sweeper-easy",
          label: "Easy",
          handler: () => {
            this.difficulty = "easy";
            this.updateMenu();
            this.resetBoard();
          }
        },
        {
          id: "sweeper-medium",
          label: "Medium",
          handler: () => {
            this.difficulty = "medium";
            this.updateMenu();
            this.resetBoard();
          }
        },
        {
          id: "sweeper-hard",
          label: "Hard",
          handler: () => {
            this.difficulty = "hard";
            this.updateMenu();
            this.resetBoard();
          }
        },
        {
          id: "sweeper-restart",
          label: "Restart",
          handler: () => {
            this.resetBoard();
          }
        }
      ]
    });

    this.resetBoard();
  },
  methods: {
    updateMenu: function() {
      quip.apps.updateToolbar({
        highlightedCommandIds: [`sweeper-${this.difficulty}`]
      });
    },
    resetBoard: function() {
      this.height = BOARD_CONFIG[this.difficulty].height;
      this.width = BOARD_CONFIG[this.difficulty].width;
      let mineMax = BOARD_CONFIG[this.difficulty].count;

      this.timer = 0;
      if (this.interval) {
        clearInterval(this.interval);
      }
      this.interval = setInterval(() => {
        this.timer++;
      }, 1000);

      this.board = new Array(this.height * this.width);
      this.board.fill("0");

      const mines = [];
      while (true) {
        const row = Math.floor(Math.random() * this.height);
        const col = Math.floor(Math.random() * this.width);
        const index = row * this.width + col;
        if (this.board[index] !== "X") {
          this.board[index] = "X";
          mines.push({
            row: row,
            col: col,
            index: index
          });
          if (mines.length >= mineMax) {
            break;
          }
        }
      }

      for (let i = 0; i < mines.length; ++i) {
        const { row, col, index } = mines[i];
        let mineCount = 0;
        for (let i = row - 1; i <= row + 1; ++i) {
          if (i < 0 || i >= this.height) {
            continue;
          }

          for (let j = col - 1; j <= col + 1; ++j) {
            if (j < 0 || j >= this.width) {
              continue;
            }

            if (i == row && j == col) {
              continue;
            }

            let cellIndex = i * this.width + j;
            if (this.board[cellIndex] !== "X") {
              const mineCount = Number(this.board[cellIndex] || 0);
              this.board[cellIndex] = String(mineCount + 1);
            }
          }
        }
      }

      const preferences = quip.apps.getUserPreferences();
      if (preferences) {
        let bestTime =
          preferences.getForKey(`best-time-${this.difficulty}`) || 0;
        if (bestTime) {
          this.bestTime = Number(bestTime);
        } else {
          this.bestTime = 0;
        }
      } else {
        this.bestTime = 0;
      }

      this.state = "playing";
    },
    handleBoardClick: function($event) {
      if (this.state !== "playing") {
        return;
      }

      const cell = this.board[$event.index];
      if (cell.endsWith("-")) {
        return;
      }

      switch (cell) {
        case "X":
          this.loseGame();
          break;
        default:
          this.revealCell($event.row, $event.col);
          this.board = Array.from(this.board);
          if (!this.board.find(item => item !== "X" && !item.endsWith("-"))) {
            this.winGame();
          }
          break;
      }
    },
    revealCell: function(row, col) {
      const index = row * this.width + col;

      if (
        this.board[index] === "X" ||
        this.board[index] === "*" ||
        this.board[index].endsWith("-")
      ) {
        return;
      }

      this.board[index] = this.board[index] + "-";
      if (this.board[index].startsWith("0")) {
        for (let i = row - 1; i <= row + 1; ++i) {
          if (i < 0 || i >= this.height) {
            continue;
          }
          for (let j = col - 1; j <= col + 1; ++j) {
            if (j < 0 || j >= this.width) {
              continue;
            }

            if (i == row && j == col) {
              continue;
            }
            this.revealCell(i, j);
          }
        }
      }
    },
    revealBoard: function() {
      for (let i = 0; i < this.board.length; ++i) {
        if (this.board[i] === "X") {
          this.board[i] = "*";
        } else if (!this.board[i].endsWith("-")) {
          this.board[i] = this.board[i] + "-";
        }
      }
      this.board = Array.from(this.board);
    },
    loseGame: function() {
      this.state = "boom";
      this.endGame();
    },
    winGame: function() {
      this.state = "won";
      this.endGame();
      if (this.bestTime == 0 || this.timer < this.bestTime) {
        this.bestTime = this.timer;
        const preferences = quip.apps.getUserPreferences();
        if (preferences) {
          const values = {};
          values[`best-time-${this.difficulty}`] = String(this.timer);
          preferences.save(values);
        }
      }
    },
    endGame: function() {
      if (this.interval) {
        clearInterval(this.interval);
      }
      this.revealBoard();
    }
  }
};
</script>


<style scoped lang="less">
.quip-sweeper {
  div {
    margin: 0.5rem 0;
  }

  .sweeper-status {
    text-align: center;
  }
}
</style>

