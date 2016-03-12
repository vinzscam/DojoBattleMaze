var Player = require('../../models/player');
var Enums = require('../../models/enums');

module.exports = function(game){
	function register(clientId, name){
		if(!game.isFreeModeEnabled( ) && 
			game.getState() !== Enums.STATE_WAIT_FOR_PLAYERS) return null;
		var players = game.getPlayers();
		if(players.get(clientId)) return;
		name = checkName(name);
		var pos = game.getMatrix().insert(clientId);
		var player = new Player(clientId, name, Enums.BATTERY_MAX, pos.x, pos.y, game.isFreeModeEnabled( ) ? 10 : 3)
		players.set(clientId, player);
		return player;
	}

	function checkName(name){
		var names = new Map( );
		var players = game.getPlayers( );
		players.forEach(item => names.set(item.getName(), true));
		if(names.get(name)){
			var i = 1;
			var base = name + '-';
			while(names.get(base + i)){
				i++;
			}
			name = base + i;
		}
		return name;
	}

	function getPlayer(clientId){
		return game.getPlayers().get(clientId);
	}

	function move(clientId, direction){
		var player = getPlayer(clientId);
		if(!player || player.getBattery() <= 0) return [false, null];
		if([-1, 10, 1, -10].indexOf(direction) == -1) return;
		var matrix = game.getMatrix();
		var newX = player.getX() + parseInt(direction/10), newY = player.getY() + (direction%10);
		var res = matrix.tryToMoveTo(player.getX(), player.getY(), newX, newY);
		if(res){
		 	player.setPosition(newX, newY);
		 	player.addBattery(-1);
		}
		return [res, res ? {dir: direction} : null];
	}

	function look(clientId, direction){
		var player = getPlayer(clientId);
		if(!player) return;
		if([-1, 10, 1, -10].indexOf(direction) == -1) return;
		var obj = game.getMatrix().look(player.getX(), player.getY(), parseInt(direction/10), (direction%10));
		if(typeof obj.item === 'string'){
			obj.item = Enums.ITEM_PLAYER;
		}
		return [obj, {dir: direction}];
	}

	function fire(clientId, direction){
		var player = getPlayer(clientId);
		if(!player) return;
		if([-1, 10, 1, -10].indexOf(direction) == -1) return [null, null];
		var matrix = game.getMatrix();
		var obj = matrix.look(player.getX(), player.getY(), parseInt(direction/10), (direction%10));
		var enemyId = obj.item;
		if(player.getBattery() < obj.distance) return [null, null];
		player.addBattery(-obj.distance);
		if(typeof enemyId !== 'string'){
			return [false, {dir: direction, length: obj.distance, died: false}];
		}
		var enemy = game.getPlayers().get(enemyId);
		var died = enemy.shooted();
		if(died)
			matrix.remove(enemy.getX(), enemy.getY());
		else
			var newEnemyPos = executeTeleport(enemy)[0];
		player.makePoint();
		return [true, {dir: direction, length: obj.distance, died: died}, 
			{enemyId: enemy.getId(), enemyName: enemy.getName(), newPos: newEnemyPos } ];
	}

	function position(clientId){
		var player = getPlayer(clientId);
		if(!player) return;
		return [{x: player.getX(), y: player.getY()}, null];
	}

	function battery(clientId){
		var player = getPlayer(clientId);
		if(!player) return;
		return [player.getBattery(), null];
	}

	function score(clientId){
		var player = getPlayer(clientId);
		if(!player) return;
		return [player.getScore(), null];
	}

	function teleport(clientId){
		var player = getPlayer(clientId);
		if(!player || player.getBattery() < 10) return [false, null];
		player.addBattery(-10);
		return executeTeleport(player);
	}

	function executeTeleport(player){
		var newPos = game.getMatrix().moveToRandom(player.getX(), player.getY());
		player.setPosition(newPos.x, newPos.y);
		return [newPos, newPos];
	}

	function remove(clientId){
		var player = getPlayer(clientId);
		if(!player) return;
		game.getMatrix().remove(player.getX(), player.getY());
		//var players = game.getPlayers();
		//players.delete(clientId);
	}

	return {
		register,
		move,
		look,
		fire,
		position,
		battery,
		score,
		teleport,
		remove
	};
}