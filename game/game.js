const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 400;

const player = {
    x: 50,
    y: canvas.height - 40, // Adjusted position to spawn flat on the ground
    width: 40,
    height: 40,
    color: '#00f',
    dy: 0,
    gravity: 0.6,
    jumpStrength: -8, // Adjusted jump strength for lower jump
    grounded: true,
    onBlock: false, // Flag to check if player is on a block
    dead: false, // Flag to check if the player is dead
    deathAnimation: 0 // Timer for the death animation
};

let obstacles = [];
let jumpableBlocks = [];
let currentLevel = 0;
let gameRunning = false;
let gameStarted = false; // Flag to check if the game has started
let explosionSound = new Audio('assets/explosion-sound.wav'); // Load the explosion sound

const levels = [
    [
        { x: 400, y: canvas.height - 20, width: 40, height: 20 }, // Level 1
        { x: 800, y: canvas.height - 20, width: 40, height: 20 },
        { x: 1200, y: canvas.height - 20, width: 40, height: 20 }
    ],
    [
        { x: 300, y: canvas.height - 20, width: 40, height: 20 }, // Level 2
        { x: 600, y: canvas.height - 20, width: 40, height: 20 },
        { x: 900, y: canvas.height - 20, width: 40, height: 20 },
        { x: 1200, y: canvas.height - 20, width: 40, height: 20 }
    ],
    [
        { x: 200, y: canvas.height - 20, width: 40, height: 20 }, // Level 3
        { x: 500, y: canvas.height - 20, width: 40, height: 20 },
        { x: 800, y: canvas.height - 20, width: 40, height: 20 },
        { x: 1100, y: canvas.height - 20, width: 40, height: 20 },
        { x: 1400, y: canvas.height - 20, width: 40, height: 20 }
    ],
    [
        { x: 100, y: canvas.height - 20, width: 40, height: 20 }, // Level 4
        { x: 400, y: canvas.height - 20, width: 40, height: 20 },
        { x: 700, y: canvas.height - 20, width: 40, height: 20 },
        { x: 1000, y: canvas.height - 20, width: 40, height: 20 },
        { x: 1300, y: canvas.height - 20, width: 40, height: 20 },
        { x: 1600, y: canvas.height - 20, width: 40, height: 20 }
    ],
    [
        { x: 50, y: canvas.height - 20, width: 40, height: 20 }, // Level 5
        { x: 350, y: canvas.height - 20, width: 40, height: 20 },
        { x: 650, y: canvas.height - 20, width: 40, height: 20 },
        { x: 950, y: canvas.height - 20, width: 40, height: 20 },
        { x: 1250, y: canvas.height - 20, width: 40, height: 20 },
        { x: 1550, y: canvas.height - 20, width: 40, height: 20 },
        { x: 1850, y: canvas.height - 20, width: 40, height: 20 }
    ],
    [
        { x: 100, y: canvas.height - 20, width: 40, height: 20 }, // Level 6
        { x: 400, y: canvas.height - 20, width: 40, height: 20 },
        { x: 700, y: canvas.height - 20, width: 40, height: 20 },
        { x: 1000, y: canvas.height - 20, width: 40, height: 20 },
        { x: 1300, y: canvas.height - 20, width: 40, height: 20 },
        { x: 1600, y: canvas.height - 20, width: 40, height: 20 }
    ],
    [
        { x: 150, y: canvas.height - 20, width: 40, height: 20 }, // Level 7
        { x: 450, y: canvas.height - 20, width: 40, height: 20 },
        { x: 750, y: canvas.height - 20, width: 40, height: 20 },
        { x: 1050, y: canvas.height - 20, width: 40, height: 20 },
        { x: 1350, y: canvas.height - 20, width: 40, height: 20 },
        { x: 1650, y: canvas.height - 20, width: 40, height: 20 },
        { x: 1950, y: canvas.height - 20, width: 40, height: 20 }
    ]
];

const blocks = [
    [
        { x: 200, y: canvas.height - 40, width: 40, height: 40 }, // Level 1 blocks
        { x: 600, y: canvas.height - 40, width: 40, height: 40 }
    ],
    [
        { x: 400, y: canvas.height - 40, width: 40, height: 40 }, // Level 2 blocks
        { x: 800, y: canvas.height - 40, width: 40, height: 40 }
    ],
    [
        { x: 300, y: canvas.height - 40, width: 40, height: 40 }, // Level 3 blocks
        { x: 700, y: canvas.height - 40, width: 40, height: 40 }
    ],
    [
        { x: 200, y: canvas.height - 40, width: 40, height: 40 }, // Level 4 blocks
        { x: 600, y: canvas.height - 40, width: 40, height: 40 },
        { x: 1000, y: canvas.height - 40, width: 40, height: 40 }
    ],
    [
        { x: 300, y: canvas.height - 40, width: 40, height: 40 }, // Level 5 blocks
        { x: 700, y: canvas.height - 40, width: 40, height: 40 },
        { x: 1100, y: canvas.height - 40, width: 40, height: 40 }
    ]
];

function loadLevel(level) {
    obstacles = levels[level].map(obstacle => ({ ...obstacle }));
    jumpableBlocks = blocks[level].map(block => ({ ...block }));
    player.x = 50;
    player.y = canvas.height - 40; // Adjusted position to spawn flat on the ground
    player.dy = 0;
    player.grounded = true;
    player.onBlock = false; // Reset the onBlock flag
    player.dead = false; // Reset the dead flag
    player.deathAnimation = 0; // Reset the death animation timer
}

function drawPlayer() {
    if (!player.dead) {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
    } else {
        // Draw explosion effect
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.deathAnimation * 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function updatePlayer() {
    if (player.dead) {
        // If player is dead, increment the death animation timer
        player.deathAnimation += 1;
        if (player.deathAnimation > 60) { // Approximately 1 second at 60fps
            alert('Game Over!');
            gameRunning = false;
            gameStarted = false;
            document.getElementById('menu').style.display = 'block';
            canvas.style.display = 'none';
        }
        return;
    }

    if (!player.grounded) {
        player.dy += player.gravity;
    }
    player.y += player.dy;

    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
        player.dy = 0;
        player.grounded = true;
        player.onBlock = false;
    }

    let onAnyBlock = false;

    // Check for collisions with jumpable blocks
    for (const block of jumpableBlocks) {
        if (
            player.x < block.x + block.width &&
            player.x + player.width > block.x &&
            player.y + player.height > block.y &&
            player.y + player.height < block.y + block.height &&
            player.dy > 0
        ) {
            player.y = block.y - player.height;
            player.dy = 0;
            player.grounded = true;
            player.onBlock = true;
            onAnyBlock = true;
        } else if (
            player.x < block.x + block.width &&
            player.x + player.width > block.x &&
            player.y < block.y + block.height &&
            player.y + player.height > block.y
        ) {
            player.dead = true;
            explosionSound.play(); // Play the explosion sound
        }
    }

    if (!onAnyBlock && player.onBlock) {
        player.grounded = false;
        player.onBlock = false;
    }
}

function handleInput(event) {
    if (event.type === 'keydown') {
        if (!gameStarted && event.code === 'Space') {
            gameStarted = true;
        } else if (gameStarted && player.grounded && !player.dead) {
            player.dy = player.jumpStrength;
            player.grounded = false;
        }
    }
}

document.addEventListener('keydown', handleInput);

function drawObstacles() {
    for (const obstacle of obstacles) {
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(obstacle.x, obstacle.y + obstacle.height);
        ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y - obstacle.height);
        ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
        ctx.closePath();
        ctx.fill();
    }
}

function drawBlocks() {
    for (const block of jumpableBlocks) {
        ctx.fillStyle = '#000';
        ctx.fillRect(block.x, block.y, block.width, block.height);
    }
}

function updateObstaclesAndBlocks() {
    if (player.dead) {
        return; // Stop updating obstacles and blocks if the player is dead
    }

    for (const obstacle of obstacles) {
        if (gameStarted) {
            obstacle.x -= 5;
        }

        if (
            player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y
        ) {
            player.dead = true;
            explosionSound.play(); // Play the explosion sound
        }
    }

    for (const block of jumpableBlocks) {
        if (gameStarted) {
            block.x -= 5;
        }
    }

    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
    jumpableBlocks = jumpableBlocks.filter(block => block.x + block.width > 0);
}

function nextLevel() {
    currentLevel++;
    if (currentLevel < levels.length) {
        loadLevel(currentLevel);
    } else {
        alert('You Win!');
        gameRunning = false;
        gameStarted = false;
        document.getElementById('menu').style.display = 'block';
        canvas.style.display = 'none';
    }
}

function drawStartText() {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PRESS SPACE TO BEGIN', canvas.width / 2, canvas.height / 2);
}

function gameLoop() {
    if (!gameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawObstacles();
    drawBlocks();
    updatePlayer();
    updateObstaclesAndBlocks();

    if (obstacles.length === 0 && jumpableBlocks.length === 0) {
        nextLevel();
    }

    if (!gameStarted) {
        drawStartText();
    }

    requestAnimationFrame(gameLoop);
}

function selectLevel(level) {
    currentLevel = level;
    loadLevel(currentLevel);
    document.getElementById('menu').style.display = 'none';
    canvas.style.display = 'block';
    gameRunning = true;
    gameStarted = false;
    gameLoop();
}