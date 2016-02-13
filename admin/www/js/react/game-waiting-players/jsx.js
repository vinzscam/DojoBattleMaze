'use strict';

module.exports = function(){
	return 	<div className="text-center">
				<div className="wait-players-container">
					<div className="wait-players" />
					<span className="text">Wait<br/>for<br/>players</span>
				</div>
				<ul className="wait-players-list">
					{ this.state.players.map( 
						(player, index) => <li key={index}>{player.name}</li> ) }
					}
				</ul>
				<div>
					<div className="btn" onClick={this.startGame}>Start</div>
				</div>
		</div>
}
