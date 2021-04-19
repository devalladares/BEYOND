let c1
let refresh
let c = []
let ringNumber = 8
const gap = 20
const emptySpace = 10


function setup() {
	var c = createCanvas(windowWidth, windowHeight);
	c.parent('p5Div');

	refresh = createButton('Refresh');
	refresh.position(width / 2, height - 50)
	refresh.mousePressed(runSketch);

}

function runSketch() {

	for (let i = 0; i < ringNumber; i++) {
		c[i] = new circleRing(i * gap + emptySpace, ringNumber * gap + emptySpace)
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

function draw() {
	// background(0);
	clear()
	strokeCap(SQUARE);

	// print(frameRate())

	push()
	translate(windowWidth / 2, windowHeight / 2)

	for (let i = 1; i < c.length; i++) {
		c[i].update()
	}

	pop()

	if (frameCount % 100 === 0 || frameCount === 1) {
		runSketch()
	}
}

class circleRing {
	constructor(radius, bigRadius) {
		//general
		this.random = random(0, 13)


		//cirler
		this.bigRadius = bigRadius
		this.rotate = random(0.0005, 0.0001)
		// this.rotate = 0.00025
		this.r = random(1, 20)
		this.r2 = random(1, 20)
		this.num = round(random(10, 50))
		this.radius = radius
		this.stroke = random(0, 255)
		this.fill = random(0, 255)
		this.alpha = random(0, 100)
		this.angle = TAU / this.num

		//liner
		this.lineNum = random(1, 10)
		this.lineStroke = random(0.1, 2)

		//radianter
		this.radNum = random(10, this.radius)
		this.radAngle = TAU / this.radNum
		this.radius1 = this.radius
		this.radius2 = this.radius - random(5, 50)

		//petaler
		this.petNum = round(random(10, 50))
		// this.petNum = round(random(1,10))
		this.petSize = random(2, 20)
		this.petAngle = TAU / this.petNum
		this.petRadius = random(5, 20)
		this.petStroke = this.petRadius / 2

		//squarer
		this.squareNum = round(random(5, 40))
		this.squareSize = random(1, 10)
		this.squareAngle = TAU / this.squareNum
		this.squareRand = round(random(1, 2))

	}

	style() {
		// stroke(this.stroke)
		// fill(this.fill)
		noStroke()
		fill(255)
		// stroke(0)
		// noFill()
	}


	update() {

		this.style()
		this.outliner()

		if (this.random < 2) {
			this.circler()
		} else if (this.random > 2 && this.random < 6) {
			this.liner()
		} else if (this.random > 6 && this.random < 10) {
			this.radianter()
		} else if (this.random > 10 && this.random < 11) {
			// this.petaler()
		} else if (this.random > 11 && this.random < 13) {
			this.squarer()
		}

		// this.squarer()


	}

	//cirler////cirler////cirler////cirler////cirler////cirler//
	circler() {
		rotate(frameCount * this.rotate)

		noStroke()
		fill(255)

		for (let i = 0; i < this.num; i++) {

			this.x = sin(i * this.angle) * this.radius
			this.y = cos(i * this.angle) * this.radius

			ellipse(this.x, this.y, this.r)
		}
	}

	//liner////liner////liner////liner////liner////liner//
	liner() {

		stroke(255)
		noFill()
		strokeWeight(this.lineStroke)

		for (let i = 0; i < this.lineNum; i++) {

			// let y = abs(sin(i * 0.02 - frameCount * 0.005) * 255)
			// stroke(y)

			// circle(0, 0, (this.radius * 2) - (i * this.lineNum / 2) + (i * this.lineNum))
			circle(0, 0, (this.radius * 2) - (i * this.lineNum / 2) + (i * this.lineNum))
		}
	}

	//radianter////radianter////radianter////radianter////radianter////radianter//
	radianter() {

		rotate(frameCount * this.rotate)
		stroke(255)
		strokeWeight(this.lineStroke)

		for (let i = 0; i < 50; i++) {

			this.x1 = cos(i * this.angle) * this.radius1
			this.y1 = sin(i * this.angle) * this.radius1
			this.x2 = cos(i * this.angle) * this.radius2
			this.y2 = sin(i * this.angle) * this.radius2

			line(this.x1, this.y1, this.x2, this.y2)
		}
	}

	//squarer////squarer////squarer////squarer////squarer////squarer//
	squarer() {

		// this.squareNum = round(random(10, 50))
		// this.squareSize = random(1, 20)
		// this.squareAngle = TAU / this.squareNum

		this.numm = 30


		fill(255)
		noStroke()
		rectMode(CENTER)

		for (let i = 0; i < this.squareNum; i++) {

			push()
			translate(this.radius, 0)
			if (this.squareRand === 2) {
				rotate(radians(45))
			}

			rect(0, 0, this.squareSize, this.squareSize)

			pop()
			rotate(this.squareAngle)


		}
	}

	//petaler////petaler////petaler////petaler////petaler////petaler//
	petaler() {

		fill(255)
		noStroke()


		for (let i = 0; i < this.petNum; i++) {

			let x = sin(this.petAngle * i) * this.radius
			let y = cos(this.petAngle * i) * this.radius

			ellipse(x, y, this.petRadius)
		}

		stroke(255)
		noFill()
		strokeWeight(this.petStroke)
		ellipse(0, 0, this.radius * 2 - this.petRadius)
	}


	outliner() {

		strokeWeight(this.lineStroke)
		// strokeWeight(1)
		noFill()
		stroke('white')
		circle(0, 0, this.bigRadius * 2)

	}
}
