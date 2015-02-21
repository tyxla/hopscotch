// Hopscotch 0.1
// Copyright (c) 2015 Marin Atanasov (www.marinatanasov.com)
// Hopscotch is licensed under the terms of the MIT License

/**
 * Hopscotch - Javascript library for building infinite 2D paths that user can navigate through, similar to hopscotch playgrounds.
 *
 * @param container {mixed} - either a dom element reference or the string id of the container
 * @param options {object} - general options
 */
var Hopscotch = function(container, options) {
	this.initialize(container, options);
}

Hopscotch.prototype = {

	/**
	 * Constructor.
	 *
	 * @param container {mixed} - either a dom element reference or the string id of the container
	 * @param options {object} - general options
	 */
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