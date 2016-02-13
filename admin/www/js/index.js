const Matrix = require('../../../models/matrix');

window.Promise = require('bluebird');
window.LiveReloadOptions = { host: 'localhost', port: 35829 };
require('livereload-js');
var enums = require('../../../models/enums');
window.React = require('react');
var ReactDOM = require('react-dom');

var net = require('./libs/net')('localhost:3000/admin');
var Actions = require('./actions')(net, Matrix);
window.Stores = require('./stores')(Actions, Matrix);

function onConnect(){
	net.register()
	.then(function(game){
		Actions.statusChanged(game);
	}).catch(function(error){ console.log('error!', error);});
}

net.emitter.on('connect', onConnect)
.on('status-changed', Actions.statusChanged)
.on('player-registered', Actions.playerRegistered)
.on('players-update', Actions.playersUpdate);

window._net = net;
window._main = ReactDOM.render(React.createElement(require('./react/main/')(net)),
	document.getElementById('container'));

