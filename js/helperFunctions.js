export const helperFunctions = {
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
createTestButton(callback, dataTooltip ){
	const button = this.createButton(document.body, "testButton", "fa-hammer");
	if(dataTooltip){
		button.classList.add("tooltip")
	 button.dataset.tooltip = dataTooltip;
	}
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
	// I'll implement this in the future
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
overlayManager: {
	overlayElement: null,
	createOverlay(callback){
  if(this.overlayElement) return;
  this.overlayElement = helperFunctions.createElement("div", document.body, "overlay")
	this.overlayElement.addEventListener("click", () => {
		try {
		callback?.();
		} finally {
		this.overlayElement?.remove();
		this.overlayElement = null;
		}
	});
},
},
setOverlay(callback){
	this.overlayManager.createOverlay(callback);
},
showInfoText(text){
  text = String(text);
	const textBox = this.createElement("div", document.body, "infoText");
	textBox.textContent = text;
	this.applyTempClass(textBox, "show", () => {
    textBox.remove();
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