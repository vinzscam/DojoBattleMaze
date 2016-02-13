const Board = require('../../libs/board/board');
const Matrix = require('../../../../../models/matrix');
const Enums = require('../../../../../models/enums');

//mainCanvas, matrix, gamePlayers, backgroundCanvas
module.exports = function(){
	return React.createClass({
		getInitialState: function() {
			return {
				robot1State: 'up',
				robot2State: 'up'
			};
		},
		componentDidMount: function(){
			this.runAnimation = true;
			this.animateRobot('robot1State');
			this.animateRobot('robot2State');
		},
		animateRobot: function( prop ){
			var states = ['up', 'left', 'right', 'down'];
			setTimeout( () => {
				var state = {};
				state[prop] = states[Math.floor(Math.random() * (states.length))];
				this.runAnimation && this.setState(state);
				this.runAnimation && this.animateRobot(prop);
			}, Math.round(Math.random() * (1500)) + 500);
		},
		componentWillUnmount: function(){
			this.runAnimation = false;
		},
		demoPlayer: function(){
			var action = Math.floor(Math.random() * 3);
			var dirs = [Enums.DIR_UP, Enums.DIR_LEFT, Enums.DIR_RIGHT, Enums.DIR_DOWN];
			var i = Math.floor(Math.random() * dirs.length);
			var dir = dirs[i];
			var player = players[0];
			var newX = player.x + parseInt(dir/10), newY = player.y + (dir%10);
			if(newX < 0 || newY < 0 || newX >= rows || 
				newY >= rows) return;
			board.playerMoveTo('sample', {dir: dir});
		},
		startAcceptingConnections: function(){
			this.props.net.acceptConnections()
			.then(function(resp){
				//TODO sistemare
				!resp && alert('Errore');
			});
		},
		startFreeGame: function( ){
			this.props.net.startFreeMode()
		},
		render: require('./jsx')
	});
}