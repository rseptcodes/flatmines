import { ui, configMenu, uiBoardCopies } from "./ui.js";
import { boardState } from "./boardState.js";
import { tilesManager } from "./tilesManager.js";
import { decisionEngine } from "./decisionEngine.js";
import { difficultyManager, flagCountManager, timeManager, streakManager } from "./managers.js";
import { autoSolver } from "./autoSolver.js";
import { helperFunctions } from "./helperFunctions.js";

const mainConfig = {
	init(){
		// Initialization
		eventBus.subscribe("init", () => {
			difficultyManager.init();
			uiBoardCopies.init();
			
			const config = difficultyManager.currentDifficulty;
			
uiBoardCopies.recreateBoardClones(ui.board, config.size);
			boardState.createBoard(config);

flagCountManager.setFlagsCountDefault(boardState.bombsCount);
  tilesManager.initTiles(boardState.board);
		decisionEngine.init(boardState.board, boardState.bombsCount);
		tilesManager.setGameState(false);
			timeManager.reset();
			timeManager.start();
			flagCountManager.resetCount();
			streakManager.init();
			configMenu.init();
		});
		// TimerInit and TimerStopped subscriptions
		eventBus.subscribe("timerInit", () => {
			ui.toggleAnimate(ui.time, "placar--timer", true);
		});
		eventBus.subscribe("timerStopped", () => {
			ui.toggleAnimate(ui.time, "placar--timer", false);
		});

		// Streak subscriptions
		eventBus.subscribe("newStreak", () => {
			helperFunctions.applyTempClass(ui.streak, "placar--streak");
		});

		// NewDifficulty subscriptions
		eventBus.subscribe("newDifficulty", () => {
			eventBus.update("reset");
		});

		// HideNumbers subscriptions
		eventBus.subscribe("hideNumbers", () => {
			ui.toggleNumbersVisibility();
		});

		// toggleConfigMenuVisibility subscriptions
		eventBus.subscribe("toggleConfigMenuVisibility", () => {
			configMenu.toggleVisibility();
		});

		// Subscriptions related to AIDecisions
		eventBus.subscribe("aiMove", () => {
			let move = decisionEngine.makeDecision(decisionEngine.knownTiles, tilesManager.tilesArray);
			tilesManager.revealTile(tilesManager.tilesArray, move);
		});
		eventBus.subscribe("aiMarked", () => {
			let tileMarked = decisionEngine.makeDecision(decisionEngine.knownTiles, tilesManager.tilesArray);
			tilesManager.markTile(tilesManager.tilesArray, tileMarked);
		});
		
		// Tiles subscriptions
		eventBus.subscribe("tileMarked", () => {
		    flagCountManager.useFlag();
		    helperFunctions.applyTempClass(ui.flags, "placar--marked");
		});
		eventBus.subscribe("tileUnmarked", () => {
		    flagCountManager.returnFlag();
		});


		// Reset subscriptions
		eventBus.subscribe("reset", async() => {
		  const config = difficultyManager.currentDifficulty;
			
 await uiBoardCopies.recreateBoardClones(ui.board, config.size);
			boardState.resetBoard(config);
			flagCountManager.setFlagsCountDefault(boardState.bombsCount);
      tilesManager.resetTiles(boardState.board);     
			tilesManager.setGameState(false);
			decisionEngine.init(boardState.board, boardState.bombsCount);
			timeManager.reset();
			timeManager.start();
			flagCountManager.resetCount();
			autoSolver.stop();
		});

		// Subscriptions related to GameOver events
		eventBus.subscribe("playerWin", () => {
			streakManager.addStreak();
			tilesManager.setGameState(true);
			tilesManager.revealAllBombs();
			timeManager.stop();
		});
		eventBus.subscribe("gameOver", () => {
			tilesManager.setGameState(true);
			tilesManager.revealAllBombs();
			timeManager.stop();
			streakManager.resetStreak();
		});

		ui.initListeners();
    eventBus.update("init");
	}
};
export const eventBus = {
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
	},
};
mainConfig.init();