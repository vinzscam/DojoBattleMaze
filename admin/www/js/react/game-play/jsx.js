'use strict';
const Leaderboard = require('../leaderboard')();

module.exports = function(){
	return <div className="light-container">
			<div className="top-stripe">Dojo Battle Maze</div>
			<div className="container-fluid">
				<div className="row">
					<div className="col-md-7">
						<div className="canvas-container" ref="container">
							<canvas ref="background"></canvas>
							<canvas ref="board"></canvas>
						</div>
					</div>
					<div className="col-md-5" style={{paddingTop: 100}}>
						<Leaderboard players={this.state.players} header="Leaderboard" />
						<div className="text-center">
							{this.props.state === 3 ? <div className="btn btn-dark" 
								onClick={this.stopGame} style={{marginTop: 20}}>Finish game</div> : '' }
							<div className="clearfix" style={{marginTop: 20}}/>
							<div className="btn btn-dark" onClick={this.resetGame}>Reset game</div>
						</div>
					</div>
				</div>
			</div>			
		</div>
}
