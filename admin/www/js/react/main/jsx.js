'use strict';
const Intro = require('../game-intro')();
const Waiting = require('../game-waiting-players')();
const GamePlay = require('../game-play')();
module.exports = function(net){
	return function (){
		return <div >
				{this.state.state === 1 ? <Intro net={net} /> : ''}
				{this.state.state === 2 ? <Waiting net={net} /> : ''}
				{this.state.state === 3 || this.state.state === 4 ? <GamePlay ref="play" net={net} state={this.state.state} /> : ''}
			</div>
	}
}
