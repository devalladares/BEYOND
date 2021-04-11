import {
	SphereBufferGeometry,
	MeshBasicMaterial,
	Mesh
} from '../../build/three.module.js';

function createBodySphere() {

	const geometry2 = new SphereBufferGeometry(25, 8, 8);
	const material2 = new MeshBasicMaterial({
		color: 'white'
	});
	const bodySphere = new Mesh(geometry2, material2);

	return bodySphere
}

export {
	createBodySphere
}
