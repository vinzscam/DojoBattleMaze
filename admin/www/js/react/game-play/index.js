const Board = require('../../libs/board/board');
//const Matrix = require('../../../../../models/matrix');
const Enums = require('../../../../../models/enums');

module.exports = function(){
	var toCamelCased = function(string){
		return string.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
	};
	var fncs = ['player-move', 'player-look', 'player-fire', 
		'player-teleport', 'player-fired'];

	return React.createClass({
		getInitialState: function() {
			return {players: Stores.players.data, matrix: Stores.matrix.data};
		},
		onResize: function(){
			var container = this.refs.container;
			var canvas = this.refs.board;
			var background = this.refs.background;
			var height = getComputedStyle(container).width;
			container.style.height = height;
			canvas.width = parseInt(height);
			canvas.height = parseInt(height);
			background.width = parseInt(height);
			background.height = parseInt(height);
			this.board.resize();
		},
		componentDidMount: function(){
			var canvas = this.refs.board;
			var background = this.refs.background;
			this.board = Board(canvas, this.state.matrix, this.state.players, background);
			window.addEventListener('resize', this.onResize);
			//TODO BUG QUADRATO GIOCATORE INIZIALE, BUG SINCRONIZZAZIONE GAME <-> BOARD
			this.onResize();
			this.board.startAnimate();
			fncs.forEach(func => {
				this.props.net.emitter.on(func, this[toCamelCased(func)]);
			});
			this.unsubscribe = Stores.players.listen(this.onPlayersChange);
		},
		componentWillUnmount: function(){
			this.unsubscribe();
			fncs.forEach(func => {
				this.props.net.emitter.removeListener(func, this[toCamelCased(func)]);
			});
			this.board.stopAnimate();
			this.board = null;
			window.removeEventListener('resize', this.onResize);
		},
      	onPlayersChange: function(players){
      		players.length !== this.state.players && this.board.updatePlayers(players);
        	this.setState({players: players});
      	},
		playerMove: function(data){
			this.board.playerMoveTo(data.player, data.data);
		},
		playerLook: function(data){
			this.board.playerLookTo(data.player, data.data);
		},
		playerFire: function(data){
			this.board.playerFireTo(data.player, data.data);
		},
		playerFired: function(data){
			this.board.playerFired(data.player, data.data);
		},		
		playerTeleport: function(data){
			this.board.playerTeleportTo(data.player, data.data);
		},
		stopGame: function(){
			this.props.net.stopGame();
		},
		resetGame: function(){
			this.props.net.resetGame();
		},
		render: require('./jsx')
	});
}