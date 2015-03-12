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
		this.$container = $(container);

		this.settings = $.extend({}, defaultSettings, settings);

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
			var maxRow = -1;
			var maxCol = -1;

			this.$container.find('.' + this.settings.stepClass).each(function() {
				var _row = $(this).data('row');
				var _col = $(this).data('col');
				var row = parseInt(_row);
				var col = parseInt(_col);

				if (isNaN(row)) {
					throw new Error('Hopscotch error: Incorrect data-row: "' + _row + '". Please, use integer values only.');
				}

				if (isNaN(col)) {
					throw new Error('Hopscotch error: Incorrect data-col: "' + _col + '". Please, use integer values only.');
				}

				var key = row + "_" + col;

				if (key in _this.steps) {
					throw new Error('Hopscotch error: Duplicate step detected: row: ' + _row + ', col: ' + _col + '. There should be only one step with the same row and col.');
				}

				Object.defineProperty(_this.steps, key, {
					__proto__: null,
					value: $(this)
				});

				$(this).css('top', _row * 100 + '%');
				$(this).css('left', _col * 100 + '%');

				maxRow = Math.max(maxRow, row);
				maxCol = Math.max(maxCol, col);
			});

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

		return this.each(function() {
			var $container = $(this);
			var instance = $container.data('hopscotch');

			if (!instance) {
				$container.data('hopscotch', new Hopscotch(this, settings));
			}
		});

	}

})(jQuery, document, window);