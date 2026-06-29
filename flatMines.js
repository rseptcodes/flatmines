const mainConfig = {
	init(){
		boardState.createBoard(12);
    tilesManager.initTiles(boardState.board);
	}
};
const eventBus = {
	
}
const boardState = {
	board: [],
	size: 0,
	totalTiles: 0,
	createBoard(number){
		this.size = number;
		this.totalTiles = number * number;
		this.board = Array(this.totalTiles).fill(0);
		
		let bombsPlaced = 0;
		let bombsCount = Math.floor(this.totalTiles * 0.20);
		
		while (bombsPlaced < bombsCount) {
	  const randomIndex = Math.floor(Math.random() * this.totalTiles);

	  if (this.board[randomIndex] === 0) {
    this.board[randomIndex] = -1;
    const adjacentTiles = this.getAdjacentTiles(this.board, randomIndex);
    this.addBombNumbers(this.board, adjacentTiles);
    bombsPlaced++;
   }
}
		},
	  getAdjacentTiles(board, center) {
    const row = Math.floor(center / this.size);
    const col = center % this.size;
    let adjacentTiles = [];

    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
        for (let colOffset = -1; colOffset <= 1; colOffset++) {
            const newRow = row + rowOffset;
            const newCol = col + colOffset;
            if (
                newRow < 0 ||
                newRow >= this.size ||
                newCol < 0 ||
                newCol >= this.size
            ) {
                continue;
            }

            const index = newRow * this.size + newCol;

            if (board[index] === -1) continue;

            adjacentTiles.push({
            index,
            value: board[index],
}); // talvez eu precise do value
        }
    }
    return adjacentTiles;
},
    addBombNumbers(board, tiles){
    	for(let i = 0; i < tiles.length; i++){
    		const index = tiles[i].index;
    		board[index]++;
    	}
    },
};
const tilesManager = {
	tilesArray: [],
	createTiles(array, local, number, index){
		const tile = helperFunctions.createElement("button",local, "tiles");
		const isBomb = number < 0;
	  helperFunctions.createIcon(tile, "fa-flag");
		
     helperFunctions.setupDesktopInput(tile, () => { this.revealTile(array, index); }, () => { this.toggleMarkedTile(array, index); });

		
		array.push({index: index, isRevealed: false, isBomb ,isMarked: false, element: tile, number});
		this.renderTile(array, index);
	},
	revealTile(array, index){
    if (array[index].isRevealed) return;

    array[index].isRevealed = true;
    this.renderTile(array, index);

    if (boardState.board[index] === 0){
        const adjacentTiles = boardState.getAdjacentTiles(boardState.board, index);

        for(let i = 0; i < adjacentTiles.length; i++){
            this.revealTile(array, adjacentTiles[i].index);
        }
    }
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
  toggleMarkedTile(array, index){
    if (array[index].isRevealed) return;

    array[index].isMarked = !array[index].isMarked;
    this.renderTile(array, index);
},
	initTiles(board){
		const boardElement = document.getElementById("board");
		const size = Math.sqrt(board.length);
		
		boardElement.style.setProperty("--board-size", size);
		for (let i = 0; i < board.length; i++){
			const number = board[i];
			this.createTiles(this.tilesArray, boardElement, number, i);
		}
	}
};

const ui = {
	// so UI
};

//fazer ia depois q joga na melhor posicao e outra q poe bomba em alguma posicao
//deixar bem feito dps

const helperFunctions = {
	createElement(tipo, local, classe){
	const nome = document.createElement(tipo);
	nome.classList.add(classe);
  local.appendChild(nome);
  return nome;
},
createButton(local, classe, FAName){
	const button = this.createElement("button", local, classe);
	if(FAName) {
		const icon = this.createElement("i", button, FAName);
		icon.classList.add("fa");
	}
	return button;
},
createIcon(local, FAName){
		const icon = this.createElement("i", local, FAName);
		icon.classList.add("fa");
		return icon;
},
setupDesktopInput(element, callback, rightClickCallback) {
    element.addEventListener("click", () => {
        callback();
    });

    element.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        rightClickCallback();
    });
},
setupMobileInput(element, callback, longCallback) {
	// funcao redundante mas pode ser util futuramente
    let isLongpress = false; 
    let pressTimeout;
    element.addEventListener("touchstart", () => {
        isLongpress = false;
        pressTimeout = setTimeout(() => {
            isLongpress = true;
        }, 1000);
    });

    element.addEventListener("touchend", () => {
        if (isLongpress) {
            longCallback();
        } else {
            callback();
            clearTimeout(pressTimeout);
        }
    });

    element.addEventListener("touchcancel", () => {
        clearTimeout(pressTimeout);
    });
}


};
mainConfig.init();