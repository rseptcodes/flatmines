import { boardState } from "./boardState.js";
import { eventBus } from "./main.js";
import { helperFunctions } from "./helperFunctions.js";

export const tilesManager = {
	tilesArray: [],
	gameEnded: null,
	setGameState(gameEnded){
		this.gameEnded = gameEnded;
	},
	createTiles(array, local, number, index){
		const tile = helperFunctions.createElement("button",local, "tiles");
    tile.dataset.value = (number >= 5) ? "high" : number;
    
		const isBomb = number < 0;
	  helperFunctions.createIcon(tile, "fa-flag");
		
     helperFunctions.setupDesktopInput(tile, () => { this.revealTile(array, index); }, () => { this.toggleMarkedTile(array, index); });

		
		array.push({index: index, isRevealed: false, isBomb ,isMarked: false, element: tile, number});
		this.renderTile(array, index);
	},
	resetTiles(board){
		this.tilesArray = [];
	  this.initTiles(board);
	},
	revealTile(array, index){
		if(this.gameEnded) return;
    if (array[index].isRevealed || array[index].isMarked) return;

    array[index].isRevealed = true;
    
    this.renderTile(array, index);

    if (boardState.board[index] === 0){
        const adjacentTiles = helperFunctions.getAdjacentTiles(boardState.board, index, boardState.size);

        for(let i = 0; i < adjacentTiles.length; i++){
            this.revealTile(array, adjacentTiles[i].index);
        }
    } else if (boardState.board[index] < 0){
    	eventBus.update("gameOver");
    }
    this.verifyEmptySpaces(array);
},
  renderTile(array, index){
    const tile = array[index];

    tile.element.innerHTML = "";
    tile.element.classList.toggle("tiles--open", tile.isRevealed);
    tile.element.classList.toggle("tiles--hasFlag", tile.isMarked);
    tile.element.classList.toggle("tiles--bomb", tile.isBomb && tile.isRevealed);
    

    if (!tile.isRevealed) {
        if (tile.isMarked) {
            helperFunctions.createIcon(tile.element, "fa-flag");
        }
        return;
    }

    if (tile.isBomb) {
        helperFunctions.createIcon(tile.element, "fa-bomb");
        return;
    }

    if (tile.number > 0) {
        tile.element.innerText = tile.number;
    }
},
  async toggleMarkedTile(array, index) {
    if (array[index].isMarked) {
        await this.unmarkTile(array, index);
    } else {
        await this.markTile(array, index);
    }
},

async markTile(array, index) {
    if (array[index].isRevealed) return;
    if (array[index].isMarked) return;

    array[index].isMarked = true;

    eventBus.update("tileMarked");

    this.renderTile(array, index);
    await helperFunctions.applyTempClass(
        array[index].element,
        "tiles--flagPop"
    );
},

async unmarkTile(array, index) {
    if (array[index].isRevealed) return;
    if (!array[index].isMarked) return;

    array[index].isMarked = false;

    eventBus.update("tileUnmarked");

    this.renderTile(array, index);
    await helperFunctions.applyTempClass(
        array[index].element,
        "tiles--flagPop"
    );
},
  revealAllBombs() {
    this.tilesArray.forEach(async tile => {
        if (!tile.isBomb) return;

        await helperFunctions.applyTempClass(tile.element, "tiles--explode");

        tile.isRevealed = true;
        this.renderTile(this.tilesArray, tile.index);
    });
},
  verifyEmptySpaces(array) {
  if (!array.some(item => !item.isRevealed && !item.isBomb)) {
    eventBus.update("playerWin");
  }
  return;
},
	initTiles(board){
		const boardElement = document.getElementById("board");
		boardElement.innerHTML = "";
		const size = Math.sqrt(board.length);
		
		boardElement.style.setProperty("--board-size", size);
		for (let i = 0; i < board.length; i++){
			const number = board[i];
			this.createTiles(this.tilesArray, boardElement, number, i);
		}
	}
};