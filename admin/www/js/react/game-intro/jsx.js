'use strict';

module.exports = function(){
	return <div>
				<div className="board-sample-main">
					<div className={'robot-sample yellow ' + this.state.robot1State} />
					<h1 className="text-center board-sample-text">Dojo Battle Maze</h1>
					<div className={'robot-sample red ' + this.state.robot2State} />
					<div className="clearfix" style={{marginBottom: 40}}/>
					<div className="btn" onClick={this.startAcceptingConnections}>Start new game</div>
					<div className="clearfix" style={{marginBottom: 40}}/>
					<div className="btn" onClick={this.startFreeGame}>Free game</div>
				</div>
			</div>
}
