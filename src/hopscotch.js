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
	var defaultSettings = {
		stepClass: 'hopscotch-step'
	};

	/**
	 * Creates a new Hopscotch instance.
	 * @constructor
	 * @param  {DOM Element} container
	 * @param  {Object}      settings 
	 */
	var Hopscotch = function(container, settings) {
		// main container
		this.$container = $(container);

		// plugin settings
		this.settings = $.extend({}, defaultSettings, settings);

		// holder for all steps
		this.steps = {};

		this.init();
	}

	/**
	 * Initializes the plugin.
	 */
	Hopscotch.prototype.init = function() {
		this.build();
	}

	/**
	 * Build the playground.
	 */
	Hopscotch.prototype.build = function() {
		var _this = this;

		try {
			// we'll save the largest row and col here
			var maxRow = -1;
			var maxCol = -1;

			// loop through all steps
			this.$container.find('.' + this.settings.stepClass).each(function() {
				var _row = $(this).data('row');
				var _col = $(this).data('col');
				var row = parseInt(_row);
				var col = parseInt(_col);

				// allow only integer row values
				if (isNaN(row)) {
					throw new Error('Hopscotch error: Incorrect data-row: "' + _row + '". Please, use integer values only.');
				}

				// allow only integer col values
				if (isNaN(col)) {
					throw new Error('Hopscotch error: Incorrect data-col: "' + _col + '". Please, use integer values only.');
				}

				// the key of this step
				var key = row + "_" + col;

				// disallow multiple steps with the same row & col
				if (key in _this.steps) {
					throw new Error('Hopscotch error: Duplicate step detected: row: ' + _row + ', col: ' + _col + '. There should be only one step with the same row and col.');
				}

				// add this step to our holder
				Object.defineProperty(_this.steps, key, {
					__proto__: null,
					value: $(this)
				});

				// move each step to its appropriate location
				$(this).css('top', _row * 100 + '%');
				$(this).css('left', _col * 100 + '%');

				// test against the current max row & col
				maxRow = Math.max(maxRow, row);
				maxCol = Math.max(maxCol, col);
			});

			// resize the main container to fit all steps
			if (maxRow > -1 && maxCol > -1) {
				this.$container.css('width', (maxCol + 1) * 100 + '%');
				this.$container.css('height', (maxRow + 1) * 100 + '%');
			}
		} catch (e) {
			console.error(e.message);
		}
	}

	/**
	 * Register as a jQuery plugin.
	 * @param {Object|String} settings
	 * @return {jQuery Object}
	 */
	$.fn.hopscotch = function(settings) {

		// allow multiple instances
		return this.each(function() {
			var $container = $(this);
			var instance = $container.data('hopscotch');
			
			if (!instance) {
				$container.data('hopscotch', new Hopscotch(this, settings));
			}
		});

	}

})(jQuery, document, window);