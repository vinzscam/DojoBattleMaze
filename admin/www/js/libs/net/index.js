var EventEmitter = require('events').EventEmitter;
var io = require('socket.io-client');

module.exports = function(url){
	var emitter = new EventEmitter();

	var socket = io(url, {transports: ['websocket']});
	
	/*
	socket.on('connect', function(){
	});
	*/

	socket.on('table', function(data){
		//TODO update table
	});
	socket.on('connect_error', function(err){
		console.log('connection error!', err);
	});
	socket.on('disconnect', function(){
		//TODO
	});

	setupEmitter();
	function setupEmitter(){
		var fnc = ['player-move', 'player-look', 'player-fire', 'player-fired',
		'player-teleport', 'connect', 'status-changed', 'player-registered', 'players-update'];
		fnc.forEach(name => socket.on(name, data => emitter.emit(name, data)));
	}

	//TODO implementare ['player-move', 'player-look', 'player-fire', 'player-teleport'];
	//TODO event listener unico??!? event emitter!
	function register(){
		return new Promise(function(resolve, reject){
			if(!socket.connected){reject(new Error('Not connected to the server')); return;}
			socket.emit('admin-register', {}, function(game){
				resolve(game);
			});
		});
	}

	function addOnConnectListener(listener){
		if(socket.connected) listener();
		socket.addEventListener('connect', listener);
	}

	function removeOnConnectListener(listener){
		socket.addEventListener('connect', listener);
	}

	function acceptConnections(){
		return new Promise(function(resolve, reject){
			if(!socket.connected){reject(); return;}
			socket.emit('game-accept-registrations', null, function(response){
				return response ? resolve(true) : reject(new Error('Unable to register as admin'));
			});
		});
	}

	function startGame(){
		socket.emit('game-start');
	}

	function startFreeMode(){
		socket.emit('game-start-free-mode');
	}

	function stopGame(){
		socket.emit('game-force-stop');
	}

	function resetGame(){
		socket.emit('game-reset');
	}

	function getEmitter(){
		return emitter;
	}



	return{
		//TODO remove in the future
		socket: socket,
		register,
		acceptConnections,
		startGame,
		startFreeMode,
		emitter,
		stopGame,
		resetGame
	}
}