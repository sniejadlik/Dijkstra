"use strict";

(function main() {

	var Vec3 = THREE.Vector3;

	var container, stats, controls;
	var scene, light, camera, cameraCtrl, renderer;

	// scene
	container = document.getElementById('canvas-container');
	scene = new THREE.Scene();

	// camera
	camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 10000);
	// camera orbit control
	cameraCtrl = new THREE.OrbitControls(camera, container);
	cameraCtrl.object.position.z = 600;
	cameraCtrl.update();

	// renderer
	renderer = new THREE.WebGLRenderer({antialias: true , alpha: false});
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

	stats = new Stats();
	container.appendChild( stats.domElement );

	// grid & axis helper
		var grid = new THREE.GridHelper(600, 50);
		grid.setColors(0x00bbff, 0xffffff);
		grid.material.opacity = 0.1;
		grid.material.transparent = true;
		grid.position.y = -300;
		scene.add(grid);

		var axisHelper = new THREE.AxisHelper(50);
		scene.add(axisHelper);

	// Lights
		// top right
		// light = new THREE.DirectionalLight(0xE6EDF2, 0.8);
		// light.position.set(50, 150, 100).normalize();
		// scene.add(light);

		// // hemi
		// light = new THREE.HemisphereLight(0xE6EDF2, 0x000000, 1);
		// scene.add(light);

		// light = new THREE.AmbientLight(0x404040);
		// scene.add(light);


	// --- Main

	var scene_settings = {
		bgColor: 0x111113
	};

	

	line(new Vec3(), new Vec3(100, 100, 0));
	

	function line(v1, v2, cl) {
		var material = new THREE.LineBasicMaterial( {color: cl || 0xffffff} );
		var geometry = new THREE.Geometry();
		geometry.vertices.push(v1);
		geometry.vertices.push(v2);
		var l = new THREE.Line(geometry, material);
		scene.add(l);
	}





	function PriorityQueue() {
		this._elements = [];
	}

	PriorityQueue.prototype.enqueue = function (elem, priority) {
		var existingElem = this.isExists(elem);
		if (existingElem) {
			this._elements[existingElem].priority = priority;
		} else {
			this._elements.push({element: elem, priority: priority});
		}
		this.sort();
	};

	PriorityQueue.prototype.dequeue = function () {
		return this._elements.shift().element;
	};

	PriorityQueue.prototype.sort = function () {
		this._elements.sort(function (a, b) {
			return a.priority - b.priority;
		});
	};

	PriorityQueue.prototype.isExists = function (elem) {
		for (var i=0; i<this._elements.length; i++)
			if (this._elements[i].element === elem) return i;
		return false;
	};

	PriorityQueue.prototype.isEmpty = function () {
		return !this._elements.length;
	};


	/* 
	 * Dijkstra 
	 */

	 function Dijkstra(vertices) {
	 	this.Inf = Number.POSITIVE_INFINITY;
	 	this.vertices = vertices;
	 	this.pq = new PriorityQueue();
	 }

	 Dijkstra.prototype.shortestPath = function (source, target) {
	 	// Initialize
	 	var path = [],
	 		i, ilen;

	 	for (i=0, ilen = this.vertices.length; i<ilen; i++) {
	 		var v = this.vertices[i];
	 		if (v === source) {
	 			v.cost = 0;
	 			this.pq.enqueue(v, 0);
	 		} else {
	 			v.cost = this.Inf;
	 			this.pq.enqueue(v, this.Inf);
	 		}
	 		v.predecessor = null;
	 	}

	 	// Main
	 	while ( !this.pq.isEmpty() ) {
	 		var primary = this.pq.dequeue();

	 		if (primary === target) {
	 			while (primary.predecessor !== null) {
	 				path.push(primary);
	 				primary = primary.predecessor;
	 			}
	 			break;
	 		}

	 		for (i=0, ilen=primary.edges.length; i<ilen; i++) {
	 			var n = primary.edges[i].neighbor;
	 			var tempCost = primary.cost + n.distance;
	 			if (tempCost < n.cost) {
	 				n.cost = tempCost;
	 				n.predecessor = primary;
	 				this.pq.enqueue(n, tempCost);
	 			}
	 		}
	 	}
	 	return path;

	 }








	(function run() {

		requestAnimationFrame(run);
		renderer.setClearColor(scene_settings.bgColor, 1);



		renderer.render(scene, camera);
		stats.update();

	})();


	


	// utility functions

	function getRandomVector() {
		var v = new THREE.Vector3(THREE.Math.randFloatSpread(2), THREE.Math.randFloatSpread(2), THREE.Math.randFloatSpread(2));
		return v.normalize();
	}


	// browser events
	window.addEventListener('keypress', function (event) {
		if (event.keyCode === 32) {	// if spacebar is pressed
			event.preventDefault();
			scene_settings.pause = !scene_settings.pause;
		}
	});

	window.addEventListener('resize', onWindowResize, false);
	function onWindowResize() {
		var w = window.innerWidth;
		var h = window.innerHeight;
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		renderer.setSize(w, h);
	}

}());
