import { eventBus } from "./main.js"
import { helperFunctions } from "./helperFunctions.js"

export const boardState = {
	board: [],
	size: 0,
	totalTiles: 0,
	bombsCount: null,
	createBoard(config){
		this.size = config.size;
		this.totalTiles = config.size * config.size;
		this.board = Array(this.totalTiles).fill(0);
		
		let bombsPlaced = 0;
		this.bombsCount = Math.floor( this.totalTiles * config.bombDensity);
		
		while (bombsPlaced < this.bombsCount) {
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
	resetBoard(config){
		this.board = [];
		this.createBoard(config);
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