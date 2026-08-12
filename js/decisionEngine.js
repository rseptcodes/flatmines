import { boardState } from "./boardState.js";
import { tilesManager } from "./tilesManager.js";
import { helperFunctions } from "./helperFunctions.js";

export const decisionEngine = {
  knownTiles: [],
  size: 0,
  totalBombs: null,
  baseRisk: 1,
  init(board, bombsCount) {
    const totalTiles = board.length;
    this.size = Math.sqrt(totalTiles);
    
    this.totalBombs = bombsCount;
    
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
    
    if (valueDifference > 0 &&        valueDifference === exclusive.length) {
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

    const bombsLeft = this.totalBombs - identifiedBombs;
			
    if (bombsLeft === 0 && closedTiles > 0) {
        for (let i = 0; i < knownBoard.length; i++) {
            if (knownBoard[i].value === 9 && !knownBoard[i].isBomb) {
                knownBoard[i].isSafe = true;
                knownBoard[i].risk = -Infinity;
            }
        }
        return knownBoard.findIndex(tile => tile.isSafe);
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