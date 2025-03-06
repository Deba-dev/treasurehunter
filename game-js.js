/**
 * Treasure Hunter Game
 * A game where a treasure hunter collects treasures on a grid
 * while avoiding obstacles.
 */

// Game Model - Handles the data and game logic
class GameModel {
    constructor(rows = 5, cols = 5) {
        this.rows = rows;
        this.cols = cols;
        this.grid = this.createEmptyGrid();
        this.gameStage = 'setup'; // setup, play, end
        this.hunterPosition = null;
        this.rounds = 0;
        this.score = 0;
        this.treasureCounts = { 5: 0, 6: 0, 7: 0, 8: 0 };
    }

    // Create an empty grid of specified dimensions
    createEmptyGrid() {
        const grid = [];
        for (let i = 0; i < this.rows; i++) {
            const row = [];
            for (let j = 0; j < this.cols; j++) {
                row.push({ type: 'empty' });
            }
            grid.push(row);
        }
        return grid;
    }

    // Place an object on the grid
    placeObject(row, col, obj) {
        // Check if the cell is empty
        if (this.grid[row][col].type !== 'empty') {
            return false;
        }

        // Update the grid
        this.grid[row][col] = obj;

        // If it's a treasure, update the treasure count
        if (obj.type === 'treasure') {
            this.treasureCounts[obj.value]++;
        }

        // If it's the hunter, update the hunter position
        if (obj.type === 'hunter') {
            if (this.hunterPosition !== null) {
                return false; // Hunter already exists
            }
            this.hunterPosition = { row, col };
        }

        return true;
    }

    // Get the total number of treasures on the grid
    getTotalTreasures() {
        return this.treasureCounts[5] + this.treasureCounts[6] + 
               this.treasureCounts[7] + this.treasureCounts[8];
    }

    // Move the hunter in the specified direction
    moveHunter(direction) {
        if (!this.hunterPosition) return false;
        
        const { row, col } = this.hunterPosition;
        let newRow = row;
        let newCol = col;
        
        // Calculate new position based on direction
        switch (direction) {
            case 'w': newRow--; break; // up
            case 's': newRow++; break; // down
            case 'a': newCol--; break; // left
            case 'd': newCol++; break; // right
            default: return false;      // invalid direction
        }
        
        // Check if the new position is valid
        if (newRow < 0 || newRow >= this.rows || 
            newCol < 0 || newCol >= this.cols) {
            return false; // Out of bounds
        }
        
        // Check if there's an obstacle
        if (this.grid[newRow][newCol].type === 'obstacle') {
            return false;
        }
        
        // Move the hunter
        const hunterObj = this.grid[row][col];
        this.grid[row][col] = { type: 'empty' };
        
        // Check if there's a treasure at the new position
        const targetCell = this.grid[newRow][newCol];
        if (targetCell.type === 'treasure') {
            this.score += targetCell.value;
            this.treasureCounts[targetCell.value]--;
            this.placeRandomObstacle();
        }
        
        // Place the hunter at the new position
        this.grid[newRow][newCol] = hunterObj;
        this.hunterPosition = { row: newRow, col: newCol };
        this.rounds++;
        
        return true;
    }
    
    // Place a random obstacle on an empty cell
    placeRandomObstacle() {
        const emptyCells = [];
        
        // Find all empty cells
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.grid[i][j].type === 'empty') {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }
        
        // If there are empty cells, place an obstacle randomly
        if (emptyCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyCells.length);
            const { row, col } = emptyCells[randomIndex];
            this.grid[row][col] = { type: 'obstacle' };
        }
    }
    
    // Check if the hunter can move in any direction
    canHunterMove() {
        if (!this.hunterPosition) return false;
        
        const { row, col } = this.hunterPosition;
        
        // Check all four directions
        const directions = [
            { r: -1, c: 0 }, // up
            { r: 1, c: 0 },  // down
            { r: 0, c: -1 }, // left
            { r: 0, c: 1 }   // right
        ];
        
        for (const dir of directions) {
            const newRow = row + dir.r;
            const newCol = col + dir.c;
            
            // Check if the new position is valid
            if (newRow >= 0 && newRow < this.rows && 
                newCol >= 0 && newCol < this.cols && 
                this.grid[newRow][newCol].type !== 'obstacle') {
                return true;
            }
        }
        
        return false;
    }
    
    // Calculate the performance index
    calculatePerformanceIndex() {
        if (this.rounds === 0) return 0;
        return (this.score / this.rounds).toFixed(2);
    }
}

// Game View - Handles the UI
class GameView {
    constructor(model) {
        this.model = model;
        this.gridElement = document.getElementById('grid');
        this.statusElement = document.getElementById('status');
        this.messageElement = document.getElementById('message');
        this.endSetupButton = document.getElementById('end-setup-btn');
        this.endPlayButton = document.getElementById('end-play-btn');
        this.instructionsElement = document.getElementById('instructions');
        
        // Initialize the grid display
        this.initGrid();
        this.updateStatus();
    }
    
    // Initialize the grid display
    initGrid() {
        this.gridElement.innerHTML = '';
        
        for (let i = 0; i < this.model.rows; i++) {
            for (let j = 0; j < this.model.cols; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                this.gridElement.appendChild(cell);
            }
        }
    }
    
    // Update the grid display based on the model
    updateGrid() {
        const cells = this.gridElement.querySelectorAll('.cell');
        
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const cellData = this.model.grid[row][col];
            
            // Clear the cell
            cell.innerHTML = '';
            cell.className = 'cell';
            
            // Set the cell content based on its type
            switch (cellData.type) {
                case 'treasure':
                    cell.innerHTML = cellData.value;
                    cell.classList.add(`treasure-${cellData.value}`);
                    break;
                case 'obstacle':
                    cell.innerHTML = 'O';
                    cell.classList.add('obstacle');
                    break;
                case 'hunter':
                    cell.innerHTML = 'H';
                    cell.classList.add('hunter');
                    break;
            }
        });
    }
    
    // Update the status display
    updateStatus() {
        if (this.model.gameStage === 'setup') {
            this.statusElement.innerHTML = '<h3>Setup Stage</h3>';
            return;
        }
        
        let statusHTML = `
            <h3>${this.model.gameStage === 'play' ? 'Play Stage' : 'End Stage'}</h3>
            <p>Rounds completed: ${this.model.rounds}</p>
            <p>Treasures remaining:</p>
            <ul>
                <li>Value 5: ${this.model.treasureCounts[5]}</li>
                <li>Value 6: ${this.model.treasureCounts[6]}</li>
                <li>Value 7: ${this.model.treasureCounts[7]}</li>
                <li>Value 8: ${this.model.treasureCounts[8]}</li>
            </ul>
            <p>Score: ${this.model.score}</p>
        `;
        
        if (this.model.gameStage === 'end') {
            statusHTML += `<p>Performance Index: ${this.model.calculatePerformanceIndex()}</p>`;
        }
        
        this.statusElement.innerHTML = statusHTML;
    }
    
    // Show a message to the user
    showMessage(message) {
        this.messageElement.textContent = message;
        setTimeout(() => {
            this.messageElement.textContent = '';
        }, 3000);
    }
    
    // Update the UI for the current game stage
    updateStage() {
        switch (this.model.gameStage) {
            case 'setup':
                this.endSetupButton.style.display = 'inline-block';
                this.endPlayButton.style.display = 'none';
                break;
            case 'play':
                this.endSetupButton.style.display = 'none';
                this.endPlayButton.style.display = 'inline-block';
                this.instructionsElement.innerHTML = `
                    <h3>Play Instructions:</h3>
                    <p>Use WASD keys to move:</p>
                    <ul>
                        <li>W: Move up</li>
                        <li>A: Move left</li>
                        <li>S: Move down</li>
                        <li>D: Move right</li>
                    </ul>
                `;
                break;
            case 'end':
                this.endSetupButton.style.display = 'none';
                this.endPlayButton.style.display = 'none';
                this.instructionsElement.innerHTML = `
                    <h3>Game Over</h3>
                    <p>Performance Index: ${this.model.calculatePerformanceIndex()}</p>
                `;
                break;
        }
        
        this.updateStatus();
    }
}

// Game Controller - Handles user input and game flow
class GameController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.setupEventListeners();
    }
    
    // Set up all event listeners
    setupEventListeners() {
        // Cell click event
        this.view.gridElement.addEventListener('click', (e) => {
            const cell = e.target.closest('.cell');
            if (!cell) return;
            
            if (this.model.gameStage === 'setup') {
                this.handleCellClick(cell);
            }
        });
        
        // End setup button
        this.view.endSetupButton.addEventListener('click', () => {
            this.endSetupStage();
        });
        
        // End play button
        this.view.endPlayButton.addEventListener('click', () => {
            this.endPlayStage();
        });
        
        // Keyboard events for movement
        document.addEventListener('keydown', (e) => {
            if (this.model.gameStage === 'play') {
                this.handleKeyDown(e.key.toLowerCase());
            }
        });
    }
    
    // Handle cell clicks during setup
    handleCellClick(cell) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        // Ask for input
        const input = prompt('Enter object type (5-8 for treasure, o for obstacle, h for hunter):');
        if (!input) return;
        
        const trimmedInput = input.trim().toLowerCase();
        
        // Process the input
        let obj = null;
        
        if (/^[5-8]$/.test(trimmedInput)) {
            obj = { type: 'treasure', value: parseInt(trimmedInput) };
        } else if (trimmedInput === 'o') {
            obj = { type: 'obstacle' };
        } else if (trimmedInput === 'h') {
            obj = { type: 'hunter' };
        } else {
            this.view.showMessage('Invalid input. Please enter 5-8, o, or h.');
            return;
        }
        
        // Try to place the object
        const success = this.model.placeObject(row, col, obj);
        
        if (!success) {
            if (obj.type === 'hunter' && this.model.hunterPosition !== null) {
                this.view.showMessage('Hunter already placed. You can only have one hunter.');
            } else {
                this.view.showMessage('Cannot place object. Cell is already occupied.');
            }
            return;
        }
        
        // Update the UI
        this.view.updateGrid();
    }
    
    // End the setup stage
    endSetupStage() {
        if (this.model.hunterPosition === null) {
            this.view.showMessage('You must place a treasure hunter before starting the game.');
            return;
        }
        
        this.model.gameStage = 'play';
        this.view.updateStage();
        
        // If there are no treasures, immediately end the game
        if (this.model.getTotalTreasures() === 0) {
            this.endPlayStage();
        }
    }
    
    // Handle keyboard input during play
    handleKeyDown(key) {
        if (['w', 'a', 's', 'd'].includes(key)) {
            const success = this.model.moveHunter(key);
            
            if (!success) {
                this.view.showMessage('Invalid move. Try another direction.');
                return;
            }
            
            // Update the UI
            this.view.updateGrid();
            this.view.updateStatus();
            
            // Check end conditions
            if (this.model.getTotalTreasures() === 0 || !this.model.canHunterMove()) {
                this.endPlayStage();
            }
        } else {
            this.view.showMessage('Invalid key. Use W, A, S, D to move.');
        }
    }
    
    // End the play stage
    endPlayStage() {
        this.model.gameStage = 'end';
        this.view.updateStage();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const model = new GameModel();
    const view = new GameView(model);
    const controller = new GameController(model, view);
});
