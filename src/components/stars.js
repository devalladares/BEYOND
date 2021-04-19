import {
	SphereGeometry,
	PointsMaterial,
	Vector3,
	Points,
	Object3D,
	BufferGeometry,
	BufferAttribute
} from '../../build/three.module.js';

function createStars(scene, starGroup, everything) {

	const starQty = 24000 / 4;
	const starGeometry = new BufferGeometry()

	const materialOptions = {
		size: 0.0,
		fog: false,
		color: 'white'
	};

	const positionArray = new Float32Array(starQty * 3)
	const scaleArray = new Float32Array(starQty)

	for (let i = 0; i < starQty; i++) {
		positionArray[i * 3 + 0] = Math.random() * 4
		positionArray[i * 3 + 1] = Math.random() * 4
		positionArray[i * 3 + 2] = Math.random() * 4
		scaleArray[i] = Math.random()
	}

	starGeometry.setAttribute('aScale', new BufferAttribute(scaleArray, 1))
	starGeometry.setAttribute('position', new BufferAttribute(positionArray, 3))

	const starStuff = new PointsMaterial(materialOptions);

	for (let i = 0; i < starQty; i++) {
		positionArray[i * 3 + 0] = (Math.random() - 0.5) * 3000
		positionArray[i * 3 + 1] = Math.random() * 2000 + 250
		positionArray[i * 3 + 2] = (Math.random() - 0.5) * 3000
	}

	const stars = new Points(starGeometry, starStuff);

	starGroup = new Object3D();
	starGroup.add(stars)
	everything.add(starGroup);

	return starGroup;
}

export {
	createStars
};
