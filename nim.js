/**
 * Prend une chaine de caractères en entrée et tente de le transformer en nombre entier.
 * Si le nombre resulant est inférieur strictement à la limte inférieur, celui-ci devient égal à la-dite limite.
 * Même principe pour la limite supérieur. Cela est effectif uniquement si
 * @param {string} object
 * @param {number|null} minInclusive
 * @param {number|null} maxInclusive
 * @returns {number}
 */
function asInt({
                   object,
                   minInclusive = void 0,
                   maxInclusive = void 0,
               }) {

    let result = parseInt(object);
    if (isNaN(result)) throw new Error('parseInt resulted in NaN');
    if (minInclusive != null && result < minInclusive) result = minInclusive;
    if (maxInclusive == null && result > maxInclusive) result = maxInclusive;
    return result;
}

export default class NimGame {

    constructor({
                    appElementId,
                    minMatches = 4,
                    maxMatches = 24,
                }) {

        this._appContainerElement = document.getElementById(appElementId);
        this._appLog = document.getElementById('app-log'); // Emplacement du log
        minMatches = minMatches - minMatches % 4;
        maxMatches = maxMatches - maxMatches % 4;
        if (minMatches >= maxMatches) // Vérification de la plage minimale et maximale
            throw new Error('minMatches >= maxMatches');
        let countOptions = '';
        for (let i = minMatches; i <= maxMatches; i += 4) // Création de la liste d'options d'allumettes initiales
            countOptions += `<option>${i}</option>`;
        this._appContainerElement.innerHTML = `<select id="initialMatchesCount">
${countOptions}
</select>
<select id="gameModeSelect">
  <option value="1">Human vs Human</option>
  <option value="2">Human vs Computer</option>
</select>
<button id="validateInitialCountButton">OK</button>
`; // Création de l'HTML
        document.getElementById('validateInitialCountButton').onclick = () => { // Callback de validation du menu
            const initialMatchesCountElement = document.getElementById('initialMatchesCount');
            const gameModeSelectElement = document.getElementById('gameModeSelect');
            const initialCount = parseInt(initialMatchesCountElement.value);
            if (isNaN(initialCount)) throw Error('initialCount is NaN'); // Revérification du nombre initial
            const gameMode = parseInt(gameModeSelectElement.value);
            if (isNaN(gameMode)) throw Error('gameMode is NaN'); // Revérification du mode de jeu.
            this.init(initialCount, gameMode); // Initialisation
        };
    }

    init(initialCount, gameMode) {

        this._addToLog('Initializing');
        this._currentCount = initialCount;
        this._gameMode = gameMode;
        this._currentPlayer = 0;
        this._inTick = false;
        // Création de l'interface
        // language=HTML
        this._appContainerElement.innerHTML = `
            <div>Joueur actuel : <span id="currentPlayer"></span></div>
            <div>Restant : <span id="remainingSpan"></span></div>
            <input id="takeInput"
                   type="number"
                   min="1"
                   max="3">
            <button id="validateTurn">OK</button>`;
        // Mise en place initiale des textes
        this._currentPlayerElement = document.getElementById('currentPlayer');
        this._currentPlayerElement.innerText = this._getCurrentPlayerName();
        this._currentCountElement = document.getElementById('remainingSpan');
        this._currentCountElement.innerText = `${initialCount}`;
        this._takeInput = document.getElementById('takeInput');
        document.getElementById('validateTurn').onclick = () => this.tick();
    }

    /**
     * Un tick est équivalent à un tour de joueur.
     */
    tick() {

        if (this._inTick) return;
        this._inTick = true;

        let take;
        if (this._gameMode === 2 && this._currentPlayer === 1) take = this._computerTick();
        else take = this._humanTick();
        if (take === -1) {
            this._inTick = false;
            return;
        }
        this._currentCount -= take;
        if (this._currentCount === 0) {
            this._showWin();
            this._inTick = false;
            return;
        }
        this._addToLog(`${this._getCurrentPlayerName()} took ${take} matches`);
        this._refreshScreen();
        this._currentPlayer = ++this._currentPlayer % 2;

        this._inTick = false;
    }

    /**
     * Calcul un tour de l'IA
     * @returns {number}
     * @private
     */
    _computerTick() {
        console.log('computer tick');
        let take;
        if (this._currentCount <= 4) {
            take = this._currentCount - 1;
        } else {
            take = 4 - this.lastHumanTake;
        }
        return take;
    }

    /**
     * Retourne le nombre d'allumette dans la barre d'input du joueur humain
     * @returns {number}
     * @private
     */
    _humanTick() {
        let input = this._takeInput.value || '';
        if (!input.match('[1-3]')) return -1;
        let take = asInt({object: input, minInclusive: 1, maxInclusive: 3});
        if (take > this._currentCount)
            take = this._currentCount;
        this.lastHumanTake = take;
        return take;
    }

    /**
     * Retourne le nom du joueur actif.
     * @returns {string}
     * @private
     */
    _getCurrentPlayerName = () => this._gameMode === 2 && this._currentPlayer === 1
        ? 'Computer'
        : `Player ${this._currentPlayer + 1}`;

    /**
     * Cette fonction met à jour les informations à l'écran
     * @private
     */
    _refreshScreen() {
        this._currentPlayerElement.innerText = this._getCurrentPlayerName();
        this._currentCountElement.innerText = `${this._currentCount}`;
    }

    /**
     * Cette fonction sert à afficher l'écran de victoire
     * @private
     */
    _showWin() {

        // language=HTML
        this._appContainerElement.innerHTML = `<p>${this._getCurrentPlayerName()} looses</p>`;
    }

    /**
     * Affiche un message dans la zone de log à l'écran
     * @param message Le message a afficher
     * @private
     */
    _addToLog(message) {

        if (this._appLog != null && message != null) {

            this._appLog.innerText += (message + '\n');
        }
    }
}