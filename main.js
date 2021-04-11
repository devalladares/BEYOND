//	// PRESENTATION
// const speederBoi = 300
let presentation = false
// presentation = true

//   // WORKING
// const speederBoi = 200
const speederBoi = 500

const floors = []
let newFloor
let floorCount = 10

////////////////////// INITIAL /////////////////////

function init() {

	/**
	 * Setup
	 */
	const gui = new GUI()
	const guiEnv = gui.addFolder('Environment');
	const guiLights = guiEnv.addFolder('Lights');
	const guiRend = guiEnv.addFolder('Renderers');
	const guiObjects = gui.addFolder('Objects');
	const guiWater = gui.addFolder('Water');
	const guiWater2 = gui.addFolder('Water2');
	const guiSky = gui.addFolder('Sky');

	// guiSky.open()
	// guiEnv.open()
	// guiLights.open()
	// guiRend.open()

	scene = createScene(gui, params);
	camera = createCamera(scene)
	renderer = createRenderer(guiRend, params);
	container.append(renderer.domElement);

	stats = new Stats();
	container.appendChild(stats.dom);

	window.addEventListener('resize', onWindowResize, false);

	loadingManager = new THREE.LoadingManager(() => {
		const loadingScreen = document.getElementById('loading-screen');
		loadingScreen.classList.add('fade-out');
		loadingScreen.addEventListener('transitionend', onTransitionEnd);
	});

	const gltfLoader = new GLTFLoader(loadingManager)
	const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager)

	new RGBELoader().setDataType(THREE.UnsignedByteType)

	const roughnessMipmapper = new RoughnessMipmapper(renderer);
	const textureLoader = new THREE.TextureLoader(loadingManager);
	const grassRepeaterU = 16
	const grassRepeaterV = 40
	const grassColor = textureLoader.load('../textures/0_grass/Ground_Forest_003_baseColor.jpg',
		function(texture) {
			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			texture.offset.set(0, 0);
			texture.repeat.set(grassRepeaterU, grassRepeaterV);
		});
	const grassNormal = textureLoader.load('../textures/0_grass/Ground_Forest_003_normal.jpg',
		function(texture) {
			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			texture.offset.set(0, 0);
			texture.repeat.set(grassRepeaterU, grassRepeaterV);
		});
	const grassRoughness = textureLoader.load('../textures/0_grass/Ground_Forest_003_ROUGH.jpg',
		function(texture) {
			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			texture.offset.set(0, 0);
			texture.repeat.set(grassRepeaterU, grassRepeaterV);
		});
	const grassAO = textureLoader.load('../textures//0_grass/Ground_Forest_003_ambientOcclusion.jpg',
		function(texture) {
			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			texture.offset.set(0, 0);
			texture.repeat.set(grassRepeaterU, grassRepeaterV);
		});
	const grassDisp = textureLoader.load('../textures//0_grass/Ground_Forest_003_height.jpg',
		function(texture) {
			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			texture.offset.set(0, 0);
			texture.repeat.set(grassRepeaterU, grassRepeaterV);
		});

	let grass = new THREE.MeshStandardMaterial({
		map: grassColor,
		normalMap: grassNormal,
		aoMap: grassAO,
		// aoMapIntensity: 1,
		roughnessMap: grassRoughness,
	});

	/**
	 * Loading
	 */
	const environmentMap = cubeTextureLoader.load([
		'../textures/environmentMaps/0/px.jpg',
		'../textures/environmentMaps/0/nx.jpg',
		'../textures/environmentMaps/0/py.jpg',
		'../textures/environmentMaps/0/ny.jpg',
		'../textures/environmentMaps/0/pz.jpg',
		'../textures/environmentMaps/0/nz.jpg'
	])

	environmentMap.encoding = THREE.sRGBEncoding
	scene.environment = environmentMap

	//OVERRIDE material
	// scene.overrideMaterial = new THREE.MeshBasicMaterial({color: 'green'});

	//Particles

	const firefliesGeometry = new THREE.BufferGeometry()
	const firefliesCount = 500
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
				value: 1000
			}
		},
		fragmentShader: fragmentShader(),
		vertexShader: vertexShader(),
	})

	// Points
	const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial)

	scene.add(fireflies)


	gui.add(firefliesMaterial.uniforms.uSize, 'value').min(0).max(2000).step(1).name('firefliesSize')

	for (let i = 0; i < firefliesCount; i++) {
		positionArray[i * 3 + 0] = (Math.random() - 0.5) * 500
		positionArray[i * 3 + 1] = Math.random() * 80
		positionArray[i * 3 + 2] = (Math.random() - 0.5) * 700 - 200
	}

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
	 * Controls
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
	 * BodyObject & Floor
	 */
	bodySphere = createBodySphere()
	bodySphere.position.copy(controls.getObject().position)
	camera.add(bodySphere);

	createFloor(floorGroup, floorCount, scene, newFloor, floors, loadingManager, gui, guiObjects)


	const waterGeometry = new THREE.PlaneGeometry(280, 500);

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
	scene.add(water);

	// const pmremGenerator = new THREE.PMREMGenerator(renderer);
	const waterUniforms = water.material.uniforms;

	guiWater.add(water.position, 'y', -100, 0, 0.01).name('Water Height');
	guiWater.add(water.position, 'z', -200, -20, 0.01).name('Water Move');
	guiWater.add(waterUniforms.distortionScale, 'value', 0, 8, 0.1).name('distortionScale');
	guiWater.add(waterUniforms.size, 'value', 0.1, 10, 0.1).name('size');
	guiWater.add(waterUniforms.alpha, 'value', 0.1, 1, .001).name('alpha');
	guiWater.addColor(waterUniforms.waterColor, 'value').name('waterColor')

	/**
	 * SKY SUN
	 */

	sun = new THREE.Vector3();
	sky = new Sky();
	sky.scale.setScalar(450000);
	scene.add(sky);

	sun = new THREE.Vector3();

	/// GUI
	effectController = {
		turbidity: 10,
		rayleigh: 3,
		mieCoefficient: 0.005,
		mieDirectionalG: 0.7,
		// inclination: 0.49, // elevation / inclination
		inclination: 0.4787, // elevation / inclination
		azimuth: 0.25, // Facing front,
		exposure: renderer.toneMappingExposure
	};

	guiSky.add(effectController, "turbidity", 0.0, 20.0, 0.1).onChange(updateSun);
	guiSky.add(effectController, "rayleigh", 0.0, 4, 0.001).onChange(updateSun);
	guiSky.add(effectController, "mieCoefficient", 0.0, 0.1, 0.001).onChange(updateSun);
	guiSky.add(effectController, "mieDirectionalG", 0.0, 1, 0.001).onChange(updateSun);
	guiSky.add(effectController, "inclination", 0, 1, 0.0001).onChange(updateSun);
	guiSky.add(effectController, "azimuth", 0, 1, 0.0001).onChange(updateSun).listen();
	// guiSky.add(effectController, "exposure", 0, 5, 0.0001).onChange(updateSun);

	updateSun();




	// /**œ¬
	//  * WATER2
	//  */
	params.color = '#0a1b17'
	params.scale = 6
	params.flowX = 0
	params.flowY = 0.5

	const water2Geometry = new THREE.PlaneGeometry(200, 350);
	// const water2Geometry = new THREE.SphereGeometry(16,30,30);

	water2 = new Water2(water2Geometry, {
		color: params.color,
		scale: params.scale,
		flowDirection: new THREE.Vector2(params.flowX, params.flowY),
		textureWidth: 128,
		textureHeight: 128
	});

	water2.rotation.x = Math.PI * -0.5;
	water2.position.y = -13.95
	water2.position.z = -596.48

	scene.add(water2);

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

	gltfLoader.load(
		'./BEYOND/textures/k_rocks/forest26.glb',
		(gltf) => {
			gltf.scene.scale.set(2.5, 2.5, 2.5)
			gltf.scene.position.set(0, -8.366, 5)
			gltf.scene.rotation.y = Math.PI * 0.5

			// mixer = new THREE.AnimationMixer(gltf.scene);
			// gltf.animations.forEach((clip) => {
			// 	mixer.clipAction(clip).play();
			// });
			// render();

			scene.add(gltf.scene)

			updateAllMaterials()
		})

	// // 1.1 FOREST ROCKS
	gltfLoader.load(
		'./textures/k_rocks/rocks/rocks_all3.glb',
		(gltf) => {
			let rockNumber = []
			let rockSeparator = 30
			let rockseparation = null

			for (let i = 10; i >= 0; i--) {
				rockNumber[i] = gltf.scene.children[i]
				rockseparation = i * rockSeparator
				rocks.push(rockNumber[i])
				scene.add(rockNumber[i])
				rockNumber[i].position.set(random(-1, 1), -8, -70 - rockseparation)
				rockNumber[i].scale.set(2.5, 2.5, 2.5)
			}
			updateAllMaterials()
		})
	//
	// /**
	//  * 2 ZEN GARDEN
	//  */
	// //
	// gltfLoader.load(
	// 	'../textures/l_zen/zen2.glb',
	// 	(gltf) => {
	// 		gltf.scene.scale.set(2.5, 2.5, 2.5)
	// 		gltf.scene.position.set(0, -3.073, 5)
	// 		gltf.scene.rotation.y = Math.PI * 0.5
	//
	// 		mixer = new THREE.AnimationMixer(gltf.scene);
	// 		gltf.animations.forEach((clip) => {
	// 			mixer.clipAction(clip).play();
	// 		});
	// 		render();
	//
	// 		console.log(gltf)
	//
	// 		scene.add(gltf.scene)
	//
	// 		guiObjects.add(gltf.scene.position, 'x')
	// 			.min(-100)
	// 			.max(100)
	// 			.step(0.001)
	// 			.name('GLTFpositionX')
	//
	// 		guiObjects.add(gltf.scene.position, 'y')
	// 			.min(-10)
	// 			.max(10)
	// 			.step(0.001)
	// 			.name('GLTFpositionY')
	//
	// 		updateAllMaterials()
	// 	})



	/**
	 * Raycaster
	 */
	// const geometry = new THREE.SphereGeometry(4, 16, 16);
	// const material = new THREE.MeshStandardMaterial({
	// 	color: 0xffff00
	// });
	// object1 = new THREE.Mesh(geometry, material);
	//
	// object2 = new THREE.Mesh(
	// 	new THREE.SphereGeometry(4, 16, 16),
	// 	new THREE.MeshStandardMaterial({
	// 		color: 0xffff00
	// 	})
	// )
	//
	// object3 = new THREE.Mesh(
	// 	new THREE.SphereGeometry(4, 16, 16),
	// 	new THREE.MeshStandardMaterial({
	// 		color: 0xffff00
	// 	})
	// )
	//ENABLE RAYCASTER
	// scene.add(object1);
	// scene.add(object2)
	// scene.add(object3)
	//
	// object1.position.set(10, 0, 50)
	// object2.position.set(0, 0, 50)
	// object3.position.set(-10, 0, 50)

	// gui.add(object1.position, 'x').min(-100).max(100).step(0.001)
	// gui.add(object1.position, 'y').min(-100).max(100).step(0.001)
	// gui.add(object1.position, 'z').min(-100).max(100).step(0.001)

	// raycaster = new THREE.Raycaster()
	// mouse = new THREE.Vector2()
	// currentIntersect = null
	//
	// points = [{
	// 	position: new THREE.Vector3(10, 0, 50),
	// 	element: document.querySelector('.point-0')
	// }, {
	// 	position: new THREE.Vector3(0, 0, 50),
	// 	element: document.querySelector('.point-1')
	// }, {
	// 	position: new
	// 	THREE.Vector3(-10, 0, 50),
	// 	element: document.querySelector('.point-2')
	// }]


	/**
	 * Lights ORIGINAL
	 */
	directionalLight = new THREE.DirectionalLight('white', 3)
	directionalLight.position.set(34, 35, -5)
	directionalLight.castShadow = true
	// TONE DOWN IF PROBLEM
	directionalLight.shadow.mapSize.set(4096, 4096)
	//CHECK
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

	// const ambientLight = new THREE.AmbientLight(0x404040); // soft white ambientLight
	// scene.add(ambientLight);

	guiLights.add(directionalLight, 'intensity').min(0).max(10).step(0.001).name('lightIntensity');
	guiLights.add(directionalLight.position, 'x').min(-50).max(50).step(0.001).name('lightX');
	guiLights.add(directionalLight.position, 'y').min(-50).max(50).step(0.001).name('lightY');
	guiLights.add(directionalLight.position, 'z').min(-50).max(50).step(0.001).name('lightZ');

	guiLights.add(targetObject.position, 'x').min(-50).max(50).step(.1).name('targetX');
	guiLights.add(targetObject.position, 'y').min(-50).max(50).step(.1).name('targetY');
	guiLights.add(targetObject.position, 'z').min(-50).max(50).step(.1).name('targetZ');

	// guiEnv.open()
	// guiLights.open()

	gui.close()



	/**
	 * ToneMapping
	 */
	renderer.toneMappingExposure = 3
	renderer.toneMappingExposure = 0.6

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
	 * Post Processing
	 */
	// let RenderTargetClass = null
	//
	// if (renderer.getPixelRatio() === 1 && renderer.capabilities.isWebGL2) {
	// 	RenderTargetClass = THREE.WebGLMultisampleRenderTarget
	// 	console.log('Using WebGLMultisampleRenderTarget')
	// } else {
	// 	RenderTargetClass = THREE.WebGLRenderTarget
	// 	console.log('Using WebGLRenderTarget')
	// }
	//
	// const renderTarget = new THREE.WebGLMultisampleRenderTarget(
	// 	800,
	// 	600, {
	// 		minFilter: THREE.LinearFilter,
	// 		magFilter: THREE.LinearFilter,
	// 		format: THREE.RGBAFormat,
	// 		encoding: THREE.sRGBEncoding
	// 	}
	// )

	// EffectComposer
	// effectComposer = new EffectComposer(renderer, renderTarget)
	// effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
	// effectComposer.setSize(sizes.width, sizes.height)
	//
	// // Passes
	// const renderPass = new RenderPass(scene, camera)
	// effectComposer.addPass(renderPass)

	// const dotScreenPass = new DotScreenPass()
	// dotScreenPass.enabled = true
	// effectComposer.addPass(dotScreenPass)

	// const glitchPass = new GlitchPass()
	// glitchPass.enabled = true
	// effectComposer.addPass(glitchPass)

	// const unrealBloomPass = new UnrealBloomPass()
	// unrealBloomPass.enabled = true
	// effectComposer.addPass(unrealBloomPass)
	// unrealBloomPass.radius = 0.3
	// unrealBloomPass.strength = 1
	// unrealBloomPass.threshold = 0.6
	// unrealBloomPass.enabled = true

	// gui.add(unrealBloomPass, 'enabled')
	// gui.add(unrealBloomPass, 'strength').min(0).max(2).step(0.01)
	// gui.add(unrealBloomPass, 'radius').min(0).max(2).step(0.01)
	// gui.add(unrealBloomPass, 'threshold').min(0).max(1).step(0.01)

	// console.log(effectComposer)
}

///////////////////////// FUNCTIONS /////////////////////////

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);

	firefliesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
	//
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

function updateSun() {

	const uniforms = sky.material.uniforms;
	uniforms["turbidity"].value = effectController.turbidity;
	uniforms["rayleigh"].value = effectController.rayleigh;
	uniforms["mieCoefficient"].value = effectController.mieCoefficient;
	uniforms["mieDirectionalG"].value = effectController.mieDirectionalG;

	const theta = Math.PI * (effectController.inclination - 0.5);
	const phi = 2 * Math.PI * (effectController.azimuth - 0.5);

	sun.x = Math.cos(phi);
	sun.y = Math.sin(phi) * Math.sin(theta);
	sun.z = Math.sin(phi) * Math.cos(theta);

	uniforms["sunPosition"].value.copy(sun);

	renderer.toneMappingExposure = effectController.exposure;
	renderer.render(scene, camera);

}


///////////////////////// RENDER ////////////////////////////

function render() {
	const performanceNow = performance.now();
	var delta2 = clock.getDelta();


	let t = clock.getElapsedTime();

	bodySphere.position.set(0, -20, 0);


	const elapsedTime = clock.getElapsedTime()
	const deltaTime = elapsedTime - previousTime
	previousTime = elapsedTime

	// Update materials
	firefliesMaterial.uniforms.uTime.value = elapsedTime

	// Model animation
	if (mixer) {
		mixer.update(deltaTime)
	}

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
		if (controls.getObject().position.z > 350) {
			velocity.z = 0;
			controls.getObject().position.z = 350;
		}
		if (controls.getObject().position.x > 300) {
			velocity.x = 0;
			controls.getObject().position.x = 300;
		}
		if (controls.getObject().position.x < -300) {
			velocity.x = 0;
			controls.getObject().position.x = -300;
		}
	}

	prevTime = performanceNow;

	// ROCKLIFTER
	rocks.forEach((element, i) => {
		distanceFloor = camera.position.distanceTo(element.position)
		floorApproach = mapNumber(distanceFloor, 80, 40, -23, -10)
		floorLifter = floorApproach > -10 ? -10 : floorApproach < -23 ? -23 : floorApproach
		element.position.y = floorLifter
		element.rotation.y = floorLifter * 0.02
		// element.rotation.y = floorLifter * 0.1
	});

	//WATER
	water.material.uniforms['time'].value += 1 / 240;

	//LIGHTTESTER

	// directionalLight.position.z += 0.1
	// effectController.azimuth += 0.001
	// renderer.toneMappingExposure += 0.01
	// updateSun()

	//night 0.5559 inclination
	//day  0.4236 inclination

	// console.log(camera.position)

	//camera.position.z start = 20
	//camera.position.z start = -200

	// if (camera.position.z < -20 || camera.position.z > -40) {
	//
	// 	const mapNumber2 = (num, in_min, in_max, out_min, out_max) => {
	// 		return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
	// 	}
	//
	// 	let inclinationLifter = mapNumber2(camera.position.z, -20, -40, 0.5, 0.4236)
	//
	// 	effectController.inclination = inclinationLifter
	// 	updateSun()
	//
	// 	// console.log(camera.position.z)
	// }

	// console.log(effectController.azimuth)

	//Raycaster
	// raycaster.setFromCamera(mouse, camera)
	//
	// const objectTest = [object1, object2, object3]
	// const intersects = raycaster.intersectObjects(objectTest)
	// // console.log(intersects.length)
	//
	// for (const object of objectTest) {
	// 	object.material.color.set('red')
	// }
	//
	// for (const intersect of intersects) {
	// 	intersect.object.material.color.set('green')
	// }

	//RAYCASTING TESTER
	// if (intersects.length) {
	// 	currentIntersect = intersects[0]
	// } else {
	// 	currentIntersect = null
	// }
	//
	// for (point of points) {
	// 	const screenPosition = point.position.clone()
	// 	screenPosition.project(camera)
	//
	// 	const translateX = screenPosition.x * sizes.width * 0.5
	// 	const translateY = -screenPosition.y * sizes.height * 0.5
	// 	point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`
	//
	// 	if (intersects.length === 0) {
	// 		//INVISIBLE
	//
	// 		point.element.classList.remove('visible')
	// 	} else {
	// 		//VISIBLE
	// 		point.element.classList.add('visible')
	//
	// 	}
	// }

	//POSTPROCESSING
	// effectComposer.render()
	renderer.render(scene, camera);
}

/////////////////////// VARIABLES ///////////////////////////

const audioListener = new THREE.AudioListener();
const music1 = new Audio(audioListener);
//
// let {
// 	pointLight,
// 	pointLight2,
// 	sphereLight,
// 	ambientLight,
// 	sphereLightMesh,
// 	sphereLightMesh2
// } = createLights();

let bodySphere

const objects = [];
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();

let params = {}

let camera, scene, renderer, composer, controls
let geometry, materialOptions, stats, container
let clock = new THREE.Clock();
let previousTime = 0

let floorGroup
container = document.getElementById('container');

let distanceFloor
let floorLifter
let floorApproach
let loadingManager




//WATER
let water, sun, mesh, sky

let mouse, raycaster
let currentIntersect = null
let object1, object2, object3

let points, point

//lights
let directionalLight
let effectController

//Mixer
let mixer = null
// let mixer

let rocks = []
let rockRotator

//Post
let effectComposer

//Water_2_M_Normal
let water2

//Fireflies
let firefliesMaterial

/////////////////////// INITIATE ///////////////////////

init();
animate();

/////////////////////// Import ///////////////////////

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
} from './examples/jsm/objects/Water2.js';
import {
	Water
} from './examples/jsm/objects/Water.js';
import {
	GLTFLoader
} from './examples/jsm/loaders/GLTFLoader.js';
import {
	DRACOLoader
} from './examples/jsm/loaders/DRACOLoader.js'
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
	createFloor,
} from './src/components/floor.js';
import {
	createLights
} from './src/components/lights.js';
import {
	createScene
} from './src/components/scene.js';
import {
	createControls
} from './src/system/controls.js';
import {
	EffectComposer
} from './examples/jsm/postprocessing/EffectComposer.js'
import {
	RenderPass
} from './examples/jsm/postprocessing/RenderPass.js'
//HMM
import {
	DotScreenPass
} from './examples/jsm/postprocessing/DotScreenPass.js'
import {
	GlitchPass
} from './examples/jsm/postprocessing/GlitchPass.js'
import {
	RGBShiftShader
} from './examples/jsm/shaders/RGBShiftShader.js'
import {
	ShaderPass
} from './examples/jsm/postprocessing/ShaderPass.js'
import {
	SMAAPass
} from './examples/jsm/postprocessing/SMAAPass.js'
//HMM

import {
	UnrealBloomPass
} from './examples/jsm/postprocessing/UnrealBloomPass.js'
// import VolumetricFire from './VolumetricFire.js';

//Random

function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function random(min, max) {
	return Math.random() * (max - min + 1) + min;
}

//MAP
const mapNumber = (num, in_min, in_max, out_min, out_max) => {
	return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

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
