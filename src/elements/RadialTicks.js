goog.provide('anychart.elements.RadialTicks');
goog.require('acgraph');
goog.require('anychart.VisualBase');
goog.require('anychart.color');
goog.require('anychart.enums');
goog.require('anychart.utils');
goog.require('anychart.utils.Bounds');



/**
 * Axis radar ticks class.<br/>
 * You can change position, length and line features.
 * @constructor
 * @extends {anychart.VisualBase}
 */
anychart.elements.RadialTicks = function() {
  goog.base(this);

  /**
   * Ticks length.
   * @type {number}
   * @private
   */
  this.length_;

  /**
   * Ticks stroke.
   * @type {acgraph.vector.Stroke|string}
   * @private
   */
  this.stroke_;

  /**
   * Path with ticks.
   * @type {!acgraph.vector.Path}
   * @private
   */
  this.path_ = acgraph.path();
  this.registerDisposable(this.path_);

  this.restoreDefaults();
};
goog.inherits(anychart.elements.RadialTicks, anychart.VisualBase);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.RadialTicks.prototype.SUPPORTED_SIGNALS = anychart.VisualBase.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.RadialTicks.prototype.SUPPORTED_CONSISTENCY_STATES = anychart.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES; // ENABLED CONTAINER Z_INDEX


//----------------------------------------------------------------------------------------------------------------------
//
//  Properties.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for current ticks length.
 * @return {number} Length of ticks.
 *//**
 * Setter for ticks length.
 * @illustration <t>simple-h100</t>
 * stage.text(10,0, 'axis');
 * stage.text(10,40, 'tick');
 * stage.path()
 *     .moveTo(0, 15)
 *     .lineTo(stage.width(), 15)
 *     .stroke('5 black');
 * stage.path()
 *     .moveTo(stage.width()/5-stage.width()/10, 15)
 *     .lineTo(stage.width()/5-stage.width()/10, 55)
 *     .moveTo(2*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(2*stage.width()/5-stage.width()/10, 55)
 *     .moveTo(3*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(3*stage.width()/5-stage.width()/10, 55)
 *     .moveTo(4*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(4*stage.width()/5-stage.width()/10, 55)
 *     .moveTo(5*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(5*stage.width()/5-stage.width()/10, 55);
 * stage.path()
 *     .moveTo(stage.width()/5, 15)
 *     .lineTo(stage.width()/5, 55)
 *     .lineTo(stage.width()/5-5, 55)
 *     .lineTo(stage.width()/5+5, 55)
 *     .stroke('1 grey 1');
 * stage.triangleUp(stage.width()/5, 20, 3).stroke('1 grey 1');
 * stage.triangleDown(stage.width()/5, 50, 3).stroke('1 grey 1');
 * stage.text(stage.width()/5, 57, 'length');
 * @param {number=} opt_value Value to set.
 * @return {anychart.elements.RadialTicks} An instance of the {@link anychart.elements.RadialTicks} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value .
 * @return {(number|!anychart.elements.RadialTicks)} .
 */
anychart.elements.RadialTicks.prototype.length = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.length_ != opt_value) {
      this.length_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else
    return this.length_;
};


/**
 * Returns a current stroke settings.
 * @return {acgraph.vector.Stroke} Returns the current stroke settings.
 *//**
 * Sets stroke settings via single parameter.<br/>
 * The following options are acceptable:
 * <ul>
 *  <li>String formatted as '[thickness ]color[ opacity]':
 *    <ol>
 *      <li><b>'color'</b> - {@link http://www.w3schools.com/html/html_colors.asp}.</li>
 *      <li><b>'thickness color'</b> - like a css border, e.g. '3 red' or '3px red'</li>
 *      <li><b>'color opacity'</b> - as a fill string, e.g. '#fff 0.5'</li>
 *      <li><b>'thickness color opacity'</b> - as a complex string, e.g. '3px #00ff00 0.5'</li>
 *    </ol>
 *  </li>
 *  <li>{@link acgraph.vector.Stroke} object</li>
 *  <li>Keys array {@link acgraph.vector.GradientKey}</li>
 *  <li><b>null</b> - reset current stroke settings.</li>
 * </ul>
 * <b>Note:</b> String parts order is significant and '3px red' is not the same as 'red 3px'.
 * @shortDescription Sets stroke settings.
 * @illustration <t>simple-h100</t>
 * stage.text(10,0, 'axis');
 * stage.text(10,40, 'tick');
 * stage.path()
 *     .moveTo(0, 15)
 *     .lineTo(stage.width(), 15)
 *     .stroke('5 black');
 * stage.path()
 *     .moveTo(stage.width()/5-stage.width()/10, 15)
 *     .lineTo(stage.width()/5-stage.width()/10, 55)
 *     .moveTo(2*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(2*stage.width()/5-stage.width()/10, 55)
 *     .moveTo(3*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(3*stage.width()/5-stage.width()/10, 55)
 *     .moveTo(4*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(4*stage.width()/5-stage.width()/10, 55)
 *     .moveTo(5*stage.width()/5-stage.width()/10, 15)
 *     .lineTo(5*stage.width()/5-stage.width()/10, 55)
 *     .stroke('2 blue .7');
 * @example <t>listingOnly</t>
 *  ticks.stroke('2 blue .7');
 * @param {(acgraph.vector.Stroke)=} opt_value ['black'] Fill style as '[thickness ]color[ opacity]'.
 * @return {anychart.elements.RadialTicks} {@link anychart.elements.RadialTicks} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke)=} opt_value .
 * @return {(!anychart.elements.RadialTicks|acgraph.vector.Stroke)} .
 */
anychart.elements.RadialTicks.prototype.stroke = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = acgraph.vector.normalizeStroke(opt_value);
    if (this.stroke_ != opt_value) {
      this.stroke_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else
    return this.stroke_;
};


/**
 * Restore labels default settings.
 */
anychart.elements.RadialTicks.prototype.restoreDefaults = function() {
  this.length(5);
  this.stroke('black');

  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


/** @inheritDoc */
anychart.elements.RadialTicks.prototype.remove = function() {
  if (this.path_) this.path_.parent(null);
};


/**
 * Renders ticks.
 * @return {!anychart.elements.RadialTicks} {@link anychart.elements.Ticks} instance for method chaining.
 */
anychart.elements.RadialTicks.prototype.draw = function() {
  this.path_.clear();
  this.path_.stroke(this.stroke_);

  if (!this.checkDrawingNeeded())
    return this;

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.path_.zIndex(/** @type {number} */ (this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.path_.parent(/** @type {acgraph.vector.ILayer} */ (this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  return this;
};


/**
 * Axis ticks drawer for top orientation.
 * @param {number} x .
 * @param {number} y .
 * @param {number} x1 .
 * @param {number} y1 .
 */
anychart.elements.RadialTicks.prototype.drawTick = function(x, y, x1, y1) {
  this.path_.moveTo(x, y);
  this.path_.lineTo(x1, y1);
};


/**
 * Ticks serialization.
 * @return {Object} Serialized axis data.
 */
anychart.elements.RadialTicks.prototype.serialize = function() {
  var data = {};
  data['length'] = this.length();
  data['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke} */(this.stroke()));

  return data;
};


/** @inheritDoc */
anychart.elements.RadialTicks.prototype.deserialize = function(value) {
  this.suspendSignalsDispatching();

  this.length(value['length']);
  this.stroke(value['stroke']);

  this.resumeSignalsDispatching(true);

  return this;
};


//exports
anychart.elements.RadialTicks.prototype['length'] = anychart.elements.RadialTicks.prototype.length;
anychart.elements.RadialTicks.prototype['stroke'] = anychart.elements.RadialTicks.prototype.stroke;