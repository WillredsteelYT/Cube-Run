const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const fileInput = document.getElementById('fileInput');
const importLevelButton = document.getElementById('importLevel');
const startGameButton = document.getElementById('startGame');

canvas.width = 800;
canvas.height = 400;

let player = {
    x: 50,
    y: canvas.height - 40,
    width: 40,
    height: 40,
    color: '#00f',
    dy: 0,
    gravity: 0.8,
    jumpStrength: -8,
    grounded: true,
    jumping: false, // Track jumping state
    dead: false,
    deathRadius: 0 // For expanding red circle effect
};

let obstacles = [];
let jumpableBlocks = [];
let gameRunning = false;
let gameStarted = false;
let countdown = 0; // Countdown timer

function loadLevelData(levelData) {
    obstacles = levelData.filter(obj => obj.type === 'spike').map(spike => ({
        x: spike.x,
        y: spike.y,
        width: 40,
        height: 40
    }));
    jumpableBlocks = levelData.filter(obj => obj.type === 'block').map(block => ({
        x: block.x,
        y: block.y,
        width: 40,
        height: 40
    }));
    resetPlayer();
}

function resetPlayer() {
    player = {
        ...player,
        x: 50,
        y: canvas.height - 40,
        dy: 0,
        grounded: true,
        jumping: false, // Reset jumping flag
        dead: false,
        deathRadius: 0
    };
}

function handleFileInput(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const levelData = JSON.parse(e.target.result);
                if (Array.isArray(levelData)) {
                    loadLevelData(levelData);
                    alert('Level imported successfully! Click "Start Game" to play.');
                } else {
                    alert('Invalid level file!');
                }
            } catch (err) {
                alert('Error reading level file!');
            }
        };
        reader.readAsText(file);
    }
}

importLevelButton.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', handleFileInput);

startGameButton.addEventListener('click', () => {
    if (obstacles.length > 0 || jumpableBlocks.length > 0) {
        document.getElementById('menu').style.display = 'none';
        canvas.style.display = 'block';
        countdown = 3; // Start the countdown timer
        gameRunning = false;
        gameStarted = false;
        drawStaticLevel();
        startCountdown();
    } else {
        alert('No level loaded! Please import a level first.');
    }
});

// Countdown timer before the game starts
function startCountdown() {
    const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            gameRunning = true;
            gameStarted = true;
            gameLoop();
        }
    }, 1000);
    drawCountdownOverlay();
}

// Draw the level statically during countdown
function drawStaticLevel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawObstacles();
    drawBlocks();
}

// Draw the countdown overlay on top of the level
function drawCountdownOverlay() {
    drawStaticLevel();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent black background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 50px Arial';
    ctx.textAlign = 'center';
    if (countdown > 0) {
        ctx.fillText(countdown, canvas.width / 2, canvas.height / 2);
        requestAnimationFrame(drawCountdownOverlay);
    }
}

function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updatePlayer();
    updateObstaclesAndBlocks();

    drawPlayer();
    drawObstacles();
    drawBlocks();

    requestAnimationFrame(gameLoop);
}

function drawPlayer() {
    if (player.dead) {
        if (player.deathRadius < 100) {
            player.deathRadius += 2; // Slowly expand the red circle
        }
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(
            player.x + player.width / 2,
            player.y + player.height / 2,
            player.deathRadius,
            0,
            Math.PI * 2
        );
        ctx.fill();
    } else {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }
}

function drawObstacles() {
    for (const obstacle of obstacles) {
        ctx.fillStyle = '#000'; // Original black color for spikes
        ctx.beginPath();
        ctx.moveTo(obstacle.x, obstacle.y + obstacle.height);
        ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y);
        ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
        ctx.closePath();
        ctx.fill();
    }
}

function drawBlocks() {
    for (const block of jumpableBlocks) {
        ctx.fillStyle = '#000'; // Original black color for blocks
        ctx.fillRect(block.x, block.y, block.width, block.height);
    }
}

function updatePlayer() {
    if (player.dead) return;

    if (!player.grounded) {
        player.dy += player.gravity;
    }
    player.y += player.dy;

    // Check if the player is on the ground
    if (player.y + player.height >= canvas.height) {
        player.y = canvas.height - player.height;
        player.dy = 0;
        player.grounded = true;
        player.jumping = false; // Allow jumping again
    } else {
        player.grounded = false;
    }

    let onAnyBlock = false;

    for (const block of jumpableBlocks) {
        // Check collision with the top of the block
        if (
            player.x < block.x + block.width &&
            player.x + player.width > block.x &&
            player.y + player.height >= block.y &&
            player.y + player.height <= block.y + block.height
        ) {
            player.y = block.y - player.height;
            player.dy = 0;
            player.grounded = true;
            player.jumping = false; // Allow jumping again
            onAnyBlock = true;
        }

        // Check collision with the sides of the block
        if (
            (player.x + player.width > block.x && player.x < block.x + block.width) &&
            (player.y + player.height > block.y && player.y < block.y + block.height)
        ) {
            player.dead = true; // Die if touching the sides
            gameRunning = false; // Stop the game loop when the player dies
            break;
        }
    }

    if (!onAnyBlock && player.y + player.height < canvas.height) {
        player.grounded = false;
    }

    for (const obstacle of obstacles) {
        if (
            player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y
        ) {
            player.dead = true;
            gameRunning = false; // Stop the game loop when the player dies
            break;
        }
    }
}

function updateObstaclesAndBlocks() {
    if (!gameStarted || player.dead) return; // Stop scrolling when the player is dead

    const speed = 6; // Increased speed for obstacles and blocks

    for (const obstacle of obstacles) {
        obstacle.x -= speed; // Move obstacles faster
    }

    for (const block of jumpableBlocks) {
        block.x -= speed; // Move blocks faster
    }

    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
    jumpableBlocks = jumpableBlocks.filter(block => block.x + block.width > 0);
}

// Updated keydown handler for jumping
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !player.jumping && player.grounded && !player.dead) {
        player.dy = player.jumpStrength;
        player.grounded = false;
        player.jumping = true; // Prevent multiple jumps
    }
});

// Reset jumping flag on keyup
document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        player.jumping = false;
    }
});