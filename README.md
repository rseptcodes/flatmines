# 💣 FlatMines: Vanilla JS Minesweeper

A lightweight, fully interactive Minesweeper engine built from scratch with Vanilla JS, an optimized 1D flat array architecture, and a custom EventBus for state management.

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

This project is a functional engine for a classic Minesweeper game built entirely with Vanilla JavaScript. It serves as a practical exercise in architectural patterns (Pub/Sub), state management, recursive algorithms, DOM manipulation, and Artificial Intelligence implementation without relying on modern frameworks.

## ✨ Features

* **Event-Driven Architecture:** A custom `EventBus` (Pub/Sub pattern) handles communication between game state, user input, and the UI, keeping the codebase decoupled and scalable.
* **1D Array Grid System:** The board state is managed using a single, flat 1D array rather than a nested 2D matrix. Spatial calculations are resolved through standard math operations, keeping the data structure simple and memory-efficient.
* **Built-in AI & Auto-Solver:** Features a robust `decisionEngine` capable of analyzing the board state. It evaluates safe moves and flags bombs by calculating risk probabilities and applying advanced logic like the Subset Rule to solve complex tile configurations.
* **Full Game Loop & Win Detection:** Complete integration of standard mechanics, including flag placement, bomb explosion triggers, game resets, and automatic detection of win conditions when all safe tiles are revealed.
* **High-Performance Timer:** The game timer utilizes `performance.now()` alongside `requestAnimationFrame` for hyper-accurate tracking without blocking the main thread.
* **Persistent Stats:** A `streakManager` tracks consecutive wins and saves them directly to the browser's `localStorage`.
* **Smooth Animations:** Dynamic CSS animations (like flag popping and bomb explosions) are triggered sequentially via asynchronous JavaScript events (`animationend`).
* **Recursive Flood Fill:** Uses a standard recursive function to handle the cascade effect when clicking empty, safe tiles.

## 🛠️ Technologies Used

* **Vanilla JavaScript (ES6+):** Core game logic, custom EventBus, AI decision engine, and async DOM manipulation.
* **CSS3:** Uses CSS Variables, Flexbox/Grid for a responsive board, glassmorphism UI elements, and `@keyframes` for smooth gameplay feedback.
* **HTML5:** Semantic structural shell tied directly to JS state updates.

---

## 🚀 Future Improvements

* **File Separation (ES6 Modules):** Break down the single JavaScript configuration into smaller, cohesive modules (`board.js`, `ui.js`, `events.js`, `ai.js`) for better code maintainability.
* **Difficulty Levels & Config Menu:** Expand the currently empty `configMenu` to allow users to choose different grid sizes and bomb ratios (e.g., Easy, Medium, Hard).
* **Mobile Touch Support Optimization:** Fully implement and polish the `setupMobileInput` functionality to ensure a seamless experience on touch devices (long-press for flags, tap for reveal).
* **Enhanced Auto-Solver:** Improve the auto-solver logic to be more precise on higher difficulty levels.
