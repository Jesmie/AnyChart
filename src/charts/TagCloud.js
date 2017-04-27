//region --- Requiring and Providing
goog.provide('anychart.charts.TagCloud');
goog.require('anychart.core.SeparateChart');
//endregion



/**
 * TagCloud chart class.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Resource Chart data.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_settings If CSV string is passed, you
 * can pass CSV parser settings here as a hash map.
 * @constructor
 * @extends {anychart.core.SeparateChart}
 * @implements {anychart.core.utils.IInteractiveSeries}
 */
anychart.charts.TagCloud = function(opt_data, opt_settings) {
  anychart.charts.TagCloud.base(this, 'constructor');

  this.data(opt_data || null, opt_settings);
};
goog.inherits(anychart.charts.TagCloud, anychart.core.SeparateChart);


//region --- Chart Infrastructure Overrides
//------------------------------------------------------------------------------
//
//  Chart Infrastructure Overrides
//
//------------------------------------------------------------------------------
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.charts.TagCloud.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Chart.prototype.SUPPORTED_CONSISTENCY_STATES;


/** @inheritDoc */
anychart.charts.TagCloud.prototype.getType = function() {
  return anychart.enums.ChartTypes.TAG_CLOUD;
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.getAllSeries = function() {
  return [];
};


//endregion
//region --- Private properties
//------------------------------------------------------------------------------
//
//  Private properties
//
//------------------------------------------------------------------------------
/**
 * Raw data holder.
 * @type {?(anychart.data.View|anychart.data.Set|Array|string)}
 * @private
 */
anychart.charts.TagCloud.prototype.rawData_;


/**
 * View to dispose on next data set, if any.
 * @type {goog.Disposable}
 * @private
 */
anychart.charts.TagCloud.prototype.parentViewToDispose_;


/**
 * Chart data.
 * @type {!anychart.data.View}
 * @private
 */
anychart.charts.TagCloud.prototype.data_;


//endregion
//region --- Public methods
//------------------------------------------------------------------------------
//
//  Public methods
//
//------------------------------------------------------------------------------
/**
 * Getter/setter for chart data.
 * @param {?(anychart.data.View|anychart.data.Set|Array|anychart.data.DataSettings|string)=} opt_value Value to set.
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_settings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(!anychart.charts.TagCloud|!anychart.data.View)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.charts.TagCloud.prototype.data = function(opt_value, opt_settings) {
  if (goog.isDef(opt_value)) {
    if (this.rawData_ !== opt_value) {
      this.rawData_ = opt_value;
      goog.dispose(this.parentViewToDispose_); // disposing a view created by the series if any;
      if (opt_value instanceof anychart.data.View)
        this.data_ = this.parentViewToDispose_ = opt_value.derive(); // deriving a view to avoid interference with other view users
      else if (opt_value instanceof anychart.data.Set)
        this.data_ = this.parentViewToDispose_ = opt_value.mapAs();
      else {
        this.data_ = (this.parentViewToDispose_ = new anychart.data.Set(
            (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_settings)).mapAs();
      }
      this.data_.listenSignals(this.dataInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.RESOURCE_DATA, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.data_;
};


//endregion
//region --- Utils



//endregion
//region --- Calculate
/**
 * Calculating.
 */
anychart.charts.TagCloud.prototype.calculate = function() {
  // while (++i < n) {
  //   var d = data[i];
  //   d.x = (size[0] * (random() + .5)) >> 1;
  //   d.y = (size[1] * (random() + .5)) >> 1;
  //   cloudSprite(contextAndRatio, d, data, i);
  //   if (d.hasText && place(board, d, bounds)) {
  //     tags.push(d);
  //     event.call("word", cloud, d);
  //     if (bounds) cloudBounds(bounds, d);
  //     else bounds = [{
  //       x: d.x + d.x0,
  //       y: d.y + d.y0
  //     }, {
  //       x: d.x + d.x1,
  //       y: d.y + d.y1
  //     }];
  //     // Temporary hack
  //     d.x -= size[0] >> 1;
  //     d.y -= size[1] >> 1;
  //   }
  // }
};


//endregion
//region --- Drawing
/**
 * Drawing.
 */
anychart.charts.TagCloud.prototype.draw = function() {
  this.calculate();


};


//endregion
//region --- Setup and Dispose
/** @inheritDoc */
anychart.charts.TagCloud.prototype.setupByJSON = function(config) {
  anychart.charts.TagCloud.base(this, 'setupByJSON', config);
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.serialize = function() {
  var json = anychart.charts.TagCloud.base(this, 'serialize');
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.disposeInternal = function() {
  anychart.charts.TagCloud.base(this, 'disposeInternal');
};


//endregion
//region --- Exports

//exports
//endregion
