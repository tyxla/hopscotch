// Hopscotch 0.1
// Copyright (c) 2015 Marin Atanasov (www.marinatanasov.com)
// Hopscotch is licensed under the terms of the MIT License

var Hopscotch = function(container, options) {
	this.initialize(container, options);
}

Hopscotch.prototype = {

	initialize: function(container, options) {
		var self = this;

		if (!container) {
			throw new Error("Hopscotch::initialize - No container reference or id has been provided.");
		}

		this.container = container.nodeName ? container : document.getElementById(container);
		if(!this.container) {
			throw new Error("Hopscotch::initialize - No container with reference or id of '" + container + "' exists.");
		}
	}

}