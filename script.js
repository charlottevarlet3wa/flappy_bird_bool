const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const pipeGapTop = 100;
const pipeGapBottom = 100;
const minBottomGap = 150; // Hauteur minimale du bas du deuxième trou
const distanceBetweenGaps = 10; // Distance entre le bas du premier trou et le haut du deuxième trou

const pipes = [];
const pipeWidth = 30;
const pipeGap = 100;
let frameCount = 0;
let score = 0;
let errors = 0;
let isPaused = false;
let animationFrameId;

let pipeSpeed = 0.5; // vitesse d'arrivée des tuyaux
let pipeInterval = 500; // fréquence d'apparition des tuyaux


const questions = [
    { question: "2 == 2", answer: true },
    { question: "!(2 == 2)", answer: false },
    { question: "true && false", answer: false },
    { question: "true || false", answer: true },
    { question: "!(true && false)", answer: true },
    { question: "!(true || false)", answer: false },
    { question: "(2 > 1) && (3 < 4)", answer: true },
    { question: "(2 > 1) && (3 > 4)", answer: false },
    { question: "(2 > 1) || (3 < 4)", answer: true },
    { question: "(2 > 3) || (3 < 4)", answer: true },
    { question: "!(2 > 3) && (3 < 4)", answer: true },
    { question: "!(2 < 3) && (3 > 4)", answer: false },
    { question: "true && !false", answer: true },
    { question: "false || !true", answer: false },
    { question: "!(false || false)", answer: true },
    { question: "!((2 < 3) && (4 > 5))", answer: true },
    { question: "((2 == 2) && (3 != 3))", answer: false },
    { question: "((2 != 2) || (3 == 3))", answer: true },
    { question: "!((2 == 2) && !(3 == 3))", answer: true },
    { question: "((2 > 1) && (3 > 2) && (4 > 3))", answer: true },
    { question: "((2 > 3) || (3 > 4) || (4 > 5))", answer: false },
    { question: "!((2 == 3) || (3 == 4))", answer: true },
    { question: "((1 + 1 == 2) && (2 + 2 == 4))", answer: true },
    { question: "!((1 + 1 == 2) && (2 + 2 == 5))", answer: true },
];

let currentQuestionIndex = 0;
let incorrectAnswers = [];

const bird = {
    x: 50,
    y: 150,
    width: 20,
    height: 20,
    gravity: 0.09,
    lift: -3,
    velocity: 0,
    draw: function() {
        ctx.fillStyle = "pink";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },
    update: function() {
        this.velocity += this.gravity;
        this.y += this.velocity;

        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.velocity = 0;
        }

        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
    },
    flap: function() {
        this.velocity = this.lift;
    }
};

function drawPipes() {
    for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];
        ctx.fillStyle = "#c2c2c2";
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        ctx.fillRect(pipe.x, pipe.top + pipeGapTop, pipeWidth, pipe.bottom - pipe.top - distanceBetweenGaps - pipeGapTop);
        ctx.fillRect(pipe.x, pipe.bottom + pipeGapBottom, pipeWidth, canvas.height - pipe.bottom - pipeGapBottom);

        pipe.x -= pipeSpeed;

        if (pipe.x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }

        if (
            bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x
        ) {
            let correctAnswer = questions[currentQuestionIndex].answer;

            if (bird.y < pipe.top || (bird.y > pipe.top + pipeGapTop && bird.y < pipe.bottom - distanceBetweenGaps) || bird.y > pipe.bottom + pipeGapBottom) {
                resetGame();
            } else if (!pipe.checked) {
                pipe.checked = true;

                if (bird.y > pipe.top && bird.y < pipe.top + pipeGapTop) {
                    console.log(1);  // Passed through the top gap
                    if (correctAnswer) {
                        score++;
                        currentQuestionIndex++;
                        showQuestion();
                    } else {
                        incorrectAnswers.push({ question: questions[currentQuestionIndex].question, userAnswer: true });
                        errors++;
                        // resetGame();
                    }
                } else if (bird.y > pipe.bottom && bird.y < pipe.bottom + pipeGapBottom) {
                    console.log(2);  // Passed through the bottom gap
                    if (!correctAnswer) {
                        score++;
                        currentQuestionIndex++;
                        showQuestion();
                    } else {
                        incorrectAnswers.push({ question: questions[currentQuestionIndex].question, userAnswer: false });
                        errors++;
                        // resetGame();
                    }
                }
            }
        }
    }
}

function addPipe() {
    const top = Math.floor(Math.random() * (canvas.height - distanceBetweenGaps - pipeGapTop - minBottomGap - 40)) + 20;
    const bottom = top + distanceBetweenGaps + pipeGapTop + Math.floor(Math.random() * (canvas.height - top - distanceBetweenGaps - pipeGapTop - minBottomGap - 20)) + 20;
    pipes.push({ x: canvas.width, top: top, bottom: bottom, checked: false });
}


// QUESTION
function showQuestion() {
    const questionDiv = document.getElementById("question");
    questionDiv.innerText = questions[currentQuestionIndex].question;
}

function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes.length = 0;
    score = 0;
    errors = 0;
    frameCount = 0;
    currentQuestionIndex = 0;
    showQuestion();
}

function drawPauseScreen() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("PAUSE", canvas.width / 2, canvas.height / 2);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#000";
    ctx.font = "15px Arial"; // Assurez-vous que la taille de la police est réinitialisée ici
    ctx.textAlign = "left";

    if (isPaused) {
        drawPauseScreen();
    } else {
        bird.draw();
        bird.update();

        if (frameCount % pipeInterval === 0) { // fréquence des tuyaux
            addPipe();
        }

        drawPipes();

        ctx.fillText("Score: " + score, 10, 20);
        ctx.fillText("Erreurs: " + errors, 10, 40);

        frameCount++;
    }

    animationFrameId = requestAnimationFrame(draw);
}

canvas.addEventListener("click", function() {
    if (!isPaused) {
        bird.flap();
    }
});

document.addEventListener("keydown", function(event) {
    if (event.code === "Space" && !isPaused) {
        bird.flap();
    } else if (event.code === "KeyP") {
        isPaused = !isPaused;
        document.getElementById('controls').style.display = isPaused ? "block" : "none";
        if (isPaused) {
            cancelAnimationFrame(animationFrameId); // Arrête l'animation
        } else {
            animationFrameId = requestAnimationFrame(draw); // Redémarre l'animation
        }
    }
});

// FREQUENCES DES PIPES
frequencyControl.addEventListener("input", function() {
    pipeInterval = parseInt(this.value);
});

// LIFT DE L'OISEAU
liftControl.addEventListener("input", function() {
    bird.lift = parseFloat(this.value);
});

// GRAVITE DE L'OISEAU
gravityControl.addEventListener("input", function() {
    bird.gravity = parseFloat(this.value);
});

// VITESSE DES PIPES
speedControl.addEventListener("input", function() {
    pipeSpeed = parseFloat(this.value);
});

resetGame();
showQuestion();
animationFrameId = requestAnimationFrame(draw);
