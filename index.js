let plinkoContainer = document.querySelector('.plinko-container');
let scoreContainer = document.querySelector('.Score-container');
const canvas = document.getElementById('gameCanvas');
canvas.width = 600;
canvas.height = 600;
const numOfRows = 10;
const ctx = canvas.getContext('2d');
let keys = {
  ArrowRight: false,
  ArrowLeft: false,
  space: false
};
let dropped = false;
let positions = [];
const start = { x: canvas.width / 2, y: 50 };
let score = 0;

const DECIMAL_MULTIPLIER = 10000;

function pad(n) {
    return n * DECIMAL_MULTIPLIER;
}

function unpad(n) {
    return Math.floor(n / DECIMAL_MULTIPLIER);
}

class Game {
constructor({ x, y, radius, friction }) {
this.x = pad(x);
this.y = pad(y);
this.radius = radius;
this.friction = friction || 1;
this.startAngle = 0;
this.endAngle = 2 * Math.PI;
}
draw() {
ctx.beginPath();
ctx.fillStyle = "#5DADE2";
ctx.arc(unpad(this.x), unpad(this.y), this.radius, this.startAngle, this.endAngle);
ctx.fill();
ctx.closePath();
    }
}

class Sink {
    constructor({ x, y, width, height, value }) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.value = value;
    }
    draw() {
    ctx.fillStyle = "#F5B041";  
    ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }
}

function CreateGameBoard({ step }) {
    positions = [];
    for (let row = 0; row < numOfRows; row++) {
    const numCols = row + 3; 
    const y = start.y + row * step;
    const spacing = step * 0.9; 
    for (let col = 0; col < numCols; col++) {
        const x = start.x - spacing * ((numCols - 1) / 2 - col);
        const friction = 0.7 + Math.random() * 0.3; 
        positions.push({ x, y, radius: 7, friction });
    }
    }
  
 const sinkWidth = step * 0.9;
 const sinkHeight = 20;
 const numSinks = numOfRows + 2; 
 for (let i = 0; i < numSinks; i++) {
 const x = start.x + (i - (numSinks - 1) / 2) * sinkWidth;
 const y = canvas.height - 50;
 const value = Math.abs(i - Math.floor(numSinks / 2)) * 100 + 100; 
 positions.push(new Sink({ x, y, width: sinkWidth - 4, height: sinkHeight, value }));
}
}

class Player {
    constructor() {
    this.x = pad(canvas.width / 2);
    this.y = pad(50);
    this.radius = 8;
    this.startAngle = 0;
    this.endAngle = 2 * Math.PI;
    this.velocityX = 0;
    this.velocityY = 0;
    this.acceleration = pad(0.2);
    this.horizontalFriction = 0.4;
    this.verticalFriction = 0.8;
    this.velocity = 2; 
    }
    draw() {
    ctx.beginPath();
    ctx.fillStyle = "#58D68D";  // minty green

    ctx.arc(unpad(this.x), unpad(this.y), this.radius, this.startAngle, this.endAngle);
    ctx.fill();
    ctx.closePath();
    }
    update() {
    if (!dropped) {
        if (keys.ArrowRight && unpad(this.x) < canvas.width - this.radius) {
        this.x += pad(this.velocity);
        }
        if (keys.ArrowLeft && unpad(this.x) > this.radius) {
        this.x -= pad(this.velocity);
        }
    } else {
    this.velocityY += this.acceleration;
    this.x += this.velocityX;
    this.y += this.velocityY;

    for (let i = 0; i < positions.length; i++) {
    const element = positions[i];
    if (!(element instanceof Sink)) {
        const dist = Math.hypot(this.x - pad(element.x), this.y - pad(element.y));
        if (dist < pad(this.radius + element.radius)) {
        const angle = Math.atan2(this.y - pad(element.y), this.x - pad(element.x));
        const speed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
        this.velocityX = Math.cos(angle) * speed * element.friction * this.horizontalFriction;
        this.velocityY = Math.sin(angle) * speed * element.friction * this.verticalFriction;
        const overlap = this.radius + element.radius - unpad(dist);
        this.x += pad(Math.cos(angle) * overlap);
        this.y += pad(Math.sin(angle) * overlap);
        break;
        }
    }
    }
    positions.forEach(element => {
    if (element instanceof Sink) {
        if (
        unpad(this.x) > element.x - element.width / 2 &&
        unpad(this.x) < element.x + element.width / 2 &&
        unpad(this.y) + this.radius > element.y - element.height / 2 &&
        unpad(this.y) - this.radius < element.y + element.height / 2
        ) {
        this.velocityX = 0;
        this.velocityY = 0;
        score += element.value;
        document.getElementById('score').textContent = score;
        this.x = pad(canvas.width / 2);
        this.y = pad(50);
        dropped = false;
        keys.space = false;
        }
    }
    });

    if (unpad(this.x) < this.radius) {
    this.x = pad(this.radius);
    this.velocityX = -this.velocityX * this.horizontalFriction;
    }
    if (unpad(this.x) > canvas.width - this.radius) {
    this.x = pad(canvas.width - this.radius);
    this.velocityX = -this.velocityX * this.horizontalFriction;
    }
    if (unpad(this.y) > canvas.height - this.radius) {
    this.y = pad(canvas.height - this.radius);
    this.velocityY = -this.velocityY * this.verticalFriction;
    }
}
this.draw();
}
}

const player = new Player();

window.addEventListener("keydown", (e) => {
    e.preventDefault();
    switch (e.key) {
    case 'ArrowRight':
        keys.ArrowRight = true;
        break;
    case 'ArrowLeft':
        keys.ArrowLeft = true;
        break;
    case ' ':
        if (!keys.space) {
        dropped = true;
        keys.space = true;
        }
        break;
    }
});

window.addEventListener("keyup", (e) => {
e.preventDefault();
switch (e.key) {
case 'ArrowRight':
    keys.ArrowRight = false;
    break;
case 'ArrowLeft':
    keys.ArrowLeft = false;
    break;
}
});

CreateGameBoard({ step: 50 });

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    positions.forEach(position => {
    let gameElement = position instanceof Sink ? position : new Game(position);
    gameElement.draw();
    });
    player.update();
    requestAnimationFrame(animate);
}

animate();