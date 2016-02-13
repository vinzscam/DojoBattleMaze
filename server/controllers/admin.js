'use strict';

var Enums = require('../../models/enums');
const intervalBattery = 2000;
module.exports = function(game){
	var intervalId = null;

	function getPlayersRaw(){
		var players = [];
		for(let player of game.getPlayers().values()){
			players.push(player.getRaw());
		}
		return players;
	}

	function getMatrix(){
		return game.getMatrix();
	}

	function getGame(){
		var matrix = game.getState() === Enums.STATE_NO_GAME ? undefined : getMatrix().getRaw();
		return {
			players: getPlayersRaw(),
			matrix: matrix,
			state: game.getState()
		};
	}

	function acceptConnections(){
		if(game.getState() != Enums.STATE_NO_GAME) return null;
		game.init(Enums.STATE_WAIT_FOR_PLAYERS);
		return {
			state: game.getState(),
			players: getPlayersRaw()
		};
	}

	function startGame(callbackPlayers, freemode){
		if(!freemode && game.getState() != Enums.STATE_WAIT_FOR_PLAYERS) return false;
		game.setState(Enums.STATE_PLAYING);
		freemode && game.enableFreeMode();
		startBatteryTask(callbackPlayers);
		return true;
	}

	function forceStopGame(){
		if(game.getState() != Enums.STATE_PLAYING) return;
		game.setState(Enums.STATE_FINISHED);
		stopBatteryTask();
		return{
			state: game.getState(),
			players: getPlayersRaw()
		};
	}

	function resetGame(){
		if(game.getState() === Enums.STATE_PLAYING || game.getState() === Enums.STATE_FINISHED ){
			game.init();
			stopBatteryTask();
		}
	}

	function startBatteryTask(callbackPlayers){
		var players = game.getPlayers();
		intervalId = setInterval(function(){
			var _players = {};
			for(var player of players.values()){
				var battery = player.getBattery();
				battery += Enums.BATTERY_STEP;
				battery = battery > Enums.BATTERY_MAX ? Enums.BATTERY_MAX : battery;
				!player.isDied() && player.setBattery(battery);
				_players[player.getName()] = {battery : battery, score: player.getScore(), lifes: player.getLifes()};
			}
			callbackPlayers && callbackPlayers(_players);
		}, intervalBattery);
	}

	function stopBatteryTask(){
		clearInterval(intervalId);
		intervalId = null;
	}

	function incrementBatteries(){

	}

	return{
		getGame,
		acceptConnections,
		startGame,
		forceStopGame,
		resetGame
	};
}