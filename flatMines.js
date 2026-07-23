const mainConfig = {
	gameEnded: false,
	init(){
		eventBus.subscribe("init", () => {
			boardState.createBoard(12);
      tilesManager.initTiles(boardState.board);
      decisionEngine.init(boardState.board);
			timeManager.reset();
			timeManager.start();
			flagCountManager.resetCount();
			streakManager.init();
		});
		eventBus.subscribe("timerInit", () => {
			ui.toggleAnimate(ui.time, "placar--timer", true);
		});
		eventBus.subscribe("timerStopped", () => {
			ui.toggleAnimate(ui.time, "placar--timer", false);
		});
		eventBus.subscribe("newStreak", () => {
			helperFunctions.applyTempClass(ui.streak, "placar--streak");
		});
		
		eventBus.subscribe("hideNumbers", () => {
			ui.toggleNumbersVisibility();
		});
		eventBus.subscribe("aiMove", () => {
			let move = decisionEngine.makeDecision(decisionEngine.knownTiles, tilesManager.tilesArray);
			tilesManager.revealTile(tilesManager.tilesArray, move);
		});
		eventBus.subscribe("aiMarked", () => {
			let tileMarked = decisionEngine.makeDecision(decisionEngine.knownTiles, tilesManager.tilesArray);
			tilesManager.markTile(tilesManager.tilesArray, tileMarked);
		});
		eventBus.subscribe("tileMarked", () => {
		    flagCountManager.useFlag();
		    helperFunctions.applyTempClass(ui.flags, "placar--marked");
		});
		eventBus.subscribe("reset", () => {
			this.gameEnded = false;
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
			this.gameEnded = true;
			streakManager.addStreak();
			tilesManager.revealAllBombs();
			timeManager.stop();
		});
		eventBus.subscribe("gameOver", () => {
			this.gameEnded = true;
			tilesManager.revealAllBombs();
			timeManager.stop();
			streakManager.resetStreak();
		});
		ui.initListeners();
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
const difficultyManager = {
    DIFFICULTY_values: {
		DIFF_HD: 0.20,
		DIFF_MD: 0.15,
		DIFF_EZ: 0.10,
	},
  currentDifficulty: null,
	setDifficulty(){
		this.currentDifficulty = this.DIFFICULTY_values.DIFF_EZ;
	}
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
		let bombsCount = Math.floor(this.totalTiles * difficultyManager.DIFFICULTY_values.DIFF_EZ);
		
		while (bombsPlaced < bombsCount) {
    const randomIndex = Math.floor(Math.random() * this.totalTiles);
    
    if (this.board[randomIndex] === 0) {
        this.board[randomIndex] = -1;
        const adjacentTiles = helperFunctions.getAdjacentTiles(this.board, randomIndex, this.size);
        this.addBombNumbers(this.board, adjacentTiles);
        bombsPlaced++;
    } 

    else if (this.board[randomIndex] !== -1 && !this.hasValue(0)) {
        this.board[randomIndex] = -1;
        const adjacentTiles = helperFunctions.getAdjacentTiles(this.board, randomIndex, this.size);
        this.addBombNumbers(this.board, adjacentTiles);
        bombsPlaced++;
    }
}

		},
	resetBoard(number){
		this.board = [];
		this.createBoard(number);
	},
    addBombNumbers(board, tiles){
    	for(let i = 0; i < tiles.length; i++){
    		const index = tiles[i].index;
    		board[index]++;
    	}
    },
    hasValue(value) {
    return this.board.includes(value);
}

};

const decisionEngine = {
  knownTiles: [],
  size: 0,
  totalBombs: null,
  baseRisk: 1,
  init(board) {
    const totalTiles = board.length;
    this.size = Math.sqrt(totalTiles);
    
    this.totalBombs = boardState.totalBombs || Math.floor(totalTiles * (difficultyManager?.DIFFICULTY_values?.DIFF_EZ || 0.10));
    
    this.baseRisk = this.totalBombs / totalTiles;

    this.knownTiles = board.map(() => ({
        value: 999,
        risk: this.baseRisk,
        isSafe: false,
        isBomb: false
    }));
},
  scoreAdjacentTiles(knownBoard, center, size) {
    const adjacentTiles = helperFunctions.getAdjacentTiles(knownBoard, center, size);
    
    const adjacentMarkedTiles = adjacentTiles.filter(t => knownBoard[t.index].isMarked || knownBoard[t.index].isBomb);
    
    const adjacentUnknownTiles = adjacentTiles.filter(t => knownBoard[t.index].value === 9 && !knownBoard[t.index].isBomb && !knownBoard[t.index].isMarked);

    const centerValue = knownBoard[center].value;
    const bombsFound = adjacentMarkedTiles.length;

    if (centerValue === bombsFound) {
        for (const tile of adjacentUnknownTiles) {
            knownBoard[tile.index].risk = -Infinity;
            knownBoard[tile.index].isSafe = true;
        }
    }

    const remainingBombsNeeded = centerValue - bombsFound;
    if (remainingBombsNeeded > 0 && remainingBombsNeeded === adjacentUnknownTiles.length) {
        for (const tile of adjacentUnknownTiles) {
            knownBoard[tile.index].risk = Infinity;
            knownBoard[tile.index].isBomb = true;
        }
    }

    if (adjacentUnknownTiles.length > 0 && remainingBombsNeeded > 0) {
        const riskToAdd = remainingBombsNeeded / adjacentUnknownTiles.length;
        for (const tile of adjacentUnknownTiles) {
            if (!knownBoard[tile.index].isSafe && !knownBoard[tile.index].isBomb) {
                knownBoard[tile.index].risk -= riskToAdd;
            }
        }
    }
},
  analyzeSubsetRule(knownBoard, size, centerTile, adjacentTile) {
    const centerNeighbors = helperFunctions.getAdjacentTiles(knownBoard, centerTile, size);
    const adjacentNeighbors = helperFunctions.getAdjacentTiles(knownBoard, adjacentTile, size);

    const centerBombs = centerNeighbors.filter(
        tile => knownBoard[tile.index].isBomb
    ).length;

    const adjacentBombs = adjacentNeighbors.filter(
        tile => knownBoard[tile.index].isBomb
    ).length;

    const centerUnknown = centerNeighbors.filter(
        tile => knownBoard[tile.index].value === 9 && !knownBoard[tile.index].isBomb
    );

    const adjacentUnknown = adjacentNeighbors.filter(
        tile => knownBoard[tile.index].value === 9 && !knownBoard[tile.index].isBomb
    );

    const centerIsSubset = centerUnknown.every(center =>
        adjacentUnknown.some(adj => adj.index === center.index)
    );

    if (!centerIsSubset || centerUnknown.length === 0) return;

    const exclusive = adjacentUnknown.filter(
        adj => !centerUnknown.some(center => center.index === adj.index)
    );

    const centerValue = knownBoard[centerTile].value - centerBombs;
    const adjacentValue = knownBoard[adjacentTile].value - adjacentBombs;
    const valueDifference = adjacentValue - centerValue;
    
    if (
        valueDifference > 0 &&
        valueDifference === exclusive.length
    ) {
        for (const tile of exclusive) {
            knownBoard[tile.index].risk = Infinity;
            knownBoard[tile.index].isBomb = true;
        }
    }

    if (valueDifference === 0) {
        for (const tile of exclusive) {
            knownBoard[tile.index].risk = -Infinity;
            knownBoard[tile.index].isSafe = true;
        }
    }
},
    evaluateBoard(knownBoard) {  
    let closedTiles = 0;
    let identifiedBombs = 0;

    for (let i = 0; i < knownBoard.length; i++) {
        if (knownBoard[i].isBomb) identifiedBombs++;
        else if (knownBoard[i].value === 9) closedTiles++;
    }

    const bombsLeft = boardState.totalBombs - identifiedBombs;

    if (bombsLeft === 0 && closedTiles > 0) {
        for (let i = 0; i < knownBoard.length; i++) {
            if (knownBoard[i].value === 9 && !knownBoard[i].isBomb) {
                knownBoard[i].isSafe = true;
                knownBoard[i].risk = -Infinity;
            }
        }
        return knownBoard.findIndex(tile => tile.isSafe); // Clica no primeiro seguro
    }

    if (bombsLeft === closedTiles && closedTiles > 0) {
        for (let i = 0; i < knownBoard.length; i++) {
            if (knownBoard[i].value === 9 && !knownBoard[i].isBomb) {
                knownBoard[i].isBomb = true;
                knownBoard[i].risk = Infinity;
            }
        }
    }

    for (let centerI = 0; centerI < knownBoard.length; centerI++) {  
        if (knownBoard[centerI].value === 9) continue;  

        this.scoreAdjacentTiles(knownBoard, centerI, this.size);  

        for (const adjacent of helperFunctions.getAdjacentTiles(knownBoard, centerI, this.size)) {  
        	if(knownBoard[adjacent.index].value === 9) continue;
            this.analyzeSubsetRule( knownBoard,                this.size,centerI,adjacent.index
            );
        }
    }  

    let betterPosition = -1;
      
    for (let i = 0; i < knownBoard.length; i++) {  
        if (knownBoard[i].value !== 9) continue;  

        if (betterPosition === -1 ||knownBoard[i].risk < knownBoard[betterPosition].risk
        ) {
            betterPosition = i;  
        }
        if (knownBoard[i].isSafe) {  
            return i;  
        }
    }  

    return betterPosition;  
},
updateBombs(knownBoard, realBoard) {
    for (let i = 0; i < knownBoard.length; i++) {
        if (!knownBoard[i].isBomb) continue;

        tilesManager.markTile(realBoard, i);
    }
},
  makeDecision(knownBoard, realArray) {
  	for (let i = 0; i < knownBoard.length; i++) {
  		const realTile = realArray[i];
  		knownBoard[i].value = realTile.isRevealed ? realTile.number : 9;
  	if(realTile.isMarked){
  		knownBoard[i].isBomb = true;
  		knownBoard[i].risk = Infinity;
  	}
  	}
  	
  	const betterDecision = this.evaluateBoard(knownBoard);
  	this.updateBombs(knownBoard, realArray);
  	
  	
  
this.resetRisk(knownBoard);
  	return betterDecision;
  },
  resetRisk(knownBoard){
    for(let i = 0; i < knownBoard.length; i++){
        knownBoard[i].risk = this.baseRisk;
        knownBoard[i].isSafe = false;
        knownBoard[i].isBomb = false;
    }
}
};

const tilesManager = {
	tilesArray: [],
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
		if(mainConfig.gameEnded) return;
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

const ui = {
    time: document.getElementById("score-time"),
    flags: document.getElementById("score-flags"),
    streak: document.getElementById("score-streak"),
    resetBtn: document.getElementById("resetBtn"),
    tilesConfigBtn: document.getElementById("tilesDesignBtn"),
    
    board: document.getElementById("board"),

    setTime(value) {
        this.time.textContent = value;
    },

    setFlags(value) {
        this.flags.textContent = value;
    },

    setStreak(value) {
        this.streak.textContent = value;
    },
    initListeners(){
    this.setListener(this.resetBtn, "reset")
    this.setListener(this.tilesConfigBtn, "hideNumbers")
    },
    setListener(element, update){
    element.addEventListener("click", () => {
    		eventBus.update(update);
    	})
    },
    toggleAnimate(element, className, isAnimating) {
    if(isAnimating){
    	element.classList.add(className);
    } else {
    	element.classList.remove(className);
    }
},
    toggleNumbersVisibility(){
    	this.board.classList.toggle("board--withoutNumbers");
    }
};
const configMenu = {
	
}
const flagCountManager = {
    maxFlags: 30,
    flagsCount: 30,

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
        eventBus.update("newStreak");
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

        eventBus.update("timerInit");
        this.running = true;
        
        this.startTime = performance.now();

        const update = () => {
            if (!this.running) return;

            const seconds = Math.floor((performance.now() - this.startTime) / 1000);
            const timeDisplay = helperFunctions.formatTime(seconds)
            ui.setTime(timeDisplay);

            this.animationId = requestAnimationFrame(update);
        };

        update();
    },

    stop() {
        this.running = false;
        eventBus.update("timerStopped");
        cancelAnimationFrame(this.animationId);
    },

    reset() {
        this.stop();
        ui.setTime(0);
    }
};

//fazer ia depois q joga na melhor posicao e outra q poe bomba em alguma posicao

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
createTestButton(callback){
	const button = this.createButton(document.body, "testButton", "fa-hammer");
	if(callback) button.addEventListener("click", () => {
		callback();
	})
},
getAdjacentTiles(board, center, size) {
    const row = Math.floor(center / size);
    const col = center % size;
    const adjacentTiles = [];

    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
        for (let colOffset = -1; colOffset <= 1; colOffset++) {
        	if (rowOffset === 0 && colOffset === 0) continue;
            const newRow = row + rowOffset;
            const newCol = col + colOffset;

            if (
                newRow < 0 ||
                newRow >= size ||
                newCol < 0 ||
                newCol >= size
            ) {
                continue;
            }

            const index = newRow * size + newCol;
            const tile = board[index];

            const value = typeof tile === "object"
                ? tile.value
                : tile;

            if (value === -1) continue;

            adjacentTiles.push({
                index,
                value
            });
        }
    }

    return adjacentTiles;
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
},
formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const m = String(minutes).padStart(2, '0');
  const s = String(seconds).padStart(2, '0');

  if (hours > 0) {
    const h = String(hours).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  return `${m}:${s}`;
},


};
mainConfig.init();

// Experimental features. I plan to refactor this someday.
let aiInterval = null;
let lastAiMoveIndex = null;

helperFunctions.createTestButton(() => {
    if (aiInterval) {
        clearInterval(aiInterval);
        aiInterval = null;
        return;
    }

    aiInterval = setInterval(() => {
        if (mainConfig.gameEnded) {
            clearInterval(aiInterval);
            aiInterval = null;
            return;
        }

        if (lastAiMoveIndex !== null && tilesManager.tilesArray[lastAiMoveIndex]) {
            tilesManager.tilesArray[lastAiMoveIndex].element.classList.remove("tiles--aiLastMove");
        }

        let move = decisionEngine.makeDecision(decisionEngine.knownTiles, tilesManager.tilesArray);

        if (move === -1 || move === undefined) {
            clearInterval(aiInterval);
            aiInterval = null;
            return;
        }

        lastAiMoveIndex = move;
        if (tilesManager.tilesArray[move]) {
            tilesManager.tilesArray[move].element.classList.add("tiles--aiLastMove");
        }

        tilesManager.revealTile(tilesManager.tilesArray, move);

    }, 50);
});
