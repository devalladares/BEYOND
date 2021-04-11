import {
	SphereBufferGeometry,
	TextureLoader,
	RepeatWrapping,
	MeshStandardMaterial,
	BoxBufferGeometry,
	Mesh,
	Object3D,
	CylinderBufferGeometry,
	MeshBasicMaterial

} from '../../build/three.module.js';


function createFloor(floorGroup, floorCount, scene, newFloor, floors, loadingManager, gui,guiObjects) {

	const textureLoader = new TextureLoader(loadingManager);
	const diffuseMap = textureLoader.load("textures/concrete_dark/Concrete_Wall_002_basecolor.jpg",
		function(texture) {
			texture.wrapS = texture.wrapT = RepeatWrapping;
			texture.offset.set(0, 0);
			texture.repeat.set(2, 1);
		});
	const normalMap = textureLoader.load("textures/concrete_dark/Concrete_Wall_002_normal.jpg",
		function(texture) {
			texture.wrapS = texture.wrapT = RepeatWrapping;
			texture.offset.set(0, 0);
			texture.repeat.set(2, 1);
		});
	const aoMap = textureLoader.load("textures/concrete_dark/Concrete_Wall_002_ambient_occlusion.jpg",
		function(texture) {
			texture.wrapS = texture.wrapT = RepeatWrapping;
			texture.offset.set(0, 0);
			texture.repeat.set(2, 1);
		});
	const displacementMap = textureLoader.load("textures/concrete_dark/Concrete_Wall_002_height.jpg",
		function(texture) {
			texture.wrapS = texture.wrapT = RepeatWrapping;
			texture.offset.set(0, 0);
			texture.repeat.set(2, 1);
		});
	const roughnessMap = textureLoader.load("textures/concrete_dark/Concrete_Wall_002_roughness.jpg",
		function(texture) {
			texture.wrapS = texture.wrapT = RepeatWrapping;
			texture.offset.set(0, 0);
			texture.repeat.set(2, 1);
		});

	let material = new MeshStandardMaterial({
		map: diffuseMap,
		normalMap: normalMap,
		aoMap: aoMap,
		aoMapIntensity: 1,
		roughnessMap: roughnessMap,
		metalness: 0
	});

	const boxBufferGeometry = new BoxBufferGeometry(20, 7.5, 1);

	const floor = new Mesh(
		boxBufferGeometry,
		material
	)

	floor.receiveShadow = true;
	floorGroup = new Object3D();
	floorGroup.add(floor)
	floorGroup.rotation.x = Math.PI / 2;
	floorGroup.position.set(0, -20, 0)

	for (let j = 0; j < floorCount; j++) {
		addFloor((j * -8) - 25)
	}

	function addFloor(j) {
		newFloor = floorGroup.clone()
		newFloor.position.z = j
		floors.push(newFloor)
		// scene.add(newFloor)
	}

	// let checkers = {}
	// checkers.radius = 20
	//
	// gui.add(checkers, 'radius')
	// 	.min(-100)
	// 	.max(100)
	// 	.step(0.001)
	// 	.name('RADIUS')
	// 	.onChange(createFloor)
	//
	// 	// let radius = checkers.radius
	// let radius = 20


	// const geometry3 = new CylinderBufferGeometry(radius, radius, 2, 64);
	// const material2 = new MeshBasicMaterial({
	// 	color: 0xffff00
	// });
	// const floorBase = new Mesh(geometry3, material);
	// scene.add(floorBase);

	// floorBase.position.z = 0
	// floorBase.position.y = -10
	//
	// guiObjects.add(floorBase.position, 'x')
	// 	.min(-100)
	// 	.max(100)
	// 	.step(0.001)
	// 	.name('FLOOR')

	// guiObjects.add(floorBase.geometry.parameters, 'radialSegments')
	// 	.min(-100)
	// 	.max(100)
	// 	.step(0.001)
	// 	.name('SEGS')
	// //
	// // geometry3.parameters.radiusTop = 10

	// console.log(floorBase.geometry.parameters.radialSegments)
}

export {
	createFloor
}
