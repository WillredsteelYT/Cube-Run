function loadLevelData(levelData) {
    obstacles = levelData.filter(obj => obj.type === 'spike').map(spike => ({
        x: spike.x,
        y: spike.y,
        width: 40,
        height: 40,
        hitbox: { // Define a smaller hitbox for the spike
            x: spike.x + 10, // Offset for a narrower hitbox
            y: spike.y + 30, // Hitbox closer to the base
            width: 20,       // Narrow width
            height: 10       // Small height
        }
    }));
    jumpableBlocks = levelData.filter(obj => obj.type === 'block').map(block => ({
        x: block.x,
        y: block.y,
        width: 40,
        height: 40
    }));
    resetPlayer();
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
        const { hitbox } = obstacle;

        if (hitbox && // Use the smaller hitbox for collision detection
            player.x < hitbox.x + hitbox.width &&
            player.x + player.width > hitbox.x &&
            player.y < hitbox.y + hitbox.height &&
            player.y + player.height > hitbox.y
        ) {
            player.dead = true;
            gameRunning = false; // Stop the game loop when the player dies
            break;
        }
    }
}