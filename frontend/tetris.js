const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d'); // return 2d rendering context

context.scale(20, 20);

function arenaSweep() {
	outer: for (let y = arena.length - 1; y > 0; y--) {
		for (let x = 0; x < arena[y].length; x++) {
			if (arena[y][x] === 0) {
				continue outer;
			}
		}
		const row = arena.splice(y, 1)[0].fill(0);
		arena.unshift(row);
		++y;
	}
		
}

function collide(arena, player) {
	const [m, o] = [player.matrix, player.pos]; // matrix, offset
	for (let y = 0; y < m.length; y++) {
		for (let x = 0; x < m[y].length; x++) {
			if (m[y][x] !== 0 && (arena[y + Math.ceil(o.y)] && arena[y + Math.ceil(o.y)][x + Math.ceil(o.x)]) !== 0) {
				return true;
			}
		}
	}	
	return false;
}

function createMatrix(w, h) {
	const matrix = [];
	while (h--) {
		matrix.push(new Array(w).fill(0));
	}
	return matrix;
}

function createPiece(type) {
	if (type === 'T') {
		return [
			[0, 0, 0],
			[1, 1, 1],
			[0, 1, 0],
		];
	} else if (type === 'O') {
		return [
			[2, 2],
			[2, 2],
		];
	} else if (type === 'L') {
		return [
			[0, 3, 0],
			[0, 3, 0],
			[0, 3, 3],
		];
	} else if (type === 'J') {
		return [
			[0, 4, 0],
			[0, 4, 0],
			[4, 4, 0],
		];
	} else if (type === 'I') {
		return [
			[0, 5, 0, 0],
			[0, 5, 0, 0],
			[0, 5, 0, 0],
			[0, 5, 0, 0],
		];
	} else if (type === 'S') {
		return [
			[0, 6, 6],
			[6, 6, 0],
			[0, 0, 0],
		];
	} else if (type === 'Z') {
		return [
			[7, 7, 0],
			[0, 7, 7],
			[0, 0, 0],
		];
	}
}

function draw() {
	context.fillStyle = '#000';
	context.fillRect(0, 0, canvas.width, canvas.height);
	drawMatrix(arena, { x: 0, y: 0 });
	drawMatrix(player.matrix, player.pos);
}

const drawMatrix = (matrix, offset) => {
	matrix.forEach((row, y) => { // y is index of row
		row.forEach((value, x) => {
			if (value !== 0) {
				context.fillStyle = colors[value];
				context.fillRect(x + offset.x, y + offset.y, 1, 1); // draw rectangle at x, y with width 1, height 1
			}
		});
	});
}

function merge(arena, player) {
	player.matrix.forEach((row, y) => {
		row.forEach((value, x) => {
			if (value !== 0) {
				arena[y + Math.ceil(player.pos.y)][x + Math.ceil(player.pos.x)] = value;
			}
		});
	});

}

function playerDrop(del) {
	player.pos.y += del;
	if (collide(arena, player)) {
		player.pos.y -= del;
		merge(arena, player);
		playerReset();
		arenaSweep();
	}
	dropCounter = 0;
}

function playerMove(dir) {
	player.pos.x += dir;
	if (collide(arena, player)) {
		player.pos.x -= dir;
	}
}

function playerReset() {
	const pieces = 'ILJOTSZ';
	player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
	player.pos.y = 0;
	player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
	if (collide(arena, player)) {
		arena.forEach(row => row.fill(0));
	}
}

function playerRotate(dir) {
	const pos = player.pos.x;
	let offset = 1;
	rotate(player.matrix, dir);
	while (collide(arena, player)) {
		player.pos.x += offset;
		offset = -(offset + (offset > 0 ? 1 : -1));
		if (offset > player.matrix[0].length) {
			rotate(player.matrix, -dir);
			player.pos.x = 5;
			return;
		}
	}
}

function rotate(matrix, dir) {
	for (let y = 0; y < matrix.length; y++) {
		for (let x = 0; x < y; x++) {
			[
				matrix[x][y],
				matrix[y][x],
			] = [
				matrix[y][x],
				matrix[x][y],
			];
		}
	}

	if (dir > 0) {
		matrix.forEach(row => row.reverse());
	} else {
		matrix.reverse();
	}

}
let dropCounter = 0;
let dropInterval = 30; // 1 second

let lastTime = 0;

function update(time = 0) { // time served by requestAnimationFrame
	const deltaTime = time - lastTime;
	lastTime = time;

	dropCounter += deltaTime;
	if (dropCounter > dropInterval) {
		playerDrop(0.1);
	}
	draw();
	requestAnimationFrame(update); // update the canvas. It can make fluent movement
}

const colors = [
	null,
	'red',
	'blue',
	'violet',
	'green',
	'purple',
	'orange',
	'pink',
];


const arena = createMatrix(12, 20);

const player = {
	pos: { x: 0, y: 0 },
	matrix: null,
}

// keycode w: 87 a: 65 s: 83 d: 68
document.addEventListener('keydown', event => {
	if (event.keyCode === 65) {
		playerMove(-1);
	} else if (event.keyCode === 68) {
		playerMove(1);
	} else if (event.keyCode === 83) {
		playerDrop(1);
	} else if (event.keyCode === 69) {
		playerRotate(1);
	} else if (event.keyCode === 81) {
		playerRotate(-1);
	}
});

playerReset();
update(); // start the game
