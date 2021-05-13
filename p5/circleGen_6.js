let c1

let refresh
let c = []

let ringNumber = 5
const gap = 10
const emptySpace = 10

const moverY = 230

let color = 255
// color = 0

let scaler = 1
let strokerboi = 1


function setup() {
	var c = createCanvas(windowWidth, windowHeight);
	c.parent('p5Div');
	runSketch()
}

function windowResized() {
	canvas = resizeCanvas(windowWidth, windowHeight);
}

function runSketch() {

	for (let i = 0; i < ringNumber; i++) {
		c[i] = new circleRing(i * gap + emptySpace, ringNumber * gap + emptySpace)
	}
}

function draw() {
	clear()

	push()
	translate(width / 2, height / 2 - moverY)
	scale(scaler)


	for (let i = 1; i < c.length; i++) {
		c[i].update()
	}

	pop()

	if (frameCount % 150 === 0) {
		runSketch()
	}
}

class circleRing {
	constructor(radius, bigRadius) {

		this.random = random(0, 22)

		//cirler
		this.bigRadius = bigRadius
		this.rotate = 0.00025
		// this.rotate = 0.00025
		this.r = 3
		this.r2 = 10
		this.num = round(random(10, 30))
		this.circNum = round(random(10, 30))
		this.radius = radius
		this.angle = TAU / this.num
		this.circAngle = TAU / this.circNum

		//liner
		this.lineNum = random(15, 50)
		this.lineStroke = strokerboi

		//radianter
		this.lineLength = 30
		this.radius1 = this.radius + this.lineLength / 5
		this.radius2 = this.radius - this.lineLength / 5

		//squarer
		this.squareNum = round(random(20, 30))
		this.squareSize = round(random(4, 7))
		this.squareAngle = TAU / this.squareNum
		this.squareRand = random(0, 2)

	}

	style() {
		noStroke()
		fill(color)
	}


	update(pos) {

		this.style()

		if (this.random < 10) {
			this.liner()
		} else if (this.random > 10 && this.random < 14) {
			this.circler()
		} else if (this.random > 14 && this.random < 18) {
			this.radianter()
		} else if (this.random > 18 && this.random < 22) {
			this.squarer()
		}

		this.outliner()
	}

	//cirler////cirler////cirler////cirler////cirler////cirler//
	circler() {
		rotate(frameCount * this.rotate)

		noStroke()
		fill(color)

		for (let i = 0; i < this.circNum; i++) {

			this.x = sin(i * this.circAngle) * this.radius
			this.y = cos(i * this.circAngle) * this.radius

			ellipse(this.x, this.y, this.r)
		}
	}

	//liner////liner////liner////liner////liner////liner//
	liner() {

		stroke(color)
		noFill()
		strokeWeight(this.lineStroke)

		circle(0, 0, (this.radius * 2))

		// for (let i = 0; i < this.lineNum; i++) {
		//
		// 	circle(0, 0, (this.radius * 2) - (i * this.lineNum / 2) + (i * this.lineNum / 2))
		//
		// }
	}

	//radianter////radianter////radianter////radianter////radianter////radianter//
	radianter() {

		rotate(frameCount * this.rotate)
		stroke(color)
		strokeWeight(this.lineStroke)
		strokeCap(SQUARE)

		for (let i = 0; i < this.num; i++) {

			this.x1 = cos(i * this.angle) * this.radius1
			this.y1 = sin(i * this.angle) * this.radius1
			this.x2 = cos(i * this.angle) * this.radius2
			this.y2 = sin(i * this.angle) * this.radius2

			line(this.x1, this.y1, this.x2, this.y2)
		}
	}

	//squarer////squarer////squarer////squarer////squarer////squarer//
	squarer() {

		fill(color)
		noStroke()
		rectMode(CENTER)
		rotate(frameCount * this.rotate)

		for (let i = 0; i < this.squareNum; i++) {

			push()
			translate(this.radius, 0)
			if (this.squareRand <= 1) {
				rotate(radians(45))
			}
			rect(0, 0, this.squareSize, this.squareSize)

			pop()
			rotate(this.squareAngle)
		}
	}

	outliner() {
		strokeWeight(this.lineStroke)
		noFill()
		stroke(color)
		circle(0, 0, this.bigRadius * 2)
	}
}
