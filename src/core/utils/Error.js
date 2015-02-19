goog.provide('anychart.core.utils.Error');
goog.provide('anychart.core.utils.ISeriesWithError');
goog.require('anychart.core.Base');
goog.require('anychart.enums');
goog.require('anychart.utils');



/*
            <- value error width ->
                     ---
      x               |
                      |   <- upper value error
      e               |
      r             *****
           |--------*****--------|
      w      ^lower ***** ^ upper x error
      i               |
      d               |   <- lower value error
      t               |
                     ---
            <-value error width->

   */



/**
 * Class representing series error.
 * @param {anychart.core.utils.ISeriesWithError} series instance.
 * @extends {anychart.core.Base}
 * @constructor
 */
anychart.core.utils.Error = function(series) {
  goog.base(this);

  /**
   * Series instance.
   * @type {anychart.core.utils.ISeriesWithError}
   * @private
   */
  this.series_ = series;

  /**
   * Error mode.
   * @type {anychart.enums.ErrorMode}
   * @private
   */
  this.errorMode_ = anychart.enums.ErrorMode.BOTH;

  /**
   * X error.
   * @type {?(string|number)}
   * @private
   */
  this.xError_ = null;

  /**
   * X upper error.
   * @type {?(string|number|undefined)}
   * @private
   */
  this.xUpperError_ = undefined;

  /**
   * X lower error.
   * @type {?(string|number|undefined)}
   * @private
   */
  this.xLowerError_ = undefined;

  /**
   * Value error.
   * @type {?(string|number)}
   * @private
   */
  this.valueError_ = null;

  /**
   * Value upper error.
   * @type {?(string|number|undefined)}
   * @private
   */
  this.valueUpperError_ = undefined;

  /**
   * Value lower error.
   * @type {?(string|number|undefined)}
   * @private
   */
  this.valueLowerError_ = undefined;

  /**
   * X error width.
   * @type {number}
   * @private
   */
  this.xErrorWidth_ = 10;

  /**
   * Value error width.
   * @type {number}
   * @private
   */
  this.valueErrorWidth_ = 10;

  /**
   * X error stroke.
   * @type {(Function|acgraph.vector.Stroke)}
   * @private
   */
  this.xErrorStroke_ = '#1D8BD1';

  /**
   * Value error stroke.
   * @type {(Function|acgraph.vector.Stroke)}
   * @private
   */
  this.valueErrorStroke_ = '#1D8BD1';
};
goog.inherits(anychart.core.utils.Error, anychart.core.Base);


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.utils.Error.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_RECALCULATION;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.utils.Error.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.ConsistencyState.APPEARANCE;


/**
 * Sets error mode.
 * @param {string=} opt_value value.
 * @return {(anychart.enums.ErrorMode|anychart.core.utils.Error)} Error mode or self for chaining.
 */
anychart.core.utils.Error.prototype.errorMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeErrorMode(opt_value);
    if (this.errorMode_ != opt_value) {
      this.errorMode_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_RECALCULATION);
    }
    return this;
  }
  return this.errorMode_;
};


/**
 * Sets/gets x error.
 * @param {(string|number)=} opt_value X error.
 * @return {(anychart.core.utils.Error|string|number)} X error or self for chaining.
 */
anychart.core.utils.Error.prototype.xError = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.xError_ != opt_value) {
      this.xError_ = opt_value;
      this.xUpperError_ = this.xLowerError_ = undefined;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_RECALCULATION);
    }
    return this;
  }
  return this.xError_;
};


/**
 * Sets/gets x upper error.
 * @param {(string|number)=} opt_value X upper error.
 * @return {(anychart.core.utils.Error|string|number|undefined)} X upper error or self for chaining.
 */
anychart.core.utils.Error.prototype.xUpperError = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.xUpperError_ != opt_value) {
      this.xUpperError_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_RECALCULATION);
    }
    return this;
  }
  return this.xUpperError_;
};


/**
 * Sets/gets x lower error.
 * @param {(string|number)=} opt_value X lower error.
 * @return {(anychart.core.utils.Error|string|number|undefined)} X lower error or self for chaining.
 */
anychart.core.utils.Error.prototype.xLowerError = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.xLowerError_ != opt_value) {
      this.xLowerError_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_RECALCULATION);
    }
    return this;
  }
  return this.xLowerError_;
};


/**
 * Sets/gets value error.
 * @param {(string|number)=} opt_value Value error.
 * @return {(anychart.core.utils.Error|string|number)} Value error or self for chaining.
 */
anychart.core.utils.Error.prototype.valueError = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.valueError_ != opt_value) {
      this.valueError_ = opt_value;
      this.valueUpperError_ = this.valueLowerError_ = undefined;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_RECALCULATION);
    }
    return this;
  }
  return this.valueError_;
};


/**
 * Sets/gets value upper error.
 * @param {(string|number)=} opt_value Value upper error.
 * @return {(anychart.core.utils.Error|string|number|undefined)} Value upper error or self for chaining.
 */
anychart.core.utils.Error.prototype.valueUpperError = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.valueUpperError_ != opt_value) {
      this.valueUpperError_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_RECALCULATION);
    }
    return this;
  }
  return this.valueUpperError_;
};


/**
 * Sets/gets value lower error.
 * @param {(string|number)=} opt_value Value lower error.
 * @return {(anychart.core.utils.Error|string|number|undefined)} Value lower error or self for chaining.
 */
anychart.core.utils.Error.prototype.valueLowerError = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.valueLowerError_ != opt_value) {
      this.valueLowerError_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEEDS_RECALCULATION);
    }
    return this;
  }
  return this.valueLowerError_;
};


/**
 * Sets/gets x error width.
 * @param {number=} opt_value X error width.
 * @return {(anychart.core.utils.Error|number)} X error width or self for chaining.
 */
anychart.core.utils.Error.prototype.xErrorWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value);
    if (!isNaN(opt_value) && this.xErrorWidth_ != opt_value) {
      this.xErrorWidth_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.xErrorWidth_;
};


/**
 * Sets/gets value error width.
 * @param {number=} opt_value Value error width.
 * @return {(anychart.core.utils.Error|number)} Value error width or self for chaining.
 */
anychart.core.utils.Error.prototype.valueErrorWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value);
    if (!isNaN(opt_value) && this.valueErrorWidth_ != opt_value) {
      this.valueErrorWidth_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.valueErrorWidth_;
};


/**
 * Getter/setter for current x error stroke settings.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.utils.Error|acgraph.vector.Stroke|Function} .
 */
anychart.core.utils.Error.prototype.xErrorStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.xErrorStroke_) {
      this.xErrorStroke_ = stroke;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.xErrorStroke_;
};


/**
 * Getter/setter for current value error stroke settings.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.utils.Error|acgraph.vector.Stroke|Function} .
 */
anychart.core.utils.Error.prototype.valueErrorStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.valueErrorStroke_) {
      this.valueErrorStroke_ = stroke;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.valueErrorStroke_;
};


/**
 * Draw horizontal error line.
 * @param {acgraph.vector.Path} path Path.
 * @param {number} lowerX Lower x coordinate.
 * @param {number} upperX Upper x coordinate.
 * @param {number} y Y coordinate.
 * @param {number} errorWidth Error width.
 * @param {boolean} lowerPin Whether to draw lower error pin.
 * @param {boolean} upperPin Whether to draw upper error pin.
 * @private
 */
anychart.core.utils.Error.prototype.drawHorizontalErrorLine_ = function(path, lowerX, upperX, y, errorWidth, lowerPin, upperPin) {
  if (lowerPin)
    path.moveTo(lowerX, y - errorWidth / 2).lineTo(lowerX, y + errorWidth / 2);
  path.moveTo(lowerX, y).lineTo(upperX, y);
  if (upperPin)
    path.moveTo(upperX, y - errorWidth / 2).lineTo(upperX, y + errorWidth / 2);
};


/**
 * Draw vertical error line.
 * @param {acgraph.vector.Path} path Path.
 * @param {number} lowerY Lower y coordinate.
 * @param {number} upperY Upper y coordinate.
 * @param {number} x X coordindate.
 * @param {number} errorWidth Error width.
 * @param {boolean} lowerPin Whether to draw lower error pin.
 * @param {boolean} upperPin Whether to draw upper error pin.
 * @private
 */
anychart.core.utils.Error.prototype.drawVerticalErrorLine_ = function(path, lowerY, upperY, x, errorWidth, lowerPin, upperPin) {
  if (lowerPin)
    path.moveTo(x - errorWidth / 2, lowerY).lineTo(x + errorWidth / 2, lowerY);
  path.moveTo(x, lowerY).lineTo(x, upperY);
  if (upperPin)
    path.moveTo(x - errorWidth / 2, upperY).lineTo(x + errorWidth / 2, upperY);
};


/**
 * Is error available for scale.
 * @param {anychart.scales.Base} scale Scale.
 * @return {boolean} Availability.
 */
anychart.core.utils.Error.isErrorAvailableForScale = function(scale) {
  return (scale instanceof anychart.scales.ScatterBase) && (scale.stackMode() == anychart.enums.ScaleStackMode.NONE);
};


/**
 * Draws an error.
 * @param {anychart.scales.Base} scale Scale.
 * @param {boolean} horizontal Direction.
 * @param {boolean} isBarBased Whether series is bar based.
 * @param {number} x X coordinate.
 * @param {number} y Y coordinate.
 * @param {acgraph.vector.Path} path Path to draw error.
 * @param {number} lowerCoord Lower coordinate.
 * @param {number} upperCoord Upper coordinate.
 */
anychart.core.utils.Error.prototype.drawError = function(scale, horizontal, isBarBased, x, y, path, lowerCoord, upperCoord) {
  if (!anychart.core.utils.Error.isErrorAvailableForScale(scale))
    return;

  var constCoord = horizontal ? y : x;

  var lowerPin = !(lowerCoord == (horizontal ? x : y));
  var upperPin = !(upperCoord == (horizontal ? x : y));

  var errorWidth = /** @type {number} */ (horizontal ? this.xErrorWidth() : this.valueErrorWidth());

  !!(horizontal ^ isBarBased) ?
      this.drawHorizontalErrorLine_(path, lowerCoord, upperCoord, constCoord, errorWidth || 0, lowerPin, upperPin) :
      this.drawVerticalErrorLine_(path, lowerCoord, upperCoord, constCoord, errorWidth || 0, lowerPin, upperPin);
};


/**
 * Calculates coordinates and draw error.
 * @param {boolean} horizontal Direction.
 * @param {boolean} isBarBased Whether series is bar based.
 */
anychart.core.utils.Error.prototype.draw = function(horizontal, isBarBased) {
  var scale = horizontal ? this.series_.xScale() : this.series_.yScale();
  var iterator = this.series_.getIterator();
  var x = /** @type {number} */ (iterator.meta('x'));
  var y = /** @type {number} */ (iterator.meta('y'));
  var value = /** @type {number} */ (horizontal ? iterator.get('x') : iterator.get('value'));
  var stroke = this.getErrorStroke(horizontal);
  var path = this.series_.getErrorPath(stroke);

  var errValues = this.getErrorValues(horizontal);
  var lowerError = errValues[0];
  var upperError = errValues[1];
  /** @type {number} */
  var lowerCoord;
  /** @type {number} */
  var upperCoord;

  if (lowerError === 0 && upperError === 0)
    return;

  if (!!lowerError) {
    var lowerTypeWithError = scale.transform(value - lowerError);
    lowerCoord = this.series_.applyRatioToBounds(lowerTypeWithError, horizontal);
  } else {
    lowerCoord = horizontal ? x : y;
  }

  if (!!upperError) {
    var upperTypeWithError = scale.transform(value + upperError);
    upperCoord = this.series_.applyRatioToBounds(upperTypeWithError, horizontal);
  } else {
    upperCoord = horizontal ? x : y;
  }
  this.drawError(/** @type {anychart.scales.Base} */ (scale), horizontal, isBarBased, x, y, path, lowerCoord, upperCoord);
};


/**
 * Returns error stroke setting for current point .
 * @param {boolean} horizontal Is error drawn for horizontal (x).
 * @return {!acgraph.vector.Stroke}
 * @protected
 */
anychart.core.utils.Error.prototype.getErrorStroke = function(horizontal) {
  var iterator = this.series_.getIterator();
  var errorStroke = horizontal ? this.xErrorStroke() : this.valueErrorStroke();
  var pointStroke = horizontal ? iterator.get('xErrorStroke') : iterator.get('valueErrorStroke');

  var result = /** @type {!acgraph.vector.Stroke} */ (this.series_.normalizeColor(/** @type {acgraph.vector.Stroke|Function} */ (pointStroke || errorStroke)));
  result = acgraph.vector.normalizeStroke(result);

  if (goog.isObject(result) && ('keys' in result) && !goog.isObject(result['mode']))
    result['mode'] = this.series_.getPixelBounds();
  return result;
};


/**
 * Returns array of [lowerError, upperError].
 * @param {boolean} horizontal is error horizontal (x error).
 * @return {Array.<number, number>} Array of lower and upper errors value.
 */
anychart.core.utils.Error.prototype.getErrorValues = function(horizontal) {
  if (!this.series_.isErrorAvailable())
    return [0, 0];
  var type = horizontal ? 'x' : 'value';
  var typeError = type + 'Error';
  var typeLowerError = type + 'LowerError';
  var typeUpperError = type + 'UpperError';

  var iterator = this.series_.getIterator();
  var err = this;
  var error = iterator.get(typeError) || err[typeError]();
  var lowerError = iterator.get(typeLowerError) || err[typeLowerError]();
  var upperError = iterator.get(typeUpperError) || err[typeUpperError]();

  var hasError = (anychart.utils.isPercent(error) || !anychart.utils.isNaN(error));
  var needDrawUpperError = (anychart.utils.isPercent(upperError) || !anychart.utils.isNaN(upperError)) || hasError;
  var needDrawLowerError = (anychart.utils.isPercent(lowerError) || !anychart.utils.isNaN(lowerError)) || hasError;

  var typeValue = /** @type {number} */ (iterator.get(type));
  error = anychart.utils.normalizeSize(/** @type {number|string} */ (error), typeValue);

  if (needDrawLowerError) {
    if (lowerError) {
      lowerError = anychart.utils.normalizeSize(/** @type {number|string} */ (lowerError), typeValue);
    } else {
      lowerError = error / 2;
    }
  } else {
    lowerError = 0;
  }
  if (needDrawUpperError) {
    if (upperError) {
      upperError = anychart.utils.normalizeSize(/** @type {number|string} */ (upperError), typeValue);
    } else {
      upperError = error / 2;
    }
  } else {
    upperError = 0;
  }

  return [lowerError, upperError];
};


/**
 * @inheritDoc
 */
anychart.core.utils.Error.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['errorMode'] = this.errorMode();
  json['xError'] = this.xError();
  if (goog.isDef(this.xUpperError()))
    json['xUpperError'] = this.xUpperError();
  if (goog.isDef(this.xLowerError()))
    json['xLowerError'] = this.xLowerError();
  json['valueError'] = this.valueError();
  if (goog.isDef(this.valueUpperError()))
    json['valueUpperError'] = this.valueUpperError();
  if (goog.isDef(this.valueLowerError()))
    json['valueLowerError'] = this.valueLowerError();
  json['xErrorWidth'] = this.xErrorWidth();
  json['valueErrorWidth'] = this.valueErrorWidth();
  if (goog.isFunction(this['xErrorStroke'])) {
    if (goog.isFunction(this.xErrorStroke())) {
      anychart.utils.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['x error stroke']
      );
    } else {
      json['xErrorStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.xErrorStroke()));
    }
  }
  if (goog.isFunction(this['valueErrorStroke'])) {
    if (goog.isFunction(this.valueErrorStroke())) {
      anychart.utils.warning(
          anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
          null,
          ['value error stroke']
      );
    } else {
      json['valueErrorStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.valueErrorStroke()));
    }
  }
  return json;
};


/**
 * @inheritDoc
 */
anychart.core.utils.Error.prototype.setupSpecial = function(var_args) {
  var arg0 = arguments[0];
  if (goog.isString(arg0) || goog.isNumber(arg0) || goog.isNull(arg0)) {
    this.suspendSignalsDispatching();
    this.xError(arg0);
    this.valueError(arg0);
    this.resumeSignalsDispatching(true);
    return true;
  } else if (goog.isBoolean(arg0)) {
    if (arg0)
      this.errorMode(anychart.enums.ErrorMode.BOTH);
    else
      this.errorMode(anychart.enums.ErrorMode.NONE);
    return true;
  }
  return anychart.core.Base.prototype.setupSpecial.apply(this, arguments);
};


/**
 * @inheritDoc
 */
anychart.core.utils.Error.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.errorMode(config['errorMode']);
  this.xError(config['xError']);
  this.xUpperError(config['xUpperError']);
  this.xLowerError(config['xLowerError']);
  this.valueError(config['valueError']);
  this.valueUpperError(config['valueUpperError']);
  this.valueLowerError(config['valueLowerError']);
  this.xErrorWidth(config['xErrorWidth']);
  this.valueErrorWidth(config['valueErrorWidth']);
  this.xErrorStroke(config['xErrorStroke']);
  this.valueErrorStroke(config['valueErrorStroke']);
};



/**
 * @interface
 */
anychart.core.utils.ISeriesWithError = function() {
};


/**
 * Returns current mapping iterator.
 * @return {!anychart.data.Iterator} Current series iterator.
 */
anychart.core.utils.ISeriesWithError.prototype.getIterator;


/**
 * Gets final normalized fill or stroke color.
 * @param {acgraph.vector.Fill|acgraph.vector.Stroke|Function} color Normal state color.
 * @param {...(acgraph.vector.Fill|acgraph.vector.Stroke|Function)} var_args .
 * @return {!(acgraph.vector.Fill|acgraph.vector.Stroke)} Normalized color.
 * @protected
 */
anychart.core.utils.ISeriesWithError.prototype.normalizeColor;


/**
 * Returns pixel bounds of the element due to parent bounds and self bounds settings.
 * @return {!anychart.math.Rect} .
 */
anychart.core.utils.ISeriesWithError.prototype.getPixelBounds;


/**
 * Removes all error paths and clears hashes.
 */
anychart.core.utils.ISeriesWithError.prototype.resetErrorPaths;


/**
 * Returns error path for a stroke.
 * @param {!acgraph.vector.Stroke} stroke
 * @return {!acgraph.vector.Path}
 */
anychart.core.utils.ISeriesWithError.prototype.getErrorPath;


/**
 * Returns array of [lowerError, upperError].
 * @param {boolean} horizontal is error horizontal (x error).
 * @return {Array.<number, number>} Array of lower and upper errors value.
 */
anychart.core.utils.ISeriesWithError.prototype.getErrorValues;


/**
 * Applies passed ratio (usually transformed by a scale) to bounds where
 * series is drawn.
 * @param {number} ratio .
 * @param {boolean} horizontal .
 * @return {number} .
 * @protected
 */
anychart.core.utils.ISeriesWithError.prototype.applyRatioToBounds;


/**
 * Tester if the series can have an error..
 * @return {boolean}
 */
anychart.core.utils.ISeriesWithError.prototype.isErrorAvailable;


/**
 * Draws an error.
 * @protected
 */
anychart.core.utils.ISeriesWithError.prototype.drawError;

//exports
anychart.core.utils.Error.prototype['errorMode'] = anychart.core.utils.Error.prototype.errorMode;
anychart.core.utils.Error.prototype['xError'] = anychart.core.utils.Error.prototype.xError;
anychart.core.utils.Error.prototype['xUpperError'] = anychart.core.utils.Error.prototype.xUpperError;
anychart.core.utils.Error.prototype['xLowerError'] = anychart.core.utils.Error.prototype.xLowerError;
anychart.core.utils.Error.prototype['valueError'] = anychart.core.utils.Error.prototype.valueError;
anychart.core.utils.Error.prototype['valueUpperError'] = anychart.core.utils.Error.prototype.valueUpperError;
anychart.core.utils.Error.prototype['valueLowerError'] = anychart.core.utils.Error.prototype.valueLowerError;
anychart.core.utils.Error.prototype['xErrorWidth'] = anychart.core.utils.Error.prototype.xErrorWidth;
anychart.core.utils.Error.prototype['valueErrorWidth'] = anychart.core.utils.Error.prototype.valueErrorWidth;
anychart.core.utils.Error.prototype['xErrorStroke'] = anychart.core.utils.Error.prototype.xErrorStroke;
anychart.core.utils.Error.prototype['valueErrorStroke'] = anychart.core.utils.Error.prototype.valueErrorStroke;
