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
		// scene.add(axisHelper);

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


	function Line(v1, v2, cl) {
		this.material = new THREE.LineBasicMaterial( {color: cl || 0xffffff} );
		this.geometry = new THREE.Geometry();
		this.geometry.vertices.push(v1);
		this.geometry.vertices.push(v2);
		this.l = new THREE.Line(this.geometry, this.material);
		scene.add(this.l);
		return this;
	}

	Line.prototype.setColor = function (hex) {
		this.material.color.setHex(hex);
	};

	Line.prototype.setOpacity = function (opacity) {
		this.material.transparent = true;
		this.material.opacity = opacity;
	};





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
		this.vertices = vertices;
		this.pq = new PriorityQueue();
		this.path = [];
	}

	Dijkstra.prototype.shortestPath = function (source, target) {
		// Initialize
		
		var INFINITY = Number.POSITIVE_INFINITY;
		var i, ilen;

		for (i=0, ilen = this.vertices.length; i<ilen; i++) {
			var v = this.vertices[i];
			if (v === source) {
				v.cost = 0;
				this.pq.enqueue(v, 0);
			} else {
				v.cost = INFINITY;
				this.pq.enqueue(v, INFINITY);
			}
			v.predecessor = null;
			v.done = false;
		}

		// Main
		while ( !this.pq.isEmpty() ) {
			var primary = this.pq.dequeue();
			primary.done = true;

			if (primary === target) {
				while (primary.predecessor !== null) {
					this.path.push(primary);
					primary = primary.predecessor;
				}
				break;
			}

			if (primary.cost === INFINITY || !primary) continue;

			for (i=0, ilen=primary.edges.length; i<ilen; i++) {
				var n = primary.edges[i].getNeighbor(primary);
				if (n.done) continue;
				var edgeDist = primary.edges[i].distance;
				var tempCost = primary.cost + edgeDist;
				if (tempCost < n.cost) {
					n.cost = tempCost;
					n.predecessor = primary;
					this.pq.enqueue(n, tempCost);
				}
			}
		}
		return this.path;

	};



	function Node(pos) {
		THREE.Vector3.call(this, pos.x, pos.y, pos.z);
		this.geometry = new THREE.SphereGeometry( 1.5, 32, 32 );
		this.material = new THREE.MeshBasicMaterial( {color: 0x00ffff} );
		this.sphere = new THREE.Mesh( this.geometry, this.material );
		this.sphere.position = this;
		scene.add( this.sphere );

		this.edges = [];
	}

	Node.prototype = Object.create(THREE.Vector3.prototype);

	Node.prototype.setColor = function (hex) {
		this.material.color.setHex(hex);
	};

	Node.prototype.getEdge = function (node) {
		for (var i=0; i<this.edges.length; i++) {
			var nb = this.edges[i].getNeighbor(this);
			if ( nb === node) {
				return this.edges[i];
			}
		}
	};


	function Edge(nodeA, nodeB) {
		this.nodeA = nodeA;
		this.nodeB = nodeB;
		nodeA.edges.push(this);
		nodeB.edges.push(this);
		this.line = new Line(nodeA, nodeB);
		this.setOpacity(0.25);
		this.distance = null;
	}

	Edge.prototype.getNeighbor = function (node) {
		return (node === this.nodeA) ? this.nodeB : this.nodeA;
	};

	Edge.prototype.setColor = function (hex) {
		this.line.setColor(hex);
	};

	Edge.prototype.setOpacity = function (opacity) {
		this.line.setOpacity(opacity);
	};


	var allNodes = [];
	var allEdges = [];
	for (var i=0; i<250; i++) {
		var n = new Node( new Vec3(THREE.Math.randFloatSpread(400), THREE.Math.randFloatSpread(400), THREE.Math.randFloatSpread(400)) );
		allNodes.push(n);
	}


	var nSource = new Node(new Vec3(-150, -150, 150));
	var nTarget	= new Node(new Vec3(150, 150, -150));
	nSource.setColor(0x00ff00);
	nTarget.setColor(0xff0000);
	allNodes.push(nSource);
	allNodes.push(nTarget);


	for (var ii=0; ii<allNodes.length; ii++) {
		var na = allNodes[ii];
		for (var kk=ii+1; kk<allNodes.length; kk++) {
			var nb = allNodes[kk];
			var dist = na.distanceTo(nb);
			if ( dist < 100 && na.edges.length < 6 && nb.edges.length < 6) {
				var e = new Edge(na, nb);
				e.distance = dist;
				allEdges.push(e);
			}
		}
	}

	console.log('total Nodes:', allNodes.length);
	console.log('total Edges:', allEdges.length);


	var dijk = new Dijkstra(allNodes);
	var spath = dijk.shortestPath(nSource, nTarget);
	spath.push(nSource);
	spath.reverse();

	console.log(spath);
	console.log(dijk);

	// coloring nodes
	for (var nn=1; nn<spath.length; nn++) {	// nn=1 skip source
		var node = spath[nn];
		if (nn !== spath.length-1) {	// skip target
			node.setColor(0xffff00);
		}
	}

	// coloring edges
	for (var k=0; k<spath.length; k++) {
		var n1 = spath[k];
		for (var m=k+1; m<spath.length; m++) {
			var n2 = spath[m];
			var edge = n1.getEdge(n2);
			if (edge) {
				edge.setColor(0xff00ff);
				edge.line.setOpacity(1.0);
			}
		}
	}

	// var ee = nSource.getEdge(spath[0]);
	// ee.setColor(0xff00ff);



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
