goog.provide('anychart.core.series.HeatMap');
goog.require('acgraph');
goog.require('anychart.color');
goog.require('anychart.core.drawers.HeatMap');
goog.require('anychart.core.series.Cartesian');
goog.require('anychart.core.settings');
goog.require('anychart.enums');
goog.require('anychart.format.Context');
goog.require('anychart.math.Rect');
goog.require('anychart.utils');



/**
 * Base class for all heat map series.<br/>
 * @param {!anychart.core.IChart} chart
 * @param {!anychart.core.IPlot} plot
 * @param {string} type
 * @param {anychart.core.series.TypeConfig} config
 * @param {boolean} sortedMode
 * @constructor
 * @extends {anychart.core.series.Cartesian}
 */
anychart.core.series.HeatMap = function(chart, plot, type, config, sortedMode) {
  anychart.core.series.HeatMap.base(this, 'constructor', chart, plot, type, config, sortedMode);

  this.labels().adjustFontSizeMode('same');
  this.labels().setParentEventTarget(this);

  /**
   * Stroke resolver.
   * @type {function(anychart.core.series.Base, number, boolean=, boolean=):acgraph.vector.Stroke}
   * @private
   */
  this.strokeResolver_ = /** @type {function(anychart.core.series.Base, number, boolean=, boolean=):acgraph.vector.Stroke} */(
      anychart.core.series.Base.getColorResolver(
      ['stroke', 'hoverStroke', 'selectStroke'], anychart.enums.ColorType.STROKE));
};
goog.inherits(anychart.core.series.HeatMap, anychart.core.series.Cartesian);


/**
 * Properties that should be defined in series.Base prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.series.HeatMap.PROPERTY_DESCRIPTORS = (function() {
  var map = {};
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'stroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.SERIES_POINTS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.NEED_UPDATE_LEGEND,
      anychart.core.series.Capabilities.ANY);
  return map;
})();
// populating series base prototype with properties
anychart.core.settings.populate(anychart.core.series.HeatMap, anychart.core.series.HeatMap.PROPERTY_DESCRIPTORS);


/** @inheritDoc */
anychart.core.series.HeatMap.prototype.labels = function(opt_value) {
  var res = (/** @type {anychart.charts.HeatMap} */(this.chart)).labels(opt_value);
  return goog.isDef(opt_value) ? this : /** @type {!anychart.core.ui.LabelsFactory} */(res);
};


/** @inheritDoc */
anychart.core.series.HeatMap.prototype.hoverLabels = function(opt_value) {
  var res = (/** @type {anychart.charts.HeatMap} */(this.chart)).hoverLabels(opt_value);
  return goog.isDef(opt_value) ? this : /** @type {!anychart.core.ui.LabelsFactory} */(res);
};


/** @inheritDoc */
anychart.core.series.HeatMap.prototype.selectLabels = function(opt_value) {
  var res = (/** @type {anychart.charts.HeatMap} */(this.chart)).selectLabels(opt_value);
  return goog.isDef(opt_value) ? this : /** @type {!anychart.core.ui.LabelsFactory} */(res);
};


/** @inheritDoc */
anychart.core.series.HeatMap.prototype.tooltip = function(opt_value) {
  var res = (/** @type {anychart.charts.HeatMap} */(this.chart)).tooltip(opt_value);
  return goog.isDef(opt_value) ? this : /** @type {!anychart.core.ui.Tooltip} */(res);
};


/**
 * @param {anychart.data.IRowInfo} point
 * @param {anychart.PointState} pointState
 * @param {string} prefix
 * @param {number} minFontSize
 * @return {number}
 * @private
 */
anychart.core.series.HeatMap.prototype.calcMinFontSize_ = function(point, pointState, prefix, minFontSize) {
  var label = this.drawFactoryElement(
      [this.labels, this.hoverLabels, this.selectLabels],
      [this.getChart().labels, this.getChart().hoverLabels, this.getChart().selectLabels],
      ['label', 'hoverLabel', 'selectLabel'],
      this.planHasPointLabels(),
      true,
      null,
      point,
      pointState,
      false);

  if (label) {
    var mergedSettings = label.getMergedSettings();
    var needAdjust = (mergedSettings['adjustByHeight'] || mergedSettings['adjustByHeight']);
    if (needAdjust) {
      var x = /** @type {number} */(point.meta(prefix + 'X'));
      var y = /** @type {number} */(point.meta(prefix + 'Y'));
      var width = /** @type {number} */(point.meta(prefix + 'Width'));
      var height = /** @type {number} */(point.meta(prefix + 'Height'));
      var cellBounds = anychart.math.rect(x, y, width, height);
      var padding = mergedSettings['padding'];
      width = cellBounds.width - padding.getOption('left') - padding.getOption('right');
      height = cellBounds.height - padding.getOption('top') - padding.getOption('bottom');
      var fontSize = label.calculateFontSize(
          width,
          height,
          mergedSettings['minFontSize'],
          mergedSettings['maxFontSize'],
          mergedSettings['adjustByWidth'],
          mergedSettings['adjustByHeight']);

      if (isNaN(minFontSize)) {
        minFontSize = fontSize;
      } else if (fontSize < minFontSize) {
        minFontSize = fontSize;
      }
    }
  }
  return minFontSize;
};


/** @inheritDoc */
anychart.core.series.HeatMap.prototype.additionalLabelsInitialize = function() {
  var labels = /** @type {anychart.core.ui.LabelsFactory} */(this.labels());
  var hoverLabels = /** @type {anychart.core.ui.LabelsFactory} */(this.hoverLabels());
  var selectLabels = /** @type {anychart.core.ui.LabelsFactory} */(this.selectLabels());

  var labelsEnabled = /** @type {boolean} */(labels.enabled());
  var hoverLabelsEnabled = labelsEnabled || /** @type {boolean} */(hoverLabels.enabled());
  var selectLabelsEnabled = labelsEnabled || /** @type {boolean} */(selectLabels.enabled());

  var normalAdjust = labels.adjustEnabled();
  var hoverAdjust = (normalAdjust || hoverLabels.adjustEnabled()) && hoverLabelsEnabled;
  var selectAdjust = (normalAdjust || selectLabels.adjustEnabled()) && selectLabelsEnabled;
  normalAdjust = labelsEnabled && normalAdjust;

  var minFontSize, hoverMinFontSize, selectMinFontSize;
  minFontSize = hoverMinFontSize = selectMinFontSize = NaN;

  if (normalAdjust || hoverAdjust || selectAdjust) {
    var iterator = this.getIterator();
    iterator.reset();
    while (iterator.advance()) {
      if (!iterator.meta('missing')) {
        if (normalAdjust) {
          minFontSize = this.calcMinFontSize_(iterator, anychart.PointState.NORMAL, 'normal', minFontSize);
        }
        if (hoverAdjust) {
          hoverMinFontSize = this.calcMinFontSize_(iterator, anychart.PointState.HOVER, 'hover', hoverMinFontSize);
        }
        if (selectAdjust) {
          selectMinFontSize = this.calcMinFontSize_(iterator, anychart.PointState.SELECT, 'select', selectMinFontSize);
        }
      }
    }
  }
  if (normalAdjust) {
    labels.setAdjustFontSize(minFontSize);
  } else {
    labels.setAdjustFontSize(null);
  }

  if (hoverAdjust) {
    hoverLabels.setAdjustFontSize(hoverMinFontSize);
  } else {
    hoverLabels.setAdjustFontSize(null);
  }

  if (selectAdjust) {
    selectLabels.setAdjustFontSize(selectMinFontSize);
  } else {
    selectLabels.setAdjustFontSize(null);
  }
};


/**
 * Prepares outliers part of point meta.
 * @param {anychart.data.IRowInfo} rowInfo
 * @param {Array.<string>} yNames
 * @param {Array.<string|number>} yColumns
 * @param {number} pointMissing
 * @param {number} xRatio
 * @return {number} - pointMissing updated value.
 * @protected
 */
anychart.core.series.HeatMap.prototype.makeHeatMapMeta = function(rowInfo, yNames, yColumns, pointMissing, xRatio) {
  // we assume here, that isPointVisible injected 'left', 'right', 'top' and 'bottom' meta already
  var left = /** @type {number} */(rowInfo.meta('left'));
  var right = /** @type {number} */(rowInfo.meta('right'));
  var top = /** @type {number} */(rowInfo.meta('top'));
  var bottom = /** @type {number} */(rowInfo.meta('bottom'));

  var stroke = this.strokeResolver_(this, anychart.PointState.NORMAL);
  var hoverStroke = this.strokeResolver_(this, anychart.PointState.HOVER);
  var selectStroke = this.strokeResolver_(this, anychart.PointState.SELECT);
  var strokeThicknessHalf = acgraph.vector.getThickness(stroke) / 2;
  var hoverStrokeThicknessHalf = acgraph.vector.getThickness(hoverStroke) / 2;
  var selectStrokeThicknessHalf = acgraph.vector.getThickness(selectStroke) / 2;

  var width = right - left;
  var height = bottom - top;

  rowInfo.meta('normalX', left + strokeThicknessHalf);
  rowInfo.meta('normalY', top + strokeThicknessHalf);
  rowInfo.meta('normalWidth', width - strokeThicknessHalf - strokeThicknessHalf);
  rowInfo.meta('normalHeight', height - strokeThicknessHalf - strokeThicknessHalf);

  rowInfo.meta('hoverX', left + hoverStrokeThicknessHalf);
  rowInfo.meta('hoverY', top + hoverStrokeThicknessHalf);
  rowInfo.meta('hoverWidth', width - hoverStrokeThicknessHalf - hoverStrokeThicknessHalf);
  rowInfo.meta('hoverHeight', height - hoverStrokeThicknessHalf - hoverStrokeThicknessHalf);

  rowInfo.meta('selectX', left + selectStrokeThicknessHalf);
  rowInfo.meta('selectY', top + selectStrokeThicknessHalf);
  rowInfo.meta('selectWidth', width - selectStrokeThicknessHalf - selectStrokeThicknessHalf);
  rowInfo.meta('selectHeight', height - selectStrokeThicknessHalf - selectStrokeThicknessHalf);

  return pointMissing;
};


/** @inheritDoc */
anychart.core.series.HeatMap.prototype.isPointVisible = function(point) {
  var xScale = this.getXScale();
  var yScale = /** @type {anychart.scales.Base} */(this.yScale());
  var x = point.get('x');
  var y = point.get('y');

  var leftRatio = xScale.transform(x, 0);
  var rightRatio = xScale.transform(x, 1);
  var topRatio = yScale.transform(y, 0);
  var bottomRatio = yScale.transform(y, 1);

  if (leftRatio < 0 && rightRatio < 0 ||
      topRatio < 0 && bottomRatio < 0 ||
      leftRatio > 1 && rightRatio > 1 ||
      topRatio > 1 && bottomRatio > 1)
    return false;

  var l = Math.round(this.applyRatioToBounds(leftRatio, true));
  var t = Math.round(this.applyRatioToBounds(topRatio, false));
  var r = Math.round(this.applyRatioToBounds(rightRatio, true));
  var b = Math.round(this.applyRatioToBounds(bottomRatio, false));
  var vPadding = this.verticalGridThickness / 2;
  var hPadding = this.horizontalGridThickness / 2;

  var left = Math.min(l, r);
  var right = Math.max(l, r);
  var top = Math.min(t, b);
  var bottom = Math.max(t, b);

  // that's how grids.Linear aligns its lines
  left += Math.ceil(vPadding);
  top += Math.floor(hPadding);
  right -= (rightRatio == 1) ? Math.ceil(vPadding) : Math.floor(vPadding);
  bottom -= (bottomRatio == 1) ? Math.floor(hPadding) : Math.ceil(hPadding);

  point.meta('left', left);
  point.meta('top', top);
  point.meta('right', right);
  point.meta('bottom', bottom);
  point.meta('x', xScale.transform(x, 0.5));
  return true;
};


/** @inheritDoc */
anychart.core.series.HeatMap.prototype.prepareMetaMakers = function(yNames, yColumns) {
  this.metaMakers.length = 0;
  this.metaMakers.push(this.makeHeatMapMeta);
  var iterator = this.getIterator();
  iterator.reset();
  while (iterator.advance()) {
    this.makePointMeta(iterator, yNames, yColumns);
  }
  this.metaMakers.length = 0;
};


/** @inheritDoc */
anychart.core.series.HeatMap.prototype.createPositionProviderByGeometry = function(anchor) {
  var iterator = this.getIterator();
  var left = /** @type {number} */(iterator.meta('left'));
  var top = /** @type {number} */(iterator.meta('top'));
  var right = /** @type {number} */(iterator.meta('right'));
  var bottom = /** @type {number} */(iterator.meta('bottom'));
  var bounds = new anychart.math.Rect(left, top, right - left, bottom - top);
  return anychart.utils.getCoordinateByAnchor(bounds, /** @type {anychart.enums.Anchor} */(anchor));
};


/** @inheritDoc */
anychart.core.series.HeatMap.prototype.drawLabel = function(point, pointState, pointStateChanged) {
  var displayMode = (/** @type {anychart.charts.HeatMap} */(this.chart)).labelsDisplayMode();
  var label = this.drawFactoryElement(
      [this.labels, this.hoverLabels, this.selectLabels],
      null,
      ['label', 'hoverLabel', 'selectLabel'],
      this.planHasPointLabels(),
      true,
      null,
      point,
      pointState,
      false);
  if (label) {
    var prefix;
    if (pointState == anychart.PointState.NORMAL) {
      prefix = 'normal';
    } else if (pointState == anychart.PointState.HOVER) {
      prefix = 'hover';
    } else {
      prefix = 'select';
    }
    var x = /** @type {number} */(point.meta(prefix + 'X'));
    var y = /** @type {number} */(point.meta(prefix + 'Y'));
    var width = /** @type {number} */(point.meta(prefix + 'Width'));
    var height = /** @type {number} */(point.meta(prefix + 'Height'));
    var cellBounds = anychart.math.rect(x, y, width, height);

    if (displayMode == anychart.enums.LabelsDisplayMode.DROP) {
      var mergedSettings = label.getMergedSettings();
      mergedSettings['width'] = null;
      mergedSettings['height'] = null;
      if (mergedSettings['adjustByWidth'] || mergedSettings['adjustByHeight'])
        mergedSettings['fontSize'] = label.parentLabelsFactory().autoSettings['fontSize'];

      var bounds = this.labels().measure(label.formatProvider(), label.positionProvider(), mergedSettings);
      if (cellBounds.left > bounds.left ||
          cellBounds.getRight() < bounds.getRight() ||
          cellBounds.top > bounds.top ||
          cellBounds.getBottom() < bounds.getBottom()) {
        this.labels().clear(label.getIndex());
        label = null;
      }
    }
    if (label) {
      label['clip'](cellBounds);
      label['width'](cellBounds.width);
      label['height'](cellBounds.height);
      if (pointStateChanged)
        label.draw();
    }
  }
  point.meta('label', label);
};


/** @inheritDoc */
anychart.core.series.HeatMap.prototype.setupLabelDrawingPlan = function(label, chartNormalFactory, seriesNormalFactory, chartStateFactory, seriesStateFactory, pointOverride, statePointOverride) {
  label.state('pointState', goog.isObject(statePointOverride) ? statePointOverride : null, 0);
  label.state('seriesState', seriesStateFactory, 1);
  // label.state('chartState', chartStateFactory);
  label.state('pointNormal', goog.isObject(pointOverride) ? pointOverride : null, 2);
  label.state('seriesNormal', seriesNormalFactory, 3);
  // label.state('chartNormal', chartNormalFactory);
  label.state('autoOverride', label.ownSettings, 4);
  label.state('autoFont', seriesStateFactory ? seriesStateFactory.autoSettings : seriesNormalFactory.autoSettings, 5);
  label.state('seriesStateTheme', seriesStateFactory ? seriesStateFactory.themeSettings : null, 6);
  // label.state('chartStateTheme', chartStateFactory ? chartStateFactory.themeSettings : null);
  label.state('auto', label.autoSettings, 7);
  label.state('seriesNormalTheme', seriesNormalFactory.themeSettings, 8);
  // label.state('chartNormalTheme', chartNormalFactory ? chartNormalFactory.themeSettings : null);
};


/**
 * Calculates grid padding for heat map cells.
 */
anychart.core.series.HeatMap.prototype.prepareAdditional = function() {
  var res = (/** @type {anychart.charts.HeatMap} */(this.getChart())).calculateGridsThickness();
  this.verticalGridThickness = res.vertical;
  this.horizontalGridThickness = res.horizontal;
  anychart.core.series.HeatMap.base(this, 'prepareAdditional');
};


/**
 * Apply axes lines space.
 * @param {number} value Value.
 * @return {number} .
 * @protected
 */
anychart.core.series.HeatMap.prototype.applyAxesLinesSpace = function(value) {
  var bounds = this.pixelBoundsCache;
  var max = bounds.getBottom() - this.axesLinesSpace()['bottom']();
  var min = bounds.getTop() + this.axesLinesSpace()['top']();

  return goog.math.clamp(value, min, max);
};


/** @inheritDoc */
anychart.core.series.HeatMap.prototype.updateContext = function(provider, opt_rowInfo) {
  var rowInfo = opt_rowInfo || this.getIterator();

  var values = {
    'chart': {value: this.getChart(), type: anychart.enums.TokenType.UNKNOWN},
    'series': {value: this, type: anychart.enums.TokenType.UNKNOWN},
    'scale': {value: this.xScale(), type: anychart.enums.TokenType.UNKNOWN},
    'index': {value: rowInfo.getIndex(), type: anychart.enums.TokenType.NUMBER},
    'x': {value: rowInfo.get('x'), type: anychart.enums.TokenType.STRING},
    'y': {value: rowInfo.get('y'), type: anychart.enums.TokenType.NUMBER},
    'heat': {value: rowInfo.get('heat'), type: anychart.enums.TokenType.NUMBER},
    'seriesName': {value: this.name(), type: anychart.enums.TokenType.STRING}
  };

  var colorScale = this.getChart().colorScale();
  if (colorScale) {
    var value = rowInfo.get('heat');

    if (colorScale instanceof anychart.scales.OrdinalColor) {
      var range = colorScale.getRangeByValue(/** @type {number} */(value));
      if (range) {
        var colorRange = {
          'color': range.color,
          'end': range.end,
          'name': range.name,
          'start': range.start,
          'index': range.sourceIndex
        };
        values['colorRange'] = {value: colorRange, type: anychart.enums.TokenType.UNKNOWN};
      }
      values['color'] = {value: colorScale.valueToColor(/** @type {number} */(value)), type: anychart.enums.TokenType.UNKNOWN};
    }
  }

  var tokenAliases = {};
  tokenAliases[anychart.enums.StringToken.X_VALUE] = 'x';

  provider
      .dataSource(rowInfo)
      .statisticsSources([this, this.getChart()])
      .tokenAliases(tokenAliases);

  return /** @type {anychart.format.Context} */ (provider.propagate(values));
};


/** @inheritDoc */
anychart.core.series.HeatMap.prototype.getColorResolutionContext = function(opt_baseColor, opt_ignorePointSettings, opt_ignoreColorScale) {
  var result = anychart.core.series.HeatMap.base(this, 'getColorResolutionContext', opt_baseColor, opt_ignorePointSettings, opt_ignoreColorScale);
  result['colorScale'] = (/** @type {anychart.charts.HeatMap} */(this.getChart())).colorScale();
  return result;
};


/** @inheritDoc */
anychart.core.series.HeatMap.prototype.serialize = function() {
  var json = anychart.core.series.HeatMap.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.core.series.HeatMap.PROPERTY_DESCRIPTORS, json);
  return json;
};


/** @inheritDoc */
anychart.core.series.HeatMap.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.settings.deserialize(this, anychart.core.series.HeatMap.PROPERTY_DESCRIPTORS, config);
  anychart.core.series.HeatMap.base(this, 'setupByJSON', config, opt_default);
};


//exports
(function() {
  var proto = anychart.core.series.HeatMap.prototype;
  proto['tooltip'] = proto.tooltip;
  proto['labels'] = proto.labels;
  proto['hoverLabels'] = proto.hoverLabels;
  proto['selectLabels'] = proto.selectLabels;
})();
