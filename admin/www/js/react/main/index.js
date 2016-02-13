const Matrix = require('../../../../../models/matrix');

module.exports = function(net){

	return React.createClass({
		getInitialState: function() {
			return {state: Stores.state.data};
		},
		componentDidMount: function(){
			this.unsubscribe = Stores.state.listen(this.onStatusChange);
		},
		componentWillUnmount: function(){
			this.unsubscribe();
		},
		onStatusChange: function(state){
			this.setState({state: state});
		},
		render: require('./jsx')(net)
	});
}