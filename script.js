const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const pipeGapTop = 150;
const pipeGapBottom = 100;
const minBottomGap = 150; // Hauteur minimale du bas du deuxième trou
// const distanceBetweenGaps = 10; // Distance entre le bas du premier trou et le haut du deuxième trou
const distanceBetweenGaps = 60; // Distance entre le bas du premier trou et le haut du deuxième trou

const pipes = [];
const pipeWidth = 30;
const pipeGap = 100;
let frameCount = 0;
let score = 0;
let errors = 0;
// let isPaused = false;
let isPaused = true;
let isStarted = false;
let animationFrameId;

// easy
let pipeSpeed = 0.5; // vitesse d'arrivée des tuyaux
let pipeInterval = 500; // fréquence d'apparition des tuyaux

//medium
// let pipeSpeed = 1.05; // vitesse d'arrivée des tuyaux
// let pipeInterval = 300; // fréquence d'apparition des tuyaux

//hard
// let pipeSpeed = 1.5; // vitesse d'arrivée des tuyaux
// let pipeInterval = 125; // fréquence d'apparition des tuyaux

const questions = [
    { question: "2 = 2", answer: true },
    { question: "!(2 = 2)", answer: false },
    { question: "true & false", answer: false },
    { question: "true | false", answer: true },
    { question: "!(true & false)", answer: true },
    { question: "!(true | false)", answer: false },
    { question: "(2 > 1) & (3 < 4)", answer: true },
    { question: "(2 > 1) & (3 > 4)", answer: false },
    { question: "(2 > 1) | (3 < 4)", answer: true },
    { question: "(2 > 3) | (3 < 4)", answer: true },
    { question: "!(2 > 3) & (3 < 4)", answer: true },
    { question: "!(2 < 3) & (3 > 4)", answer: false },
    { question: "true & !false", answer: true },
    { question: "false | !true", answer: false },
    { question: "!(false | false)", answer: true },
    { question: "!((2 < 3) & (4 > 5))", answer: true },
    { question: "((2 = 2) & (3 != 3))", answer: false },
    { question: "((2 != 2) | (3 = 3))", answer: true },
    { question: "!((2 = 2) & !(3 = 3))", answer: true },
    { question: "((2 > 1) & (3 > 2) & (4 > 3))", answer: true },
    { question: "((2 > 3) | (3 > 4) | (4 > 5))", answer: false },
    { question: "!((2 = 3) | (3 = 4))", answer: true },
    { question: "((1 + 1 = 2) & (2 + 2 = 4))", answer: true },
    { question: "!((1 + 1 = 2) & (2 + 2 = 5))", answer: true },
    { question: "(5 > 3) & (2 < 4)", answer: true },
    { question: "(5 < 3) | (2 > 4)", answer: false },
    { question: "!(5 = 5)", answer: false },
    { question: "(10 >= 10) & (5 <= 5)", answer: true },
    { question: "(10 > 10) | (5 < 5)", answer: false },
    { question: "!(10 > 9) | !(5 < 6)", answer: false },
    { question: "!(10 != 10) && (3 = 3)", answer: true },
    { question: "(2 != 2) | (3 = 3)", answer: true },
    { question: "!(2 = 2) & (3 != 3)", answer: false },
    { question: "(5 > 3) & !(2 < 4)", answer: false },
    { question: "!(5 > 3) | (2 > 4)", answer: false },
    { question: "!(5 = 5) & !(3 != 3)", answer: false },
    { question: "(1 < 2) & (2 < 3) & (3 < 4)", answer: true },
    { question: "!(1 > 2) | !(2 > 3) | !(3 > 4)", answer: true },
    { question: "(1 > 2) & (2 > 3) & (3 > 4)", answer: false },
    { question: "true", answer: true },
    { question: "false", answer: false },
    { question: "!(true)", answer: false },
    { question: "!(false)", answer: true },
    { question: "2 > 1", answer: true },
    { question: "1 > 2", answer: false },
    { question: "2 = 2", answer: true },
    { question: "2 != 2", answer: false },
    { question: "3 < 4", answer: true },
    { question: "4 < 3", answer: false },
    { question: "1 + 1 = 2", answer: true },
    { question: "1 + 1 = 3", answer: false },
    { question: "5 - 2 = 3", answer: true },
    { question: "5 - 2 = 4", answer: false },
    { question: "10 >= 5", answer: true },
    { question: "5 <= 10", answer: true },
    { question: "10 < 5", answer: false },
    { question: "10 > 5", answer: true },
    { question: "'a' = 'a'", answer: true },
    { question: "'a' != 'a'", answer: false },
    { question: "3 > 2", answer: true },
    { question: "2 > 3", answer: false },
    { question: "3 = 3", answer: true },
    { question: "3 != 3", answer: false },
    { question: "4 <= 4", answer: true },
    { question: "4 >= 5", answer: false },
    { question: "5 = 5", answer: true },
    { question: "5 != 5", answer: false },
    { question: "7 - 3 = 4", answer: true },
    { question: "7 - 3 = 5", answer: false },
    { question: "2 + 2 = 4", answer: true },
    { question: "2 + 2 = 5", answer: false },
    { question: "9 >= 9", answer: true },
    { question: "9 <= 8", answer: false },
    { question: "6 * 1 = 6", answer: true },
    { question: "6 * 1 = 7", answer: false },
    { question: "8 / 4 = 2", answer: true },
    { question: "8 / 4 = 3", answer: false },
    { question: "'hello' = 'hello'", answer: true },
    { question: "'hello' = 'world'", answer: false }
];


// let currentQuestionIndex = 0;
let currentQuestionIndex = pickRandomAnswerIndex();
let incorrectAnswers = [];

function pickRandomAnswerIndex(){
    return Math.floor(Math.random() * questions.length);
}

const bird = {
    x: 50,
    y: 150,
    width: 20,
    height: 20,
    // easy
    gravity: 0.09,
    lift: -3,
    velocity: 0,

    // medium
    // gravity: 0.29,
    // lift: -5.5,

    // hard
    // gravity: 0.29,
    // lift: -5.5,
    velocity: 0,
    draw: function() {
        ctx.fillStyle = "yellow";
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
        // ctx.fillStyle = "#c2c2c2";
        ctx.fillStyle = "rgb(128, 227, 42)"; // pipes color
        // ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        ctx.fillRect(pipe.x, 0, pipeWidth, 80);

        // ctx.fillRect(pipe.x, pipe.top + pipeGapTop, pipeWidth, pipe.bottom - pipe.top - distanceBetweenGaps - pipeGapTop);
        ctx.fillRect(pipe.x, 200, pipeWidth, 80);
        
        // ctx.fillRect(pipe.x, pipe.bottom + pipeGapBottom, pipeWidth, canvas.height - pipe.bottom - pipeGapBottom);
        ctx.fillRect(pipe.x, 400, pipeWidth, canvas.height);

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
                // resetGame(); // remplacer par errors++
            } else if (!pipe.checked) {
                pipe.checked = true;

                if (bird.y > pipe.top && bird.y < pipe.top + pipeGapTop) {
                    // console.log(1);  // Passed through the top gap
                    if (correctAnswer) {
                        score++;
                        currentQuestionIndex = pickRandomAnswerIndex();
                        // currentQuestionIndex++;
                        showQuestion();
                    } else {
                        incorrectAnswers.push({ question: questions[currentQuestionIndex].question, userAnswer: true });
                        errors++;
                        // resetGame();
                    }
                } else if (bird.y > pipe.bottom && bird.y < pipe.bottom + pipeGapBottom) {
                    // console.log(2);  // Passed through the bottom gap
                    if (!correctAnswer) {
                        score++;
                        currentQuestionIndex = pickRandomAnswerIndex();
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
    // const top = Math.floor(Math.random() * (canvas.height - distanceBetweenGaps - pipeGapTop - minBottomGap - 40)) + 20;
    // const bottom = top + distanceBetweenGaps + pipeGapTop + Math.floor(Math.random() * (canvas.height - top - distanceBetweenGaps - pipeGapTop - minBottomGap - 20)) + 20;
    const top = Math.floor(Math.random() * (canvas.height - distanceBetweenGaps - pipeGapTop - minBottomGap - 40)) + 20;
    const bottom = top + distanceBetweenGaps + pipeGapTop + Math.floor(Math.random() * (canvas.height - top - distanceBetweenGaps - pipeGapTop - minBottomGap - 20)) + 20;
    // pipes.push({ x: canvas.width, top: top, bottom: bottom, checked: false });
    pipes.push({ x: canvas.width, top: 120, bottom: 250, checked: false });
}


// QUESTION
function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
        document.getElementById('congratulations-container').style.display = 'flex';
        return; // Arrête la fonction si toutes les questions ont été répondues
    }
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
    currentQuestionIndex = pickRandomAnswerIndex();
    document.getElementById('congratulations-container').style.display = 'none'; // Masque la congratulations-container
    showQuestion();
}


function drawPauseScreen() {
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgb(44, 142, 222)";
    ctx.font = "600 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Press Enter to Start", canvas.width / 2, canvas.height / 2);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isStarted) {
        bird.draw();
        
        ctx.fillStyle = "rgb(31, 122, 196)";
        ctx.font = "15px Arial"; // Assurez-vous que la taille de la police est réinitialisée ici
        ctx.textAlign = "left";
        
        ctx.fillText("Score: " + score, 10, 20);
        ctx.fillText("Erreurs: " + errors, 10, 40)

        drawPauseScreen();
    } else {
        bird.draw();
        bird.update();

        if (frameCount % pipeInterval === 0) { // fréquence des tuyaux
            addPipe();
        }

        drawPipes();
        ctx.fillStyle = "rgb(31, 122, 196)";
        ctx.font = "15px Arial"; // Assurez-vous que la taille de la police est réinitialisée ici
        ctx.textAlign = "left";
        
        ctx.fillText("Score: " + score, 10, 20);
        ctx.fillText("Erreurs: " + errors, 10, 40);

        frameCount++;
    }

    animationFrameId = requestAnimationFrame(draw);
}

document.addEventListener("keydown", function(event) {
    if(!isStarted && event.key === 'Enter') {
        isStarted = true;
        isPaused = false;
    }
    if (event.code === "Space" && !isPaused) {
        bird.flap();
    } else if (event.code === "KeyP") {
        isPaused = !isPaused;
        console.log("is paused ? " + isPaused);
        document.getElementById('controls').style.display = isPaused ? "flex" : "none";
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


// MODES DE DIFFICULTE
const easyMode = document.getElementById('easyMode');
const mediumMode = document.getElementById('mediumMode');
const hardMode = document.getElementById('hardMode');

easyMode.addEventListener('change', function() {
    if (this.checked) {
        setDifficulty('easy');
    }
});

mediumMode.addEventListener('change', function() {
    if (this.checked) {
        setDifficulty('medium');
    }
});

hardMode.addEventListener('change', function() {
    if (this.checked) {
        setDifficulty('hard');
    }
});

function setDifficulty(level) {
    switch (level) {
        case 'easy':
            bird.gravity = 0.09;
            bird.lift = -3;
            pipeSpeed = 0.5;
            pipeInterval = 500;
            // Met à jour les sliders
            document.getElementById('gravityControl').value = 0.09;
            document.getElementById('liftControl').value = 4; // Correspond à -3
            document.getElementById('speedControl').value = 0.5;
            document.getElementById('frequencyControl').value = 1; // Correspond à 500
            break;
        case 'medium':
            bird.gravity = 0.29;
            bird.lift = -5.5;
            pipeSpeed = 1.05;
            pipeInterval = 300;
            // Met à jour les sliders
            document.getElementById('gravityControl').value = 0.29;
            document.getElementById('liftControl').value = 7; // Correspond à -5.6
            document.getElementById('speedControl').value = 1.05;
            document.getElementById('frequencyControl').value = 6; // Correspond à 300
            break;
        case 'hard':
            bird.gravity = 0.5;
            bird.lift = -7;
            pipeSpeed = 1.5;
            pipeInterval = 200;
            // Met à jour les sliders
            document.getElementById('gravityControl').value = 0.5;
            document.getElementById('liftControl').value = 9; // Correspond à -7.2
            document.getElementById('speedControl').value = 1.5;
            document.getElementById('frequencyControl').value = 9; // Correspond à 200
            break;
    }
}



// SLIDERS

// Convertir la valeur du slider en la valeur réelle de lift
liftControl.addEventListener("input", function() {
    const value = parseInt(this.value);
    bird.lift = value * -0.8; // Convertit les valeurs internes en lift de -0.8 à -8
});

// FREQUENCES DES PIPES
frequencyControl.addEventListener("input", function() {
    const freq = parseInt(this.value);
    pipeInterval = 550 - (freq - 1) * 50; // Convertit les niveaux 1 à 10 en intervalle 550 à 100
});

// GRAVITE DE L'OISEAU
gravityControl.addEventListener("input", function() {
    bird.gravity = parseFloat(this.value);
});

// VITESSE DES PIPES
speedControl.addEventListener("input", function() {
    pipeSpeed = parseFloat(this.value);
});

// Initialiser les sliders sur le mode facile au début du jeu
setDifficulty('easy');
resetGame();
showQuestion();
animationFrameId = requestAnimationFrame(draw);

