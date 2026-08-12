import { tilesManager } from "./tilesManager.js";
import { decisionEngine } from "./decisionEngine.js";
import { helperFunctions } from "./helperFunctions.js";

export const autoSolver = {
    interval: null,
    lastMoveIndex: null,

    start() {
        if (this.interval) return;

        this.interval = setInterval(() => {
            if (tilesManager.gameEnded) {
                this.stop();
                return;
            }

            this.clearLastMoveHighlight();

            const move = decisionEngine.makeDecision(
                decisionEngine.knownTiles,
                tilesManager.tilesArray
            );

            if (move === -1 || move === undefined) {
                this.stop();
                return;
            }

            this.highlightMove(move);
            tilesManager.revealTile(tilesManager.tilesArray, move);
        }, 50);
    },

    stop() {
			console.log("parei")
        clearInterval(this.interval);
        this.interval = null;
    },

    toggle() {
			console.log("deu toggle")
        if (this.interval) {
            this.stop();
        } else {
            this.start();
        }
    },

    clearLastMoveHighlight() {
        if (
            this.lastMoveIndex === null ||
            !tilesManager.tilesArray[this.lastMoveIndex]
        ) return;

        tilesManager.tilesArray[
            this.lastMoveIndex
        ].element.classList.remove("tiles--aiLastMove");
    },

    highlightMove(index) {
        this.lastMoveIndex = index;

        const tile = tilesManager.tilesArray[index];

        if (tile) {
            tile.element.classList.add("tiles--aiLastMove");
        }
    }
};

helperFunctions.createTestButton(
    () => autoSolver.toggle(),    "InitAutoSolver");