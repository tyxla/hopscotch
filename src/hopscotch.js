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
		disabledClass: 'hopscotch-disabled',
		startAt: {
			row: false,
			col: false,
		},
		directionNav: {
			up: false,
			right: false,
			down: false,
			left: false
		},
		enableArrowKeyNav: true,
		enableSwipeNav: true,
		swipeThreshold: 75,
		debug: false
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

		// the current step
		this.currentStep = false;

		this.init();
	}

	/**
	 * All available directions.
	 * @type {Array}
	 */
	Hopscotch.prototype.DIRECTIONS = ['up', 'down', 'left', 'right'];

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

		// add click handlers for all direction buttons
		for(direction in this.settings.directionNav) {
			// check if an element has been setup for this direction
			if (typeof this.settings.directionNav[direction] !== 'undefined' && this.settings.directionNav[direction]) {
				// setup a click handler that triggers a move
				(function(direction, _this) {
					$(_this.settings.directionNav[direction]).on('click', function(event) {
						_this.move(direction);
						event.preventDefault();
					});
				})(direction, _this);
			}
		}

		// add keyup handlers for all direction arrow keys (if enabled)
		if (this.settings.enableArrowKeyNav) {
			$doc.on('keyup', function(event) {
				var direction = false; 

				// if an arrow key is pressed, determine its direction
				switch (event.which) {
					case 37:
						direction = 'left';
					break;
					case 38:
						direction = 'up';
					break;
					case 39:
						direction = 'right'
					break;
					case 40:
						direction = 'down';
					break;
				}

				// if an arrow key was pressed, move in that direction
				if (direction) {
					_this.move(direction);
				}
			});
		}

		// add swipe handlers for all directions (if enabled and available)
		if (this.settings.enableSwipeNav && typeof $(document).swipe === 'function') {

			// called on swipe on all directions
			var onSwipe = function(event, direction, distance, duration, fingerCount) {
				_this.move(direction);
			}

			// initialize touchSwipe
			$doc.swipe({
				threshold: _this.settings.swipeThreshold,

				swipeUp: onSwipe,
				swipeDown: onSwipe,
				swipeLeft: onSwipe,
				swipeRight: onSwipe
			});
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
		if (!(key in this.steps)) {
			if (this.settings.debug) {
				console.log('Hopscotch warning: No step exists at row ' + row + ' and col ' + col + '.');
			}
			return false;
		}

		// perform animation to that step
		var _row = -1 * row;
		var _col = -1 * col;
		this.$container.css({
			transform: 'translate3d(' + (_col * 100) + '%, ' + (_row * 100) + '%, 0)'
		});

		// mark this step as the current one
		this.currentStep = key;

		// synchronize with the current state
		this.sync();
	}

	/**
	 * Move at a certain direction
	 * @param  {String} direction
	 */
	Hopscotch.prototype.move = function(direction) {
		// get the current step, row and col
		var currentStep = this.steps[this.currentStep];
		var row = currentStep.data('_row');
		var col = currentStep.data('_col');

		// determine the next step
		var nextStep = this.getNextStep(row, col, direction);

		// if the next step does not exist, bail
		if (!nextStep) {
			return false;
		}

		// get the key of the next step
		var nextStepKey = this.getStepKey(nextStep.row, nextStep.col);

		// make sure that the step is valid
		if (!(nextStepKey in this.steps)) {
			if (this.settings.debug) {
				console.log('Hopscotch warning: No step exists at row ' + nextStep.row + ' and col ' + nextStep.col + '.');
			}
			return false;
		}

		// perform animation to that step
		var _row = -1 * nextStep.row;
		var _col = -1 * nextStep.col;
		this.$container.css({
			transform: 'translate3d(' + (_col * 100) + '%, ' + (_row * 100) + '%, 0)'
		});

		// mark this step as the current one
		this.currentStep = nextStepKey;

		// synchronize with the current state
		this.sync();
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
	 * Synchronize everything with the current state
	 */
	Hopscotch.prototype.sync = function() {
		// get the current step, row and col
		var currentStep = this.steps[this.currentStep];
		var currentRow = currentStep.data('_row');
		var currentCol = currentStep.data('_col');

		// toggle directionNav links based on their availability
		for(var dirKey in this.DIRECTIONS) {
			var direction = this.DIRECTIONS[dirKey];
			var nextStep = this.getNextStep(currentRow, currentCol, direction);
			var nextKey = this.getStepKey(nextStep.row, nextStep.col);

			if (nextKey in this.steps) {
				$(this.settings.directionNav[direction]).removeClass(this.settings.disabledClass);
			} else {
				$(this.settings.directionNav[direction]).addClass(this.settings.disabledClass);
			}
		}
	}

	/**
	 * Build the next step out of current row and col and direction.
	 * @param  {Integer} row
	 * @param  {Integer} col
	 * @param  {String}  direction
	 */
	Hopscotch.prototype.getNextStep = function(row, col, direction) {
		var nextStep = false;

		// make sure the direction is valid
		try {
			// determine the next step based on the current one and the direction
			switch(direction) {
				case 'up':
					nextStep = {
						row: row - 1,
						col: col
					}
				break;

				case 'down':
					nextStep = {
						row: row + 1,
						col: col
					}
				break;

				case 'left':
					nextStep = {
						row: row,
						col: col - 1
					}
				break;

				case 'right':
					nextStep = {
						row: row,
						col: col + 1
					}
				break;
			}
		} catch(e) {
			// display error messages (if any)
			console.error(e.message);
		}

		return nextStep;
	}

	/**
	 * Build the step key out of row and col
	 * @param  {Integer} row
	 * @param  {Integer} col
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