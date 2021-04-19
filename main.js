// PRESENTATION
// let presentation = false
let presentation = true

// WORKING
// const speederBoi = 500
const speederBoi = 150


////////////////////// INITIATE /////////////////////

function init() {



	/**
	 * Setup
	 */

	// GUI
	const gui = new GUI()
	const guiEnv = gui.addFolder('Environment');
	const guiLights = guiEnv.addFolder('Lights');
	const guiRend = guiEnv.addFolder('Renderers');
	const guiObjects = gui.addFolder('Objects');
	const guiWater = gui.addFolder('Water');
	const guiWater2 = gui.addFolder('Water2');
	const guiSky = gui.addFolder('Sky');

	// SCENE
	scene = new THREE.Scene()
	camera = createCamera(scene)
	renderer = createRenderer(guiRend, params);
	container.append(renderer.domElement);
	window.addEventListener('resize', onWindowResize, false);

	// STATS
	stats = new Stats();
	container.appendChild(stats.dom);

	// FOG + BACKGROUND
	scene.background = new THREE.Color('black')
	// scene.fog = new THREE.FogExp2('black', 0.004);
	// scene.fog = new THREE.FogExp2('lightgrey', 0.004);
	scene.fog = new THREE.FogExp2('black', 0.1);
	if (presentation === true) {
		scene.fog = new THREE.FogExp2('black', 0.1);
	}

	// EVERYTHING - IMPORTANT FOR LIFTING

	scene.add(everything);


	gui.add(scene.fog, 'density').min(0.0001).max(0.004).step(0.0001)

	/**
	 * Loading
	 */
	loadingManager = new THREE.LoadingManager(() => {
		const loadingScreen = document.getElementById('loading-screen');
		loadingScreen.classList.add('fade-out');
		loadingScreen.addEventListener('transitionend', onTransitionEnd);
	});

	// LOADERS
	const gltfLoader = new GLTFLoader(loadingManager)
	const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager)
	new RGBELoader().setDataType(THREE.UnsignedByteType)
	const roughnessMipmapper = new RoughnessMipmapper(renderer);
	const textureLoader = new THREE.TextureLoader(loadingManager);
	const environmentMap = cubeTextureLoader.load([
		'./textures/environmentMaps/0/px.jpg',
		'./textures/environmentMaps/0/nx.jpg',
		'./textures/environmentMaps/0/py.jpg',
		'./textures/environmentMaps/0/ny.jpg',
		'./textures/environmentMaps/0/pz.jpg',
		'./textures/environmentMaps/0/nz.jpg'
	])

	environmentMap.encoding = THREE.sRGBEncoding
	scene.environment = environmentMap

	/**
	 * STARS
	 */
	starGroup = createStars(scene, starGroup, everything)
	// console.log(starGroup.children[0].material.color)

	starGroup.children[0].material.size = 0
	starGroup.children[0].material.color.r = 0
	starGroup.children[0].material.color.g = 0
	starGroup.children[0].material.color.b = 0

	/**
	 * FIREFLIES
	 */
	const firefliesGeometry = new THREE.BufferGeometry()
	const firefliesCount = 1000
	const positionArray = new Float32Array(firefliesCount * 3)
	const scaleArray = new Float32Array(firefliesCount)

	for (let i = 0; i < firefliesCount; i++) {
		positionArray[i * 3 + 0] = Math.random() * 4
		positionArray[i * 3 + 1] = Math.random() * 4
		positionArray[i * 3 + 2] = Math.random() * 4

		scaleArray[i] = Math.random()
	}

	firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1))
	firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))

	firefliesMaterial = new THREE.ShaderMaterial({
		transparent: true,
		blending: THREE.AdditiveBlending,
		depthWrite: false,
		uniforms: {
			uTime: {
				value: 0
			},
			uPixelRatio: {
				value: Math.min(window.devicePixelRatio, 2)
			},
			uSize: {
				value: 0
			}
		},
		fragmentShader: fragmentShader(),
		vertexShader: vertexShader(),
	})

	for (let i = 0; i < firefliesCount; i++) {
		positionArray[i * 3 + 0] = (Math.random() - 0.5) * 500
		positionArray[i * 3 + 1] = Math.random() * 80
		positionArray[i * 3 + 2] = (Math.random() - 0.5) * 700 - 200
	}

	const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial)
	everything.add(fireflies)

	// console.log(firefliesMaterial.uniforms.uSize.value)

	// firefliesMaterial.uniforms.uSize.value = 4000

	/**
	 * Updater
	 */
	const updateAllMaterials = () => {

		scene.traverse((child) => {
			if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
				roughnessMipmapper.generateMipmaps(child.material);

				child.material.envMap = environmentMap
				child.material.envMapIntensity = params.envMapIntensity
				child.material.needsUpdate = true
				child.castShadow = true
				child.receiveShadow = true
				roughnessMipmapper.dispose();
			}
		})
	}

	params.envMapIntensity = 3
	guiRend.add(params, 'envMapIntensity').min(0).max(20).step(0.001).onChange(updateAllMaterials)

	/**
	 * CONTROLS
	 */

	controls = createControls(camera, document.body, presentation, music1, audioListener, scene, loadingManager);

	scene.add(controls.getObject());

	function onKeyDown(event) {
		switch (event.keyCode) {
			case 38: // up
			case 87: // w
				moveForward = true;
				break;
			case 37: // left
			case 65: // a
				moveLeft = true;
				break;
			case 40: // down
			case 83: // s
				moveBackward = true;
				break;
			case 39: // right
			case 68: // d
				moveRight = true;
				break;
			case 32: // space
				if (canJump === true) velocity.y += 350;
				canJump = false;
				break;
		}
	};

	function onKeyUp(event) {
		switch (event.keyCode) {
			case 38: // up
			case 87: // w
				moveForward = false;
				break;
			case 37: // left
			case 65: // a
				moveLeft = false;
				break;
			case 40: // down
			case 83: // s
				moveBackward = false;
				break;
			case 39: // right
			case 68: // d
				moveRight = false;
				break;
		}
	};

	document.addEventListener('keydown', onKeyDown, false);
	document.addEventListener('keyup', onKeyUp, false);

	/**
	 * BODY SPHERE
	 */
	bodySphere = createBodySphere()
	bodySphere.position.copy(controls.getObject().position)
	camera.add(bodySphere);

	/**
	 * WATER 1
	 */
	const waterGeometry = new THREE.PlaneGeometry(280, 500);

	// const waterGeometry2 = new THREE.PlaneGeometry(5000, 4000);
	const waterGeometry2 = new THREE.PlaneGeometry(4000, 2000);

	// const waterMat = new THREE.MeshBasicMaterial()

	water3 = new Water(
		waterGeometry2, {
			textureWidth: 512,
			textureHeight: 512,
			waterNormals: new THREE.TextureLoader().load('examples/jsm/textures/waternormals.jpg', function(texture) {
				texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			}),
			alpha: 1.0,
			sunDirection: new THREE.Vector3(),
			sunColor: 0xffffff,
			waterColor: 0x001e0f,
			distortionScale: 3.7,
			fog: scene.fog !== undefined
		}
	);

	// const waterTest = new THREE.Mesh(waterGeometry2, waterMat)

	everything.add(water3)

	water3.position.set(0, 155, -2708)
	water3.rotation.x = -Math.PI / 2;

	gui.add(water3.position, 'y', 0, 1000, 1).name('Water1Y');
	gui.add(water3.position, 'z', -4000, 0, 1).name('Water1z');
	gui.add(water3.position, 'x', -2000, 2000, 1).name('Water1x');

	water = new Water(
		waterGeometry, {
			textureWidth: 512,
			textureHeight: 512,
			waterNormals: new THREE.TextureLoader().load('examples/jsm/textures/waternormals.jpg', function(texture) {
				texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			}),
			alpha: 1.0,
			sunDirection: new THREE.Vector3(),
			sunColor: 0xffffff,
			waterColor: 0x001e0f,
			distortionScale: 3.7,
			fog: scene.fog !== undefined
		}
	);

	water.rotation.x = -Math.PI / 2;
	water.position.y = -13.95
	water.position.z = -171.39
	everything.add(water)

	const waterUniforms = water.material.uniforms;

	guiWater.add(water.position, 'y', -100, 0, 0.01).name('Water Height');
	guiWater.add(water.position, 'z', -200, -20, 0.01).name('Water Move');
	guiWater.add(waterUniforms.distortionScale, 'value', 0, 8, 0.1).name('distortionScale');
	guiWater.add(waterUniforms.size, 'value', 0.1, 10, 0.1).name('size');
	guiWater.add(waterUniforms.alpha, 'value', 0.1, 1, .001).name('alpha');
	guiWater.addColor(waterUniforms.waterColor, 'value').name('waterColor')

	// /**
	//  * WATER 2
	//  **
	params.color = '#0d1b11'
	params.scale = 6
	params.flowX = 0
	params.flowY = 0.5

	// const water2Geometry = new THREE.PlaneGeometry(325, 350);
	// const water2Geometry = new THREE.PlaneGeometry(325, 1500);
	const water2Geometry = new THREE.PlaneGeometry(1500, 1500);

	water2 = new Water2(water2Geometry, {
		color: params.color,
		scale: params.scale,
		flowDirection: new THREE.Vector2(params.flowX, params.flowY),
		textureWidth: 512,
		textureHeight: 512
	});

	water2.rotation.x = Math.PI * -0.5;
	water2.position.y = -17.01
	water2.position.z = -596.48


	everything.add(water2)

	guiWater2.add(water2.position, 'x', -200, 200, 0.01).name('Water2 X');
	guiWater2.add(water2.position, 'y', -100, 10, 0.01).name('Water2 Height');
	guiWater2.add(water2.position, 'z', -600, -200, 0.01).name('Water2 Move');

	guiWater2.addColor(params, 'color').onChange(function(value) {
		water2.material.uniforms['color'].value.set(value);
	});
	guiWater2.add(params, 'scale', 1, 10).onChange(function(value) {
		water2.material.uniforms['config'].value.w = value;
	});
	guiWater2.add(params, 'flowX', -1, 1).step(0.01).onChange(function(value) {
		water2.material.uniforms['flowDirection'].value.x = value;
		water2.material.uniforms['flowDirection'].value.normalize();
	});
	guiWater2.add(params, 'flowY', -1, 1).step(0.01).onChange(function(value) {
		water2.material.uniforms['flowDirection'].value.y = value;
		water2.material.uniforms['flowDirection'].value.normalize();
	});

	/**
	 * 1 FOREST
	 */
	// 1 FOREST MAIN

	gltfLoader.load(
		'./textures/k_rocks/forest30.glb',
		(gltf) => {
			gltf.scene.scale.set(2.5, 2.5, 2.5)
			gltf.scene.position.set(0, -8.366, 5)
			gltf.scene.rotation.y = Math.PI * 0.5

			// scene.add(gltf.scene)
			everything.add(gltf.scene)

			updateAllMaterials()
		})

	// // 1.1 FOREST WATER ROCKS

	gltfLoader.load(
		'./textures/k_rocks/rocks_6.glb',
		(gltf) => {
			let rockNumber = []
			let rockSeparator = 30.5
			let rockseparation = null

			for (let i = 11; i >= 0; i--) {
				rockNumber[i] = gltf.scene.children[i]
				rockseparation = i * rockSeparator
				rocks.push(rockNumber[i])
				everything.add(rockNumber[i])
				// scene.add(rockNumber[i])
				rockNumber[i].position.set(random(-1, 1), -8, -70 - rockseparation)
				rockNumber[i].scale.set(2.5, 2.5, 2.5)
			}

			let bigRock = gltf.scene.children[0]
			bigRock.scale.set(6, 6, 6)
			bigRock.position.set(random(-1, 1), -15.868, 86)
			bigRock.rotation.set(33.988, 20.982, 0)
			// scene.add(bigRock)
			everything.add(bigRock)
			updateAllMaterials()
		})

	// /**
	//  * 2 ZEN GARDEN
	//  */

	gltfLoader.load(
		'./textures/l_zen/zen37.glb',
		(gltf) => {
			gltf.scene.scale.set(2.5, 2.5, 2.5)
			gltf.scene.position.set(0, -8.738, 5)
			gltf.scene.rotation.y = Math.PI * 0.5

			mixer2 = new THREE.AnimationMixer(gltf.scene);
			gltf.animations.forEach((clip) => {
				mixer2.clipAction(clip).play();
			});
			render();

			// scene.add(gltf.scene)
			everything.add(gltf.scene)

			updateAllMaterials()
		})

	/**
	 * 2.1 ZEN WATER STAIRS
	 */

	gltfLoader.load(
		'./textures/l_zen/stairs1.glb',
		(gltf) => {

			let stairNumber = []
			let stairSeparator = null

			for (let i = 19; i >= 0; i--) {
				stairNumber[i] = gltf.scene.children[i]
				stairSeparator = Math.sin(((i / 20)) * Math.PI * -2) * 40 + 20
				stairs.push(stairNumber[i])
				everything.add(stairNumber[i])
				// scene.add(stairNumber[i])
				stairNumber[i].position.set(stairSeparator, -8, -420 - i * 18)
				stairNumber[i].rotation.y = Math.PI * 0.5
				stairNumber[i].scale.set(2.5, 2.5, 2.5)
			}
		})

	/**
	 * 3 TEMPLE
	 */

	//MIRROR

	// let geometry, material;

	let circle1

	circle1 = new THREE.CircleGeometry(40, 64);
	mirror1 = new Reflector(circle1, {
		clipBias: 0.003,
		textureWidth: window.innerWidth * window.devicePixelRatio,
		textureHeight: window.innerHeight * window.devicePixelRatio,
		color: 0x777777
	});

	mirror1.position.y = 0.5;
	mirror1.position.z = 63;
	everything.add(mirror1);
	mirror1.rotation.y = Math.PI * 2
	mirror1.rotation.x = Math.PI

	gui.add(mirror1.rotation, 'x').min(0).max(Math.PI * 2).step(0.001).name('mirrorx');
	gui.add(mirror1.rotation, 'y').min(0).max(Math.PI * 2).step(0.001).name('mirrory');

	gui.add(mirror1.position, 'x').min(0).max(1000).step(1).name('posx');
	gui.add(mirror1.position, 'y').min(0).max(1000).step(1).name('posy');
	gui.add(mirror1.position, 'z').min(0).max(1000).step(1).name('posz');


	// for (let i = 0; i < 6; i++) {
	// 	const mesh = mirror1.clone();
	// 	const t = i / 6 * 2 * Math.PI
	// 	mesh.position.x = Math.cos(t) * 40;
	// 	mesh.position.z = Math.sin(t) * 40;
	// 	mirrorGroup.add(mesh)
	// }

	everything.add(mirrorGroup)

	// gltfLoader.load(
	// 	'./textures/m_temple/temple_10.glb',
	// 	(gltf) => {
	// 		gltf.scene.scale.set(2.5, 2.5, 2.5)
	// 		gltf.scene.position.set(33, -8.738, -30)
	// 		gltf.scene.rotation.y = Math.PI * 0.5
	//
	// 		// let	 model = gltf.scene;
	// 		//
	// 		// let newMaterial = new THREE.MeshDepthMaterial({
	// 		// 	// color: 0xff0000,
	// 		// 	side: THREE.DoubleSide,
	// 		// });
	// 		//
	// 		// model.traverse((o) => {
	// 		// 	if (o.isMesh) o.material = newMaterial;
	// 		// });
	//
	// 		guiObjects.add(gltf.scene.position, 'x')
	// 			.min(-100)
	// 			.max(100)
	// 			.step(0.001)
	// 			.name('GLTFpositionX')
	// 		guiObjects.add(gltf.scene.position, 'y')
	// 			.min(-100)
	// 			.max(100)
	// 			.step(0.001)
	// 			.name('GLTFpositiony')
	// 		guiObjects.add(gltf.scene.position, 'z')
	// 			.min(-100)
	// 			.max(100)
	// 			.step(0.001)
	// 			.name('GLTFpositionz')
	//
	// 		guiObjects.open()
	// 		//
	// 		// 		guiObjects.add(gltf.scene.position, 'y')
	// 		// 			.min(-10)
	// 		// 			.max(10)
	// 		// 			.step(0.001)
	// 		// 			.name('GLTFpositionY')
	//
	// // scene.add(gltf.scene)
	// 		everything.add(gltf.scene)
	// 		updateAllMaterials()
	// 	})

	// 3.1 MOUNTAIN LIFTER
	gltfLoader.load(
		'./textures/m_temple/disk_1.glb',
		(gltf) => {
			gltf.scene.scale.set(2.5, 2.5, 2.5)
			gltf.scene.rotation.y = Math.PI * 0.5

			disk.add(gltf.scene)
			scene.add(disk)
			updateAllMaterials()
		})

	disk.position.set(31, -22, -810)

	/**
	 * LIGHTS
	 */
	directionalLight = new THREE.DirectionalLight('white', 3)
	directionalLight.position.set(34, 35, -5)
	directionalLight.castShadow = true

	directionalLight.shadow.mapSize.set(1024, 1024) // TONE DOWN IF NEEDED

	directionalLight.shadow.camera.far = 15
	directionalLight.shadow.normalBias = 0.05
	directionalLight.shadow.camera = new THREE.OrthographicCamera(-200, 200, 200, -200, 1, 10000)

	scene.add(directionalLight)

	const helper = new THREE.DirectionalLightHelper(directionalLight, 1);
	// scene.add(helper);

	const targetObject = new THREE.Object3D();
	targetObject.position.set(-24, -23, -15)
	directionalLight.target = targetObject;

	scene.add(targetObject);

	guiLights.add(directionalLight, 'intensity').min(0).max(10).step(0.001).name('lightIntensity');
	guiLights.add(directionalLight.position, 'x').min(-50).max(50).step(0.001).name('lightX');
	guiLights.add(directionalLight.position, 'y').min(-50).max(50).step(0.001).name('lightY');
	guiLights.add(directionalLight.position, 'z').min(-50).max(50).step(0.001).name('lightZ');

	guiLights.add(targetObject.position, 'x').min(-50).max(50).step(.1).name('targetX');
	guiLights.add(targetObject.position, 'y').min(-50).max(50).step(.1).name('targetY');
	guiLights.add(targetObject.position, 'z').min(-50).max(50).step(.1).name('targetZ');

	/**
	 * TONEMAPPING
	 */
	renderer.toneMappingExposure = 3

	guiRend.add(renderer, 'toneMapping', {
		No: THREE.NoToneMapping,
		Linear: THREE.LinearToneMapping,
		Reinhard: THREE.ReinhardToneMapping,
		Cineon: THREE.CineonToneMapping,
		ACESFilmic: THREE.ACESFilmicToneMapping
	}).onFinishChange(() => {
		renderer.toneMapping = Number(renderer.toneMapping)
		updateAllMaterials()
	})
	guiRend.add(renderer, 'toneMappingExposure').min(0).max(10)

	/**
	 * GSAP
	 */

	// Animate Fog
	gsap.to(scene.fog, {
		duration: 15,
		delay: 10,
		ease: "power4",
		density: 0.004
	})

	// gsap.to(scene.fog, {
	// 	duration: 1,
	// 	delay: 0,
	// 	ease: "power4",
	// 	density: 0.004
	// })

	// Animate Fireflies
	// firefliesMaterial.uniforms.uSize.value = 4000

	gsap.to(firefliesMaterial.uniforms.uSize, {
		duration: 5,
		delay: 0,
		ease: "power4.in",
		value: 1000,
	})

	// Animate Stars

	gsap.to(starGroup.children[0].material.color, {
		duration: 15,
		delay: 5,
		ease: "power4.in",
		r: 0.2,
		g: 0.2,
		b: 0.2,
	})

	gui.hide()

	//TORUS


	const radius = 50
	const tube = 20
	const radialSegments = 64
	const tubularSegments = 150

	const torusgeometry = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments);
	const torusmaterial = new THREE.MeshBasicMaterial({
		color: 'white',
		// fog: false
	});
	let mainCentre = new THREE.Mesh(torusgeometry, torusmaterial);

	mainCentre.position.z = -3216
	mainCentre.position.y = 724

	mainCentre.scale.set(8, 8, 8)

	everything.add(mainCentre);

	// gui.add(mainCentre.position, 'x').min(-500).max(500).step(1).name('lightX');
	gui.add(mainCentre.position, 'y').min(0).max(1000).step(1).name('TORUSY');
	gui.add(mainCentre.position, 'z').min(-6000).max(0).step(1).name('TORUSZ');
	gui.add(mainCentre.scale, 'x').min(1).max(100).step(1).name('scalex')
	gui.add(mainCentre.scale, 'y').min(1).max(100).step(1).name('scaley')
	gui.add(mainCentre.scale, 'z').min(1).max(100).step(1).name('scalez')


	// const circleGeometry = new THREE.CircleGeometry(5, 32);
	// const material = new THREE.MeshBasicMaterial({
	// 	color: 0xffff00,
	// 	side: THREE.DoubleSide,
	// });
	// const waterCircle = new THREE.Mesh(circleGeometry, material);
	// everything.add(waterCircle);
	//
	// waterCircle.position.set(0, 520, -1950)
	// // waterCircle.rotation.x = Math.PI * 0.5
	//
	//
	// gui.add(waterCircle.position, 'x').min(0).max(1000).step(1).name('waterx');
	// gui.add(waterCircle.position, 'y').min(500).max(520).step(1).name('watery');
	// gui.add(waterCircle.position, 'z').min(-1900).max(-2100).step(1).name('waterz');
	//
	// gui.add(waterCircle.rotation, 'x').min(0).max(90).step(1).name('waterx1');
	// gui.add(waterCircle.rotation, 'y').min(0).max(90).step(1).name('watery1');
	// gui.add(waterCircle.rotation, 'z').min(0).max(90).step(1).name('waterz1');

}

// change density to 0.0031

///////////////////////// FUNCTIONS /////////////////////////

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);

	firefliesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
	// effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
	// effectComposer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Raycaster
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
}
//
// window.addEventListener('mousemove', (event) => {
// 	mouse.x = event.clientX / sizes.width * 2 - 1
// 	mouse.y = -(event.clientY / sizes.height) * 2 + 1
// })
//
// window.addEventListener('click', () => {
// 	if (currentIntersect) {
// 		console.log('clicked')
// 		// window.open("https://docs.google.com/document/d/167OjftS1SE2DvZaEuuDEBrIM6M9za2W8mc_CXl9H1T0/edit?usp=sharing");
//
// 		// if (currentIntersect.object === object1) {
// 		// 	console.log('1')
// 		// } else if (currentIntersect.object === object2) {
// 		// 	console.log('2')
// 		// } else if (currentIntersect.object === object3) {
// 		// 	console.log('3')
// 		// }
// 	}
// })

function onTransitionEnd(event) {
	event.target.remove();
}

function animate() {
	requestAnimationFrame(animate);
	stats.update();
	render()
}

///////////////////////// RENDER ////////////////////////////

const liftPoint = -810

const cameraZLifter = -500

function render() {
	const performanceNow = performance.now();
	var delta2 = clock.getDelta();
	const elapsedTime = clock.getElapsedTime()
	const deltaTime = elapsedTime - previousTime
	previousTime = elapsedTime

	// BodySphere Attach
	bodySphere.position.set(0, 0, 0);

	// Update materials
	firefliesMaterial.uniforms.uTime.value = elapsedTime

	// Model animation
	if (mixer) {
		mixer.update(deltaTime)
	}
	if (mixer2) {
		mixer2.update(deltaTime)
	}

	// PointerLockControls
	if (controls.isLocked === true) {
		const delta = (performanceNow - prevTime) / 1000;
		velocity.x -= velocity.x * 5.0 * delta;
		velocity.z -= velocity.z * 5.0 * delta;
		direction.z = Number(moveForward) - Number(moveBackward);
		direction.x = Number(moveRight) - Number(moveLeft);
		direction.normalize();
		if (moveForward || moveBackward) velocity.z -= direction.z * speederBoi * delta;
		if (moveLeft || moveRight) velocity.x -= direction.x * speederBoi * delta;
		controls.moveRight(-velocity.x * delta);
		controls.moveForward(-velocity.z * delta);
		controls.getObject().position.y += (velocity.y * delta);
		//BOUNDARIES
		if (controls.getObject().position.z > 80) {
			velocity.z = 0;
			controls.getObject().position.z = 80;
		}
		if (controls.getObject().position.z < -2350) {
			velocity.z = 0;
			controls.getObject().position.z = -2350;
		}
		if (controls.getObject().position.x > 150) {
			velocity.x = 0;
			controls.getObject().position.x = 150;
		}
		if (controls.getObject().position.x < -150) {
			velocity.x = 0;
			controls.getObject().position.x = -150;
		}
	}
	prevTime = performanceNow;

	// REMAPPING FUNCTION
	const mapNumber = (num, in_min, in_max, out_min, out_max) => {
		return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
	}

	// ROCKLIFTER
	rocks.forEach((element, i) => {
		distanceFloor = camera.position.distanceTo(element.position)
		floorApproach = mapNumber(distanceFloor, 80, 40, -23, -10)
		floorLifter = floorApproach > -10 ? -10 : floorApproach < -23 ? -23 : floorApproach

		if (camera.position.z > liftPoint) {

			element.position.y = floorLifter
			element.rotation.y = floorLifter * 0.02
		}
	});

	// console.log(camera.position.x)

	// STAIRLIFTER
	stairs.forEach((element, i) => {
		distanceFloor2 = camera.position.distanceTo(element.position)
		floorApproach2 = mapNumber(distanceFloor2, 120, 40, -25, -16)
		floorLifter2 = floorApproach2 > -16 ? -16 : floorApproach2 < -25 ? -25 : floorApproach2

		if (camera.position.z > liftPoint) {
			element.position.y = floorLifter2
			element.scale.z = 30 / floorLifter2
		}
	});



	// EVERYTHINGLIFTER

	if (camera.position.z < liftPoint && everything.position.y > cameraZLifter) {
		everything.position.y -= 0.3
		// everything.position.y -= 4
	} else if (camera.position.z > liftPoint && everything.position.y < 0) {
		everything.position.y += 0.3
		// everything.position.y += 4
		disk.position.z = liftPoint
	}

	if (camera.position.z < liftPoint && camera.position.z > -1375) {
		disk.position.z = camera.position.z
	}

	// Water 2
	water.material.uniforms['time'].value += 1 / 240;
	water3.material.uniforms['time'].value += 1 / 240;

	// Stars
	for (let i = 0; i < starGroup.children.length; i++) {
		const object = starGroup.children[i];
		object.rotation.y = performanceNow * -0.0000015
	}

	// Change Sky Color
	let skyMapper = mapNumber(camera.position.z, -350, -440, 0, .75)
	skyChanger = skyMapper > .75 ? .75 : skyMapper < 0 ? 0 : skyMapper
	scene.background.r = scene.background.g = scene.background.b = scene.fog.color.b = scene.fog.color.r = scene.fog.color.g = skyChanger

	// Change Sky Color 2
	// skyMapper = mapNumber(camera.position.z, -1900, -2200, .75, .9)
	// skyChanger = skyMapper > .9 ? .9 : skyMapper < .75 ? .75 : skyMapper
	// scene.background.r = scene.background.g = scene.background.b = scene.fog.color.b = scene.fog.color.r = scene.fog.color.g = skyChanger

	if (camera.position.z < -800) {

		let fogMapper = mapNumber(camera.position.z, -1800, -2200, 0.004, 0.0012)
		//
		fogChanger = fogMapper > 0.004 ? 0.004 : fogMapper < 0.0012 ? 0.0012 : fogMapper

		//
		scene.fog.density = fogChanger

	}
	//
	// console.log(scene.fog.density)

	renderer.render(scene, camera);
}

/////////////////////// VARIABLES ///////////////////////////

// MAIN
let camera, scene, renderer, composer, controls
let geometry, materialOptions, stats
let container = document.getElementById('container');

// Audio
const audioListener = new THREE.AudioListener();
const music1 = new THREE.Audio(audioListener);

// BodySphere
let bodySphere

// LoadingManager
let loadingManager

// GUI
let params = {}

// Controls
const objects = [];
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();

// Time
let prevTime = performance.now();
let clock = new THREE.Clock();
let previousTime = 0

// Floor
let distanceFloor
let floorLifter
let floorApproach
let distanceFloor2
let floorLifter2
let floorApproach2

// Water 1
let water, sun, mesh, sky

//Water_2
let water2, water3

// Raycaster
let points, point
let mouse, raycaster
let currentIntersect = null
let object1, object2, object3

//Lights
let directionalLight
let effectController

//Mixer
let mixer = null
let mixer2 = null

//Rocks
let rocks = []
let rockRotator

//Stairs
let stairs = []
let stairRotator

//Lift everything
let everything = new THREE.Group()
let disk = new THREE.Object3D()

//Post
let effectComposer

//Fireflies
let firefliesMaterial

//Mirror
let verticalMirror, groundMirror, mirror1
let mirrors = []
let mirrorGroup = new THREE.Object3D();
let skyChanger = 0

let fogChanger = 0

// Stars
let starGroup, stars


/////////////////////// INITIATE ///////////////////////

init();
animate();

/////////////////////// IMPORT ///////////////////////

// import * as THREE from './build/three.module.js'
import * as THREE from './build/three.module.js'

import Stats from './examples/jsm	/libs/stats.module.js';
import {
	PointerLockControls
} from './examples/jsm/controls/PointerLockControls.js';
import {
	GUI
} from './examples/jsm/libs/dat.gui.module.js';
import {
	Water2
}
from './examples/jsm/objects/Water2.js';
import {
	Water
} from './examples/jsm/objects/Water.js';
import {
	GLTFLoader
} from './examples/jsm/loaders/GLTFLoader.js';
import {
	RGBELoader
} from './examples/jsm/loaders/RGBELoader.js';
import {
	RoughnessMipmapper
} from './examples/jsm/utils/RoughnessMipmapper.js';
import {
	Sky
} from './examples/jsm/objects/Sky.js';
import {
	createRenderer
} from './src/system/renderer.js';
import {
	createCamera
} from './src/components/camera.js';
import {
	createBodySphere
} from './src/components/bodySphere.js';
import {
	createStars
} from './src/components/stars.js';
import {
	createControls
} from './src/system/controls.js';

import {
	Reflector
} from './examples/jsm/objects/Reflector.js';
import {
	gsap
} from "./gsap/esm/all.js";

// POSTPROCESSING

// import {
// 	EffectComposer
// } from './examples/jsm/postprocessing/EffectComposer.js'
// import {
// 	RenderPass
// } from './examples/jsm/postprocessing/RenderPass.js'
// import {
// 	DotScreenPass
// } from './examples/jsm/postprocessing/DotScreenPass.js'
// import {
// 	GlitchPass
// } from './examples/jsm/postprocessing/GlitchPass.js'
// import {
// 	RGBShiftShader
// } from './examples/jsm/shaders/RGBShiftShader.js'
// import {
// 	ShaderPass
// } from './examples/jsm/postprocessing/ShaderPass.js'
// import {
// 	SMAAPass
// } from './examples/jsm/postprocessing/SMAAPass.js'
// import {
// 	UnrealBloomPass
// } from './examples/jsm/postprocessing/UnrealBloomPass.js'

// p5 Random Functions

function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function random(min, max) {
	return Math.random() * (max - min + 1) + min;
}

// Shaders

function vertexShader() {
	return `
	uniform float uPixelRatio;
	uniform float uSize;
	attribute float aScale;
	uniform float uTime;

	void main()
{
	vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  modelPosition.y += sin(uTime + modelPosition.x * 100.0) * aScale * 0.6;
  modelPosition.z += cos(uTime + modelPosition.x * 100.0) * aScale * 0.6;
  modelPosition.x += sin(uTime + modelPosition.x * 100.0) * aScale * 0.6;
	vec4 viewPosition = viewMatrix * modelPosition;
	vec4 projectionPosition = projectionMatrix * viewPosition;

	gl_Position = projectionPosition;
	gl_PointSize = uSize * aScale * uPixelRatio;
  gl_PointSize *= (1.0 / - viewPosition.z);
}
  `
}

function fragmentShader() {
	return `
	void main()
	{
		float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
	    float strength = 0.05 / distanceToCenter - 0.1;

	    gl_FragColor = vec4(1.0, 1.0, 1.0, strength);
	}
  `
}
