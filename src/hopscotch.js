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
		stepClass: 'hopscotch-step',
		loadedClass: 'hopscotch-loaded',
		startAt: {
			row: false,
			col: false,
		},
		directionNav: {
			up: false,
			right: false,
			down: false,
			left: false
		}
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
		this.buildPlayground();

		this.buildDirectionNav();

		this.start();
	}

	/**
	 * Build the hopscotch playground.
	 */
	Hopscotch.prototype.buildPlayground = function() {
		var _this = this;

		try {
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
				var key = _this.getStepKey(row, col);

				// disallow multiple steps with the same row & col
				if (key in _this.steps) {
					throw new Error('Hopscotch error: Duplicate step detected: row: ' + _row + ', col: ' + _col + '. There should be only one step with the same row and col.');
				}

				// preserve the integer values for future use
				$(this).data('_row', _row);
				$(this).data('_col', _col);

				// if there is no startAt specified, populate it
				if (
					_this.settings.startAt.row === false || 
					_this.settings.startAt.col === false || 
					typeof _this.settings.startAt.row === 'undefined' || 
					typeof _this.settings.startAt.col === 'undefined'
				) {
					_this.settings.startAt.row = _row;
					_this.settings.startAt.col = _col;
				}

				// add this step to our holder
				Object.defineProperty(_this.steps, key, {
					__proto__: null,
					value: $(this)
				});

				// move each step to its appropriate location
				$(this).css({
					transform: 'translate3d(' + (_col * 100) + '%, ' + (_row * 100) + '%, 0)'
				});
			});

		} catch (e) {
			// display error messages (if any)
			console.error(e.message);
		}
	}

	/**
	 * Build the direction navigation.
	 */
	Hopscotch.prototype.buildDirectionNav = function() {
		var _this = this;
		var direction;

		// loop through all directions
		for(direction in this.settings.directionNav) {
			// check if an element has been setup for this direction
			if (typeof this.settings.directionNav[direction] !== 'undefined' && this.settings.directionNav[direction]) {
				// setup a click handler that triggers a hopscotch:move event
				(function(direction, _this) {
					$(_this.settings.directionNav[direction]).on('click', function(event) {
						_this.$container.trigger('hopscotch:move', direction);
						event.preventDefault();
					});
				})(direction, _this);
			}
		}
	}

	/**
	 * Navigate to a certain step (identified by row and col).
	 * @param  {Integer} row
	 * @param  {Integer} col
	 */
	Hopscotch.prototype.navigateTo = function(row, col) {
		var key = this.getStepKey(row, col);

		// make sure that the step is valid
		try {
			if (!(key in this.steps)) {
				throw new Error('Hopscotch error: No step exists at row ' + row + ' and col ' + col + '.');
			}
		} catch(e) {
			// display error messages (if any)
			console.error(e.message);
		}

		// perform animation to that step
		var _row = -1 * row;
		var _col = -1 * col;
		this.$container.css({
			transform: 'translate3d(' + (_col * 100) + '%, ' + (_row * 100) + '%, 0)'
		});
	}

	/**
	 * Start by going to the initial step.
	 */
	Hopscotch.prototype.start = function() {
		var _this = this;

		// navigate to the initial step
		var startRow = _this.settings.startAt.row;
		var startCol = _this.settings.startAt.col;
		_this.navigateTo(startRow, startCol);

		// add the loaded class
		setTimeout(function() {
			_this.$container.addClass(_this.settings.loadedClass);
		}, 5);
	}

	/**
	 * Build the step key out of row and col
	 */
	Hopscotch.prototype.getStepKey = function(row, col) {
		return row + '_' + col;
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