import { eventBus } from "./main.js"
import { ui } from "./ui.js"
import { helperFunctions } from "./helperFunctions.js"


export const difficultyManager = {
    difficulties: {
        easy: {
            size: 10,
            bombDensity: 0.11,
        },
        medium: {
            size: 12,
            bombDensity: 0.15,
        },
        hard: {
            size: 14,
            bombDensity: 0.19,
        },
    },

    currentDifficulty: null,

    init() {
        this.currentDifficulty = this.difficulties.medium;
    },

    setDifficulty(difficulty) {
        if (!this.difficulties[difficulty]) return;

        this.currentDifficulty = this.difficulties[difficulty];
        eventBus.update("newDifficulty");
    },
};
export const flagCountManager = {
    maxFlags: 30,
    flagsCount: 30,
	  setFlagsCountDefault(bombsCount){
			this.maxFlags = bombsCount;
			this.flagsCount = bombsCount;
		},
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
export const streakManager = {
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
export const timeManager = {
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
