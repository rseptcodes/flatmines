import { eventBus } from "./main.js"
import { difficultyManager } from "./managers.js"
import { helperFunctions } from "./helperFunctions.js"

export const ui = {
    time: document.getElementById("score-time"),
    flags: document.getElementById("score-flags"),
    streak: document.getElementById("score-streak"),
    resetBtn: document.getElementById("resetBtn"),
    configBtn: document.getElementById("configBtn"),
    tilesConfigBtn: document.getElementById("tilesDesignBtn"),
    solverBtn: document.getElementById("solverBtn"),

	  boardsContainer : document.getElementById("boardsContainer"),
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
    this.setListener(this.configBtn, "toggleConfigMenuVisibility");
    this.setListener(this.solverBtn, "aiMove");
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
    toggleSolverBtnVisibility(hide) {
    if (hide) {
        helperFunctions.applyTempClass(this.solverBtn, "solverBtn--fadeOut", () => {
            this.solverBtn.classList.add("solverBtn--hidden");
        });
    } else {
        this.solverBtn.classList.remove("solverBtn--hidden");
        helperFunctions.applyTempClass(this.solverBtn, "solverBtn--fadeIn");
    }
},
    toggleNumbersVisibility(){
    	this.board.classList.toggle("board--withoutNumbers");
    }
};
export const configMenu = {
	configMenu: document.getElementById("configMenu"),
	easyButton: document.getElementById("easyButton"),
	mediumButton: document.getElementById("mediumButton"),
	hardButton: document.getElementById("hardButton"),
	solverManager: document.getElementById("solverManager"),
	configMenuIsHidden: true,
	solverButtonIsHidden: true,

	init() {
		this.setDifficultyButtonListener(this.easyButton, "easy");
		this.setDifficultyButtonListener(this.mediumButton, "medium");
		this.setDifficultyButtonListener(this.hardButton, "hard");
		this.solverManager.addEventListener("click", () =>{
			this.toggleSolver();
		});
	},

	toggleVisibility() {
		this.configMenuIsHidden = !this.configMenuIsHidden;

		if (this.configMenuIsHidden) {
			this.configMenu.classList.add("configMenu--hidden");
		} else {
			this.configMenu.classList.remove("configMenu--hidden");
			helperFunctions.setOverlay(() => {
				configMenu.toggleVisibility();
			})
		}
	},

	setDifficultyButtonListener(element, difficulty) {
		if (!element) return;

		element.addEventListener("click", () => {
			difficultyManager.setDifficulty(difficulty);
		});
	},

	toggleSolver() {
		this.solverButtonIsHidden = !this.solverButtonIsHidden;
		ui.toggleSolverBtnVisibility(this.solverButtonIsHidden);
	},

	getSolverDebugInfo() {
  		// I'll made a little text box on the corner of screen for show the solver "thinking"
	},
};
export const uiBoardCopies = {
    lastBoard: null,
    emptyBoard: null,
    isMobile: null,

    init() {
    this.isMobile = window.matchMedia("(max-width: 768px)").matches;

    this.lastBoard = document.getElementById("lastBoard");
    this.emptyBoard = document.getElementById("nextBoard");

    if (this.lastBoard) {
        this.lastBoard.style.visibility = this.isMobile
            ? "hidden"
            : "visible";
    }

    if (this.emptyBoard) {
        this.emptyBoard.style.visibility = this.isMobile
            ? "hidden"
            : "visible";
    }

    window.addEventListener("resize", () => {
        this.isMobile = window.matchMedia("(max-width: 768px)").matches;

        if (this.lastBoard) {
            this.lastBoard.style.visibility = this.isMobile
                ? "hidden"
                : "visible";
        }

        if (this.emptyBoard) {
            this.emptyBoard.style.visibility = this.isMobile
                ? "hidden"
                : "visible";
        }
    });
},
async createBoardClones(boardElement, boardSize) {
    if (!boardElement) return;
	 if(this.isMobile) {
		 this.lastBoard.style.visibility = this.isMobile ? "hidden" : "visible";
this.emptyBoard.style.visibility = this.isMobile ? "hidden" : "visible";
		 return;
	 }

    await this.removeBoardClones();

    if (this.lastBoard) {
        this.lastBoard.classList.remove("board--previewCopy--out");
    }

    if (this.emptyBoard) {
        this.emptyBoard.classList.remove("board--nextCopy--out");
    }

    if (this.lastBoard) {
        this.lastBoard.innerHTML = boardElement.innerHTML;
        this.lastBoard.style.setProperty("--board-size", boardSize);

        helperFunctions.applyTempClass(
            this.lastBoard,
            "board--previewCopy--entry"
        );
    }

    if (this.emptyBoard) {
        this.emptyBoard.innerHTML = boardElement.innerHTML;
        this.emptyBoard.style.setProperty("--board-size", boardSize);

        this.emptyBoard.querySelectorAll(".tiles").forEach(tile => {
            tile.innerText = "";
            tile.className = "tiles";
        });

        helperFunctions.applyTempClass(
            this.emptyBoard,
            "board--nextCopy--entry"
        );
    }
},
async recreateBoardClones(boardElement, boardSize) {
    await this.createBoardClones(boardElement, boardSize);
},
    removeBoardClones() {
        if (this.lastBoard) {
                this.lastBoard.innerHTML = ''; 
        }
        
        if (this.emptyBoard) {
                this.emptyBoard.innerHTML = '';
        }
    },
};
