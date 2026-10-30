
const dino = document.getElementById("dino");
const obstacles = document.getElementById("obstacles");
const scoreText = document.getElementById("score");
const bestText = document.getElementById("best");
const message = document.getElementById("message");
const startBtn = document.getElementById("startBtn");
const gameArea = document.querySelector(".game");
const gameJump = document.getElementById("gameJump");

let running = false;
let score = 0;
let best = 0;

let cactus = null;
let cactusX = 0;
let cactusY = 0;

let jumping = false;
let jumpVelocity = 0;

let speed = 3;
let lastTime = 0;
let animationId = null;

// Load saved best score
try {
    best = Number(localStorage.getItem("jumpingCactusBest")) || 0;
} catch (e) {
    best = 0;
}

bestText.textContent = best;

// Initialize clouds
document.querySelectorAll(".cloud").forEach(cloud => {
    cloud.dataset.x = cloud.offsetLeft;
});

// =====================================
// CREATE BIGGER CACTUS
// =====================================

function createCactus() {

    obstacles.replaceChildren();

    cactus = document.createElement("div");
    cactus.className = "cactus";
    cactus.textContent = "🌵";

    cactusX = gameArea.clientWidth + 20;
    cactusY = 0;

    cactus.style.left = cactusX + "px";
    cactus.style.bottom = "35px";

    // Bigger cactus size
    cactus.style.fontSize = "75px";
    cactus.style.lineHeight = "1";
    cactus.style.width = "65px";
    cactus.style.height = "85px";

    obstacles.appendChild(cactus);
}

// =====================================
// START OR RESTART GAME
// =====================================

function startGame() {

    if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    running = true;
    score = 0;
    speed = 3;

    jumping = false;
    jumpVelocity = 0;

    lastTime = 0;

    scoreText.textContent = score;

    message.style.display = "none";
    message.classList.remove("sad-screen");

    createCactus();

    animationId = requestAnimationFrame(gameLoop);
}

// =====================================
// JUMP FUNCTION
// =====================================

function jumpCactus() {

    if (!running || jumping || !cactus) return;

    jumping = true;
    jumpVelocity = 14;
}

// =====================================
// COLLISION DETECTION
// =====================================

function checkCollision() {

    if (!cactus) return false;

    const dinoBox = dino.getBoundingClientRect();
    const cactusBox = cactus.getBoundingClientRect();

    const padding = 12;

    return (
        dinoBox.left + padding < cactusBox.right - padding &&
        dinoBox.right - padding > cactusBox.left + padding &&
        dinoBox.top + padding < cactusBox.bottom - padding &&
        dinoBox.bottom - padding > cactusBox.top + padding
    );
}

// =====================================
// MOVE CLOUDS
// =====================================

function animateClouds(delta) {

    document.querySelectorAll(".cloud").forEach(cloud => {

        let x = Number(cloud.dataset.x);

        if (!Number.isFinite(x)) {
            x = cloud.offsetLeft;
        }

        const cloudSpeed =
            cloud.classList.contains("cloud-one") ? 0.45 : 0.25;

        x -= cloudSpeed * delta;

        if (x < -150) {
            x = gameArea.clientWidth + 30;
        }

        cloud.dataset.x = x;
        cloud.style.left = x + "px";
    });
}

// =====================================
// MAIN GAME LOOP
// =====================================

function gameLoop(timestamp) {

    if (!running) return;

    if (!lastTime) lastTime = timestamp;

    const delta = Math.min((timestamp - lastTime) / 16.67, 2);

    lastTime = timestamp;

    // Move background clouds
    animateClouds(delta);

    // Move cactus toward dinosaur
    cactusX -= speed * delta;

    // Jump physics
    if (jumping) {

        cactusY += jumpVelocity * delta;

        jumpVelocity -= 0.45 * delta;

        if (cactusY <= 0 && jumpVelocity < 0) {

            cactusY = 0;
            jumping = false;
            jumpVelocity = 0;
        }
    }

    // Update cactus position
    cactus.style.left = cactusX + "px";
    cactus.style.bottom = (35 + cactusY) + "px";

    // Check collision
    if (checkCollision()) {

        endGame();
        return;
    }

    // Score when cactus passes dinosaur
    if (cactusX + cactus.offsetWidth < dino.offsetLeft) {

        score++;

        scoreText.textContent = score;

        if (score > best) {

            best = score;
            bestText.textContent = best;

            try {
                localStorage.setItem("jumpingCactusBest", best);
            } catch (e) {
                // Saving score is optional
            }
        }

        // Create another cactus
        createCactus();

        // Increase speed gradually
        speed = Math.min(speed + 0.2, 6);
    }

    animationId = requestAnimationFrame(gameLoop);
}

// =====================================
// GAME OVER SCREEN
// =====================================

function endGame() {

    running = false;
    animationId = null;

    message.style.display = "flex";
    message.classList.add("sad-screen");

    message.innerHTML = `
        <div class="sad-dino">WAWA MAN!</div>

        <h1 class="sad-title">TALO!</h1>

        <p class="sad-subtitle">na prendzone! 💔</p>

        <p class="final-score">
            Your Score: <strong>${score}</strong>
        </p>

        <p class="encourage">
            Don't be sad. Hende moko namimiss dhai? 🥺
        </p>

        <button id="restartBtn">Usa pa?</button>
    `;

    document.getElementById("restartBtn")
        .addEventListener("click", startGame);
}

// =====================================
// KEYBOARD CONTROLS
// =====================================

document.addEventListener("keydown", event => {

    if (event.code === "Space") {

        event.preventDefault();

        if (event.repeat) return;

        if (!running) {
            startGame();
        } else {
            jumpCactus();
        }
    }
});

// =====================================
// START BUTTON
// =====================================

startBtn.addEventListener("click", startGame);

// =====================================
// MOBILE JUMP BUTTON
// =====================================

gameJump.addEventListener("pointerdown", event => {

    event.preventDefault();

    if (!running) {
        startGame();
    } else {
        jumpCactus();
    }
});
