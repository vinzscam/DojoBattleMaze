const Reflux = require('reflux');

module.exports = function(){
	var Actions = Reflux.createActions([
		'connect', 'statusChanged', 'playerRegistered', 'playersUpdate'
	]);

	return Actions;
}
