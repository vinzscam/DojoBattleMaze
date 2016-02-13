const Reflux = require('reflux');
const Colors = require('./colors');
module.exports = function(Actions, Matrix){

	var matrix = Reflux.createStore({
		init: function(){
			this.data = new Matrix(20);
			this.listenTo(Actions.statusChanged, this.gameChanged);
		},
		gameChanged: function(game){
			game.matrix && this.updateMatrix(game.matrix);
		},
		updateMatrix: function(rawMatrix){
			this.data = new Matrix(rawMatrix);
			this.trigger(this.data);
		}
	});

	var players = Reflux.createStore({
		init: function(){
			this.data = [];
			this.listenTo(Actions.statusChanged, this.gameChanged);
			this.listenTo(Actions.playerRegistered, this.addPlayer);
			this.listenTo(Actions.playersUpdate, this.playersStatsUpdate);
		},
		playersStatsUpdate: function(update){
			var toRemove = [];
			this.data.forEach(player => {
				if(!update[player.name]){
					toRemove.push(player);
					return;
				}
				player.battery = update[player.name].battery;
				player.score   = update[player.name].score;
				player.lifes   = update[player.name].lifes;
			});
			if(toRemove.length){
				this.data = this.data.filter( x =>  toRemove.indexOf(x) < 0 );	
			}
			this.trigger(this.data);
		},
		gameChanged: function(game){
			this.updatePlayers(game.players);
		},
		updatePlayers: function(players){
			players.forEach(function(player, index){
				player.color = Colors.players[index % players.length].substr(1);
			});
			this.data = players;
			this.trigger(this.data);
		},				
		addPlayer: function(player){
			this.data.push(player);
			player.color = Colors.players[this.data.length - 1].substr(1);
			this.trigger(this.data);
		}
	});

	/* XXX conflitto in statusChanged tra state e visualizzazione di game-play
		risolto spostando state per ultimo. Forse qualche browser tratta in maniera diversa
		ordine del listener
	*/
	var state = Reflux.createStore({
		init: function(){
			this.data = 0;
			this.listenTo(Actions.statusChanged, this.gameChanged);
		},
		gameChanged: function(game){
			this.updateState(game.state);
		},
		updateState: function(state){
			this.data = state;
			this.trigger(this.data);
		}
	});	

	return{
		state, matrix, players
	};
}