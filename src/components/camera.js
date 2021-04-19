import {
	PerspectiveCamera
} from '../../build/three.module.js';

function createCamera(scene) {

	const cameraY = 20

	const cameraZ = 0 //BEGIN
	// const cameraZ = 40 //BEGIN
	// const cameraZ = -350 // ZEN
	// const cameraZ = -400 /// ZEN
	// const cameraZ = -600 // ZEN
	// const cameraZ = -250 // ZEN
	// const cameraZ = -700 // Temple Out
	// const cameraZ = -1000 // Temple In
	// const cameraZ = -2350 // Temple In
	// const cameraZ = -1900 // Temple In

	const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1500);
	const camPos = new PerspectiveCamera(65, window.innerWidth / window.innerHeight, 1, 1500);
	camera.position.set(0, cameraY, cameraZ)

	scene.add(camera)
	scene.add(camPos)

	return camera
}

export {
	createCamera
}
