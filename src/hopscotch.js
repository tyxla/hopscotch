// Hopscotch 0.1
// Copyright (c) 2015 Marin Atanasov (www.marinatanasov.com)
// Hopscotch is licensed under the terms of the MIT License.

;(function ($, document, window) {

	'use strict';

	/**
	 * Global variables.
	 * @type {jQuery Object}
	 */
	var $doc    = $(document);
	var $win    = $(window);

	/**
	 * Default settings.
	 * @type {Object}
	 */
	var defaultSettings = {};

	/**
	 * Creates a new Hopscotch instance.
	 * @constructor
	 * @param  {DOM Element} container
	 * @param  {Object}      settings 
	 */
	var Hopscotch = function(container, settings) {
		this.container = $(container);

		this.settings = $.extend({}, defaultSettings, settings);

		this.init();
	}

	/**
	 * Initializes the plugin.
	 */
	Hopscotch.prototype.init = function() {

	}

	$.fn.hopscotch = function(settings) {
		return this.each(function() {

			var $container = $(this);
			var instance = $container.data('hopscotch');

			if (!instance) {
				$container.data('hopscotch', new Hopscotch(this, settings));
			}

		});
	}

})(jQuery, document, window);