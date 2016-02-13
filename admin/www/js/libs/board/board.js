var enums = require('../../../../../models/enums');
var colors = require('../../colors');
module.exports = function(mainCanvas, matrix, gamePlayers, backgroundCanvas){
	var context = mainCanvas.getContext('2d');
	context.imageSmoothingEnabled = true;
	var m = null;
	var width;
	var players = new Map();
	var animating = false;
	var requestId = null;

	var animations = require('./animations')(realPoint, loadImages());
	var background = backgroundCanvas ? require('./background')(realPoint, backgroundCanvas, colors.bk) : null;
	init(matrix, gamePlayers);
	resize();

	function _enqueueAnimation(anim){
		var player = this;
		anim = anim.bind(player)();
		anim && player.queue.push(anim);
	}
	function loadImages(){
		var images = {
			PLAYER: 'static/images/player.png',
			PLAYER_FIRING: 'static/images/player-firing.png',
			LASER: 'static/images/laser.png'
		};
		var keys = Object.keys(images);
		var ret = {};
		keys.map(function(key){
			var img = new Image(); img.src = images[key];
			 ret[key] = img;
		});
		return ret;
	}

	function init(matrix, newPlayers){
		background && background.init(matrix);
		m = matrix;
		players = new Map();
		newPlayers.forEach(player => addPlayer(player));
	}

	function addPlayer(player){
		player.dir = enums.DIR_RIGHT;
		var animPlayer = {
			data  : player,
			queue : []
		};
		animPlayer.enqueueAnimation = _enqueueAnimation.bind(animPlayer);
		players.set(player.name, animPlayer);
		return animPlayer;
	}

	function updatePlayers(newPlayers){
		newPlayers.forEach( player => {
			if(!players.has(player.name)){
				addPlayer(player).enqueueAnimation(animations.nothing());
			}
		} );
	}

	function playerMoveTo(playerId, data){
		var player = players.get(playerId);
		if(!player) return;
		player.enqueueAnimation(animations.look(data.dir));
		player.enqueueAnimation(animations.move(data.dir));
	}

	function playerLookTo(playerId, data){
		var player = players.get(playerId);
		if(!player) return;
		player.enqueueAnimation(animations.look(data.dir));
	}

	function playerFireTo(playerId, data){
		var player = players.get(playerId);
		if(!player) return;
		player.enqueueAnimation(animations.look(data.dir));
		player.enqueueAnimation(animations.fireStep1(data.dir));
		player.enqueueAnimation(animations.fireStep2(data.length));
	}

	function playerTeleportTo(playerId, data){
		var player = players.get(playerId);
		if(!player) return;
		player.enqueueAnimation(animations.teleport1(data.x, data.y));
		player.enqueueAnimation(animations.teleport2());
	}

	function playerFired(playerId, data){
		var player = players.get(playerId);
		if(!player) return;
		player.queue = player.queue.length ? [player.queue[0]] : [];
		player.enqueueAnimation(animations.nothing());
		player.enqueueAnimation(animations.teleport1(data.x, data.y));
		player.enqueueAnimation(animations.teleport2());
	}


	function realPoint(val){
		return Math.ceil(val*width/m.rows);
	}

	function animate(){
		players.forEach(function(player){
			if(player.queue.length === 0) return;
			var now = Date.now();
			var anim = player.queue[0];
			if(!anim.started){
				anim.start = now;
				anim.end = anim.start + anim.duration;
				anim.onStart.bind(anim, player)();
				anim.started = true;
			}
			var end = (now - anim.start >= anim.duration);
			var t = (now - anim.start) / anim.duration;
			anim.onDraw.bind(anim, context, t, end)();
			end && player.queue.splice(0, 1) && anim.resolve && anim.resolve();
		});
		requestId = requestAnimationFrame(animate);
	}

	function startAnimate(){
		if(animating)stopAnimate();
		animating = true;
		background && background.draw();
		requestId = requestAnimationFrame(function(){
			animate();
			players.forEach(player => playerLookTo(player.data.name, {dir: player.data.dir}));
		});
		players.forEach( player => player.enqueueAnimation(animations.nothing()));
	}

	function stopAnimate(){
		cancelAnimationFrame(requestId);
		animating = false;
		requestId = null;
	}

	function resize(){
		width = parseInt(getComputedStyle(mainCanvas).width);
		background && background.resize();
		if(animating){
			stopAnimate();
			startAnimate();
		}
	}

	return{
		init,
		startAnimate,
		stopAnimate,
		playerMoveTo,
		playerLookTo,
		playerFireTo,
		playerTeleportTo,
		playerFired,
		resize,
		updatePlayers
	};
}