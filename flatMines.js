const mainConfig = {
	init(){
		eventBus.subscribe("init", () => {
			boardState.createBoard(12);
      tilesManager.initTiles(boardState.board);
			timeManager.reset();
			timeManager.start();
			flagCountManager.resetCount();
			streakManager.init();
		});
		eventBus.subscribe("tileMarked", () => {
		    flagCountManager.useFlag();
		});
		eventBus.subscribe("reset", () => {
			boardState.resetBoard(12);
      tilesManager.resetTiles(boardState.board);
      timeManager.reset();
			timeManager.start();
			flagCountManager.resetCount();
		});
		eventBus.subscribe("tileUnmarked", () => {
		    flagCountManager.returnFlag();
		});
		eventBus.subscribe("playerWin", () => {
			streakManager.addStreak();
		});
		eventBus.subscribe("gameOver", () => {
			tilesManager.revealAllBombs();
			timeManager.stop();
			streakManager.resetStreak();
		});
		ui.setResetListener();
    eventBus.update("init");
	}
};
const eventBus = {
	subs: [],
	subscribe(listening, callback){
		this.subs.push({listening, callback});
	},
	unsubscribe(listening, callback){
		this.subs = this.subs.filter(
    n => !(n.callback === callback && n.listening === listening)
  );
	},
	update(listening){
		this.subs.forEach(n => {
    n.listening === listening && n.callback();
});
//tileRevealed, isBomb, gameOver
	},
};
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
	resetBoard(number){
		this.board = [];
		this.createBoard(number);
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
	resetTiles(board){
		this.tilesArray = [];
	  this.initTiles(board);
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
    } else if (boardState.board[index] < 0){
    	eventBus.update("gameOver");
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
async toggleMarkedTile(array, index){
    if (array[index].isRevealed) return;

    array[index].isMarked = !array[index].isMarked;
    if(array[index].isMarked){
    	eventBus.update("tileMarked");
    } else {
    	eventBus.update("tileUnmarked");
    }
    this.renderTile(array, index);
    await helperFunctions.applyTempClass(array[index].element, "tiles--flagPop");
},
revealAllBombs() {
    this.tilesArray.forEach(async tile => {
        if (!tile.isBomb) return;

        await helperFunctions.applyTempClass(tile.element, "tiles--explode");

        tile.isRevealed = true;
        this.renderTile(this.tilesArray, tile.index);
    });
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

const ui = {
    time: document.getElementById("score-time"),
    flags: document.getElementById("score-flags"),
    streak: document.getElementById("score-streak"),
    resetBtn: document.getElementById("resetBtn"),

    setTime(value) {
        this.time.textContent = value;
    },

    setFlags(value) {
        this.flags.textContent = value;
    },

    setStreak(value) {
        this.streak.textContent = value;
    },
    setResetListener(){
    	this.resetBtn.addEventListener("click", () => {
    		eventBus.update("reset");
    	})
    }
};
const flagCountManager = {
    maxFlags: 20,
    flagsCount: 20,

    useFlag() {
        if (this.flagsCount <= 0) return;

        this.flagsCount--;
        ui.setFlags(this.flagsCount);
    },

    returnFlag() {
        if (this.flagsCount >= this.maxFlags) return;

        this.flagsCount++;
        ui.setFlags(this.flagsCount);
    },

    resetCount() {
        this.flagsCount = this.maxFlags;
        ui.setFlags(this.flagsCount);
    }
};
const streakManager = {
    streak: 0,

    init() {
        const saved = localStorage.getItem("streak");
        this.streak = saved ? Number(saved) : 0;
        ui.setStreak(this.streak);
    },

    addStreak() {
        this.streak++;
        localStorage.setItem("streak", this.streak);
        ui.setStreak(this.streak);
    },

    resetStreak() {
        this.streak = 0;
        localStorage.setItem("streak", this.streak);
        ui.setStreak(this.streak);
    }
};
const timeManager = {
    startTime: 0,
    running: false,
    animationId: 0,

    start() {
        if (this.running) return;

        this.running = true;
        this.startTime = performance.now();

        const update = () => {
            if (!this.running) return;

            const seconds = Math.floor((performance.now() - this.startTime) / 1000);
            ui.setTime(seconds);

            this.animationId = requestAnimationFrame(update);
        };

        update();
    },

    stop() {
        this.running = false;
        cancelAnimationFrame(this.animationId);
    },

    reset() {
        this.stop();
        ui.setTime(0);
    }
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
applyTempClass(element, className, callback){
	if(!element) return;
	const onEnd = () => {
		element.classList.remove(className);
		element.removeEventListener("animationend", onEnd);
		if(callback) callback();
	};
	element.addEventListener("animationend", onEnd);
	element.classList.add(className);
	void element.offsetWidth;
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