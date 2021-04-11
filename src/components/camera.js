import {
	PerspectiveCamera
} from '../../build/three.module.js';

function createCamera(scene) {

	const cameraY = 20

	// const cameraZ = 0 //BEGIN
	const cameraZ = 40 //BEGINœ
	// const cameraZ = -400 // ZEN

	const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
	const camPos = new PerspectiveCamera(65, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(0, cameraY, cameraZ)

	scene.add(camera)
	scene.add(camPos)

	return camera
}

export {
	createCamera
}
