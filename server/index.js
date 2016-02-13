const Matrix = require('../models/matrix');
const Enums = require('../models/enums');
const Game = require('./game');
module.exports = function(){
	const NUMBER_OF_ROWS = Enums.NUMBER_OF_ROWS;
	const DELAY = 500;
	var game = Game(NUMBER_OF_ROWS);

	var app = require('http').createServer(null);
	var io = require('socket.io')(app, {transports: 'websocket'});
	var controller = require('./controllers/clients')(game);
	var adminController = require('./controllers/admin')(game);

	function emitPlayersUpdate(players){
		socketAdmins.emit('players-update', players);
	}

	var socketClients = io.of('/client').on('connection', function(socket){
		socket.on('register', function(data, fn){
			var player = controller.register(socket.id, data);
			if(player){
				var fnc = ['look', 'position', 'battery', 'score'];
				var ackFnc = ['move', 'teleport'];
				fnc.forEach(name => socket.on(name, function(_data, _fn){
					var resp = controller[name](socket.id, _data);
					if(resp == null) return;
					_fn(resp[0]);
					resp[1] && socketAdmins.emit('player-' + name, {player: player.getName(), data: resp[1]});
				}));
				ackFnc.forEach(name => socket.on(name, function(_data, _fn){
					setTimeout(() => {
						var resp = controller[name](socket.id, _data);
						if(player.isDied() || resp == null){
							_fn({ack: false});
						}
						else{
							_fn({ack: true, data: resp[0]});
							resp[1] && socketAdmins.emit('player-' + name, {player: player.getName(), data: resp[1]});
						}
					}, DELAY);
				}));
				socket.on('fire', function(_data, _fn){
					setTimeout(() => {
						var resp = controller.fire(socket.id, _data);
						if(player.isDied() || resp == null){
							_fn({ack: false});
						}
						else{
							_fn({ack: true, data: resp[0]});
							resp[0] && io.of('/client').to(resp[2].enemyId).emit('player-fired', resp[1].died);
							resp[0] && socketAdmins.emit('player-fired', {player: resp[2].enemyName, data: resp[2].newPos });
							resp[1] && socketAdmins.emit('player-fire', {player: player.getName(), data: resp[1]});
						}
					}, DELAY);
				});
				socketAdmins.emit('player-registered', player.getRaw());
				//TODO fix
				game.isFreeModeEnabled() && setTimeout(() => {socket.emit('game-started'); console.log('game started!!!');}, 500 );
				fn(player.getName());
				return;
			}
			fn(null);
		});
		socket.on('disconnect', function(){ 
			game.isFreeModeEnabled( ) && controller.remove(socket.id);
		});
		//TODO fix
		(game.getState() === Enums.STATE_WAIT_FOR_PLAYERS || game.isFreeModeEnabled( )) 
			&& setTimeout(function(){socket.emit('game-accept-registrations');}, 500);
	});

	var socketAdmins = io.of('/admin').on('connection', function(socket){

		socket.on('admin-register', function(data, fn){
			fn(adminController.getGame());

			socket.on('game-accept-registrations', function(_data, _fn){
				var ret = adminController.acceptConnections();
				_fn(!!ret);
				if(ret){
					socketAdmins.emit('status-changed', ret);
					socketClients.emit('game-accept-registrations');
				}
			});
			socket.on('game-start', function(_data, _fn){
				var ret = adminController.startGame(emitPlayersUpdate);
				_fn && _fn(ret);
				socketAdmins.emit('status-changed', adminController.getGame());
				ret && socketClients.emit('game-started');
			});
			socket.on('game-start-free-mode', function(_data, _fn){
				var ret = adminController.startGame(emitPlayersUpdate, true);
				_fn && _fn(ret);
				socketAdmins.emit('status-changed', adminController.getGame());
				ret && socketClients.emit('game-started');				
			});
			socket.on('game-force-stop', function(_data, _fn){
				var ret = adminController.forceStopGame();
				if(ret){
					socketAdmins.emit('status-changed', ret);
					socketClients.emit('game-ended');	
				}
			});
			socket.on('game-reset', function(_data){
				adminController.resetGame();
				socketAdmins.emit('status-changed', adminController.getGame());
				socketClients.emit('game-ended');
			});
		});

		socket.on('disconnect', function(){ });
	});

	var server = app.listen(3000, function(){
		console.log('*** server started on ' + server.address().address + ':' + server.address().port + ' ***');
	});
}