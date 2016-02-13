'use strict';
const Colors = require('../../colors');
const off = 0.4;
module.exports = function(){
	return <div className="d-table container-fluid">
				<div className="d-table-header row">
					{this.props.header}
				</div>
				{this.props.players.map((player, index) => 
					<div key={index} className="d-table-line row row-no-padding" style={{backgroundColor: Colors.players[index % Colors.players.length]}}>
						<div className="col-xs-5 d-table-line-item">
							{player.name}
						</div>
						<div className="col-xs-3">
							<div className="table-life-img" style={{opacity: player.lifes == 0 ? off : 1.0}}/>
							<div className="table-life-img" style={{opacity: player.lifes <= 1 ? off : 1.0}} />
							<div className="table-life-img" style={{opacity: player.lifes <= 2 ? off : 1.0}} />
							{player.lifes > 3 ? ('+' + (player.lifes - 3)) : ''}
							<div className="clearfix"></div>
						</div>
						<div className="col-xs-2 d-table-points">
							{player.score} pts
						</div>
						<div className="col-xs-2">
							<div className="progress">
  								<div className="progress-bar" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style={{width: player.battery + '%'}}>
  								</div>
  								<div className="bar-value">{player.battery}</div>
							</div>
						</div>
					</div>
				)}
				
			</div>;
}
