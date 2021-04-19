import * as THREE from '../../build/three.module.js';

function createRenderer(guiEnv, params, effectComposer) {

	const renderer = new THREE.WebGLRenderer({
		// antialias: true
	})
	const minpixelRatio = 1.75
	const pixelRatio = Math.min(minpixelRatio, window.devicePixelRatio)
	renderer.setPixelRatio(pixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.physicallyCorrectLights = true
	renderer.outputEncoding = THREE.sRGBEncoding
	renderer.toneMapping = THREE.ACESFilmicToneMapping
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap

	return renderer
}

export {
	createRenderer
}
