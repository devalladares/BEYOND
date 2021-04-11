import {
	Color,
	Scene,
	FogExp2
} from '../../build/three.module.js';

function createScene(gui, params) {

	const scene = new Scene()
	// scene.background = new Color('#e4eded')
	// scene.fog = new FogExp2('#e4eded', 0.0035);

	scene.background = new Color('darkgrey')
	scene.fog = new FogExp2('darkgrey', 0.0035);

	return scene
}

export {
	createScene
}
