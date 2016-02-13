module.exports = function(){
	return React.createClass({
		getInitialState: function() {
    		return {players: Stores.players.data};
  		},
  		componentDidMount: function(){
         this.unsubscribe = Stores.players.listen(this.onPlayersChange);
  		},
      onPlayersChange: function(players){
         this.setState({players: players});
      },
  		componentWillUnmount: function(){
         this.unsubscribe();
  		},
      startGame: function(){
        this.props.net.startGame();
      },
		  render: require('./jsx')
	});
}