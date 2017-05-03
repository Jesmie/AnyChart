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

  this.cloudRadians = Math.PI / 180;
  this.cw = 1 << 11 >> 5;
  this.ch = 1 << 11;

  /**
   * Minimum font size.
   * @type {Number}
   */
  this.minFontSize = NaN;

  /**
   * Maximum font size.
   * @type {Number}
   */
  this.maxFontSize = NaN;

  /**
   * Theme settings.
   * @type {Object}
   */
  this.themeSettings = {};

  /**
   * Own settings (Settings set by user with API).
   * @type {Object}
   */
  this.ownSettings = {};

  this.colorScale = anychart.scales.linearColor(anychart.color.singleHueProgression('#3b5998'));
  this.scale_ = anychart.scales.linear();

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
    anychart.core.SeparateChart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.TAG_CLOUD_DATA |
    anychart.ConsistencyState.TAG_CLOUD_ANGLES |
    anychart.ConsistencyState.APPEARANCE;


/** @inheritDoc */
anychart.charts.TagCloud.prototype.getType = function() {
  return anychart.enums.ChartTypes.TAG_CLOUD;
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.getAllSeries = function() {
  return [];
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.getPoint = function() {
  return null;
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.getSeriesStatus = function() {
  return null;
};


//endregion
//region --- Descriptors
/**
 * Simple properties descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.charts.TagCloud.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  map['mode'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'mode',
      anychart.enums.normalizeTagCloudMode,
      anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW);

  map['fromAngle'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'fromAngle',
      anychart.core.settings.numberNormalizer,
      anychart.ConsistencyState.TAG_CLOUD_ANGLES,
      anychart.Signal.NEEDS_REDRAW);

  map['toAngle'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'toAngle',
      anychart.enums.numberNormalizer,
      anychart.ConsistencyState.TAG_CLOUD_ANGLES,
      anychart.Signal.NEEDS_REDRAW);

  map['anglesCount'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'anglesCount',
      anychart.core.settings.numberNormalizer,
      anychart.ConsistencyState.TAG_CLOUD_ANGLES,
      anychart.Signal.NEEDS_REDRAW);

  return map;
})();
anychart.core.settings.populate(anychart.charts.TagCloud, anychart.charts.TagCloud.prototype.SIMPLE_PROPS_DESCRIPTORS);


//endregion
//region --- IResolvable implementation
/** @inheritDoc */
anychart.charts.TagCloud.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/**
 * Resolution chain getter.
 * @return {Array.<Object|null|undefined>} - Chain of settings.
 */
anychart.charts.TagCloud.prototype.getResolutionChain = function() {
  var chain = this.resolutionChainCache();
  if (!chain) {
    chain = goog.array.concat(this.getHighPriorityResolutionChain(), this.getMidPriorityResolutionChain(), this.getLowPriorityResolutionChain());
    this.resolutionChainCache(chain);
  }
  return chain;
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.autoSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/**
 * Gets chain of middle priority settings.
 * @return {Array.<Object|null|undefined>} - Chain of settings.
 */
anychart.charts.TagCloud.prototype.getMidPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getMidPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.ownSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};


//endregion
//region --- IObjectWithSettings implementation
/** @inheritDoc */
anychart.charts.TagCloud.prototype.getOwnOption = function(name) {
  return this.ownSettings[name];
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.hasOwnOption = function(name) {
  return goog.isDefAndNotNull(this.ownSettings[name]);
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.getThemeOption = function(name) {
  return this.themeSettings[name];
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.getOption = anychart.core.settings.getOption;


/** @inheritDoc */
anychart.charts.TagCloud.prototype.setOption = function(name, value) {
  this.ownSettings[name] = value;
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.check = function(flags) {
  return true;
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
      this.invalidate(anychart.ConsistencyState.TAG_CLOUD_DATA, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.data_;
};


/**
 * Tags rotation angles.
 * @param {Array.<number>=} opt_value .
 * @return {Array.<number>|anychart.charts.TagCloud}
 */
anychart.charts.TagCloud.prototype.angles = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isArray(opt_value) ? opt_value : null;
    if (this.angles_ != opt_value) {
      this.angles_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.angles_;
};


/**
 * Tags rotation angles.
 * @param {anychart.scales.Linear=} opt_value .
 * @return {anychart.scales.Linear|anychart.charts.TagCloud}
 */
anychart.charts.TagCloud.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.scale_ != opt_value) {
      this.scale_ = opt_value;
      // this.invalidate();
    }
    return this;
  }
  return this.scale_;
};


//endregion
//region --- Utils
/**
 * Calculating font size.
 * @param {Object} d Tag object.
 */
anychart.charts.TagCloud.prototype.calculateMaxFontSize = function(d) {
  var w = this.w / 3;
  var h = this.h / 3;

  var minFontSize = this.h / 50;
  var maxFontSize = ~~h;

  var evaluator = function(fontSize) {
    ///
    var bounds = acgraph.getRenderer().measure(d.text, {
      'fontStyle': d.style,
      'fontFamily': d.font,
      'fontSize': fontSize,
      'fontWeight': d.weight
    });

    var point = anychart.utils.getCoordinateByAnchor(bounds, /** @type {anychart.enums.Anchor} */('center'));
    var tx = goog.math.AffineTransform.getRotateInstance(goog.math.toRadians(d.rotate), point.x, point.y);

    var arr = bounds.toCoordinateBox() || [];
    tx.transform(arr, 0, arr, 0, 4);

    bounds = anychart.math.Rect.fromCoordinateBox(arr);
    ///

    var width = bounds.width;
    var height = bounds.height;
    var res;
    if (width > w || height > h) {
      res = -1;
    } else if (width == w || height == h) {
      res = 0;
    } else {
      res = 1;
    }
    return res;
  };

  var fonts = goog.array.range(minFontSize, maxFontSize + 1);
  var res = goog.array.binarySelect(fonts, evaluator);
  if (res < 0) {
    res = ~res - 1;
  }

  this.minFontSize = minFontSize;
  this.maxFontSize = fonts[goog.math.clamp(res, 0, fonts.length)];
};


/**
 * Creates cloud sprites.
 * @param {{context: CanvasRenderingContext2D, ratio: number}} contextAndRatio
 * @param {Object} d .
 * @param {Array.<Object>} data .
 * @param {number} di .
 */
anychart.charts.TagCloud.prototype.cloudSprite = function(contextAndRatio, d, data, di) {
  if (d.sprite) return;
  var c = contextAndRatio.context,
      ratio = contextAndRatio.ratio;

  c.clearRect(0, 0, (this.cw << 5) / ratio, this.ch / ratio);
  var x = 0,
      y = 0,
      maxh = 0,
      n = data.length;
  --di;
  while (++di < n) {
    d = data[di];
    c.save();
    c.font = d.style + ' ' + d.weight + ' ' + ~~ ((d.size + 1) / ratio) + 'px ' + d.font;
    var w = c.measureText(d.text).width * ratio,
        h = d.size << 1;
    if (d.rotate) {
      var sr = Math.sin(d.rotate * this.cloudRadians),
          cr = Math.cos(d.rotate * this.cloudRadians),
          wcr = w * cr,
          wsr = w * sr,
          hcr = h * cr,
          hsr = h * sr;
      w = (Math.max(Math.abs(wcr + hsr), Math.abs(wcr - hsr)) + 0x1f) >> 5 << 5;
      h = ~~Math.max(Math.abs(wsr + hcr), Math.abs(wsr - hcr));
    } else {
      w = (w + 0x1f) >> 5 << 5;
    }
    if (h > maxh) maxh = h;
    if (x + w >= (this.cw << 5)) {
      x = 0;
      y += maxh;
      maxh = 0;
    }
    if (y + h >= this.ch) break;
    c.translate((x + (w >> 1)) / ratio, (y + (h >> 1)) / ratio);
    if (d.rotate) c.rotate(d.rotate * this.cloudRadians);
    c.fillText(d.text, 0, 0);
    if (d.padding) c.lineWidth = 2 * d.padding, c.strokeText(d.text, 0, 0);
    c.restore();
    d.width = w;
    d.height = h;
    d.xoff = x;
    d.yoff = y;
    d.x1 = w >> 1;
    d.y1 = h >> 1;
    d.x0 = -d.x1;
    d.y0 = -d.y1;
    d.hasText = true;
    x += w;
  }
  var pixels = c.getImageData(0, 0, (this.cw << 5) / ratio, this.ch / ratio).data,
      sprite = [];
  while (--di >= 0) {
    d = data[di];
    if (!d.hasText) continue;
    var w = d.width,
        w32 = w >> 5,
        h = d.y1 - d.y0;
    // Zero the buffer
    for (var i = 0; i < h * w32; i++) sprite[i] = 0;
    x = d.xoff;
    if (x == null) return;
    y = d.yoff;
    var seen = 0,
        seenRow = -1;
    for (var j = 0; j < h; j++) {
      for (var i = 0; i < w; i++) {
        var k = w32 * j + (i >> 5),
            m = pixels[((y + j) * (this.cw << 5) + (x + i)) << 2] ? 1 << (31 - (i % 32)) : 0;
        sprite[k] |= m;
        seen |= m;
      }
      if (seen) seenRow = j;
      else {
        d.y0++;
        h--;
        j--;
        y++;
      }
    }
    d.y1 = d.y0 + seenRow;
    d.sprite = sprite.slice(0, (d.y1 - d.y0) * w32);
  }
};


/**
 * @param {Object} tag .
 * @param {Array.<number>} board .
 * @param {number} sw .
 * @return {boolean}
 */
anychart.charts.TagCloud.prototype.cloudCollide = function(tag, board, sw) {
  sw >>= 5;
  var sprite = tag.sprite,
      w = tag.width >> 5,
      lx = tag.x - (w << 4),
      sx = lx & 0x7f,
      msx = 32 - sx,
      h = tag.y1 - tag.y0,
      x = (tag.y + tag.y0) * sw + (lx >> 5),
      last;
  for (var j = 0; j < h; j++) {
    last = 0;
    for (var i = 0; i <= w; i++) {
      if (((last << msx) | (i < w ? (last = sprite[j * w + i]) >>> sx : 0)) & board[x + i]) return true;
    }
    x += sw;
  }
  return false;
};


/**
 * Cloud Bounds.
 * @param {Array.<Object>} bounds .
 * @param {Object} d .
 */
anychart.charts.TagCloud.prototype.cloudBounds = function(bounds, d) {
  var b0 = bounds[0],
      b1 = bounds[1];
  if (d.x + d.x0 < b0.x) b0.x = d.x + d.x0;
  if (d.y + d.y0 < b0.y) b0.y = d.y + d.y0;
  if (d.x + d.x1 > b1.x) b1.x = d.x + d.x1;
  if (d.y + d.y1 > b1.y) b1.y = d.y + d.y1;
};


/**
 * Returns whether rects intersect.
 * @param {Object} a .
 * @param {Array.<Object>} b .
 * @return {boolean}
 */
anychart.charts.TagCloud.prototype.collideRects = function(a, b) {
  return a.x + a.x1 > b[0].x && a.x + a.x0 < b[1].x && a.y + a.y1 > b[0].y && a.y + a.y0 < b[1].y;
};


/**
 * Returns function of archimedean spiral distribution.
 * @return {Function}
 */
anychart.charts.TagCloud.prototype.archimedeanSpiral = function() {
  var e = this.w / this.h;
  return function(t) {
    return [e * (t *= .1) * Math.cos(t), t * Math.sin(t)];
  };
};


/**
 * Returns function of rectangular spiral distribution.
 * @return {Function}
 */
anychart.charts.TagCloud.prototype.rectangularSpiral = function() {
  var dy = 4,
      dx = dy * this.w / this.h,
      x = 0,
      y = 0;
  return function(t) {
    var sign = t < 0 ? -1 : 1;
    // See triangular numbers: T_n = n * (n + 1) / 2.
    switch ((Math.sqrt(1 + 4 * sign * t) - sign) & 3) {
      case 0:
        x += dx;
        break;
      case 1:
        y += dy;
        break;
      case 2:
        x -= dx;
        break;
      default:
        y -= dy;
        break;
    }
    return [x, y];
  };
};


/**
 * Returns array of zero .
 * @param {number} n .
 * @return {Array.<number>}
 */
anychart.charts.TagCloud.prototype.zeroArray = function(n) {
  var a = [],
      i = -1;
  while (++i < n) a[i] = 0;
  return a;
};


/**
 * Returns canvas dom element.
 * @return {Element}
 */
anychart.charts.TagCloud.prototype.cloudCanvas = function() {
  return this.canvas ? this.canvas : (this.canvas = document.createElement('canvas'));
};


/**
 * Returns canvas context and ratio.
 * @param {Element} canvas
 * @return {{context: CanvasRenderingContext2D, ratio: number}}
 */
anychart.charts.TagCloud.prototype.getContext = function(canvas) {
  canvas.width = canvas.height = 1;
  var ratio = Math.sqrt(canvas.getContext('2d').getImageData(0, 0, 1, 1).data.length >> 2);
  canvas.width = (this.cw << 5) / ratio;
  canvas.height = this.ch / ratio;

  var context = canvas.getContext('2d');
  context.fillStyle = context.strokeStyle = 'red';
  context.textAlign = 'center';

  return {
    context: context,
    ratio: ratio
  };
};


/**
 * Placing tag to cloud.
 * @param {Array.<number>} board .
 * @param {Object} tag .
 * @param {Array.<Object>} bounds ,
 * @return {boolean}
 */
anychart.charts.TagCloud.prototype.place = function(board, tag, bounds) {
  var startX = tag.x,
      startY = tag.y,
      maxDelta = Math.sqrt(this.w * this.w + this.h * this.h),

      s = (this.getOption('mode') == anychart.enums.TagCloudMode.SPIRAL ? this.archimedeanSpiral : this.rectangularSpiral)(),
      // s = this.rectangularSpiral([this.w, this.h]),

      // dt = Math.random() < .5 ? 1 : -1,
      dt = 1,
      t = -dt,
      dxdy,
      dx,
      dy;

  while (dxdy = s(t += dt)) {
    dx = ~~dxdy[0];
    dy = ~~dxdy[1];

    if (Math.min(Math.abs(dx), Math.abs(dy)) >= maxDelta) break;

    tag.x = startX + dx;
    tag.y = startY + dy;

    if (tag.x + tag.x0 < 0 || tag.y + tag.y0 < 0 || tag.x + tag.x1 > this.w || tag.y + tag.y1 > this.h) continue;
    if (!bounds || !this.cloudCollide(tag, board, this.w)) {
      if (!bounds || this.collideRects(tag, bounds)) {
        var sprite = tag.sprite,
            w = tag.width >> 5,
            sw = this.w >> 5,
            lx = tag.x - (w << 4),
            sx = lx & 0x7f,
            msx = 32 - sx,
            h = tag.y1 - tag.y0,
            x = (tag.y + tag.y0) * sw + (lx >> 5),
            last;
        for (var j = 0; j < h; j++) {
          last = 0;
          for (var i = 0; i <= w; i++) {
            board[x + i] |= (last << msx) | (i < w ? (last = sprite[j * w + i]) >>> sx : 0);
          }
          x += sw;
        }
        delete tag.sprite;
        return true;
      }
    }
  }
  return false;
};


//endregion
//region --- Calculate
/**
 * Calculating.
 */
anychart.charts.TagCloud.prototype.calculate = function() {
  var scale = this.scale_;
  var anglesCount, fromAngle, toAngle, range, i;
  if (this.hasInvalidationState(anychart.ConsistencyState.TAG_CLOUD_ANGLES)) {
    anglesCount = this.getOption('anglesCount');
    fromAngle = this.getOption('fromAngle');
    toAngle = this.getOption('toAngle');

    range = (toAngle - fromAngle);

    this.calculatedAngles_ = [];
    for (i = 0; i < anglesCount; i++) {
      this.calculatedAngles_.push(fromAngle + (range / (anglesCount == 1 ? anglesCount : anglesCount - 1) * i));
    }

    if (!this.angles_)
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS);

    this.markConsistent(anychart.ConsistencyState.TAG_CLOUD_ANGLES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.TAG_CLOUD_DATA)) {
    var iterator = this.data_.getIterator();

    this.tagsPool = [];
    if (this.normalizedData) {
      this.normalizedData.forEach(function(d, i) {
        goog.dom.removeNode(d.textEl);
        this.tagsPool[i] = d;
      }, this);
    }

    this.normalizedData = [];
    scale.startAutoCalc();
    while (iterator.advance()) {
      var key = iterator.get('tag'),
          value = iterator.get('value'),
          index = iterator.getIndex(),
          item = this.tagsPool[index] ? this.tagsPool[index] : {};

      item.rowIndex = index;
      item.text = key;
      item.value = value;
      item.drawed = false;

      this.normalizedData.push(item);

      scale.extendDataRange(value);
    }
    scale.finishAutoCalc();

    this.normalizedData.sort(function(a, b) {
      return b.value - a.value;
    });

    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS);
    this.markConsistent(anychart.ConsistencyState.TAG_CLOUD_DATA);
  }
};


//endregion
//region --- Drawing
/** @inheritDoc */
anychart.charts.TagCloud.prototype.drawContent = function(bounds) {
  var scale = this.scale_,
      arrAngles, anglesCount, maxValue;
  this.internalBounds_ = bounds;
  this.w = bounds.width;
  this.h = bounds.height;

  this.calculate();

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    arrAngles = this.angles_ ? this.angles_ : this.calculatedAngles_;
    anglesCount = arrAngles.length;
    maxValue = this.normalizedData[0].value;

    this.normalizedData.forEach(function(d, i) {
      d.font = 'Times new roman';
      d.style = 'normal';
      d.weight = 'normal';
      d.padding = 1;

      d.rotate = arrAngles[d.value % anglesCount];
      // d.rotate = (~~(Math.random() * 6) - 3) * 30;
      // d.rotate = 45;
      // d.size = ~~scale.inverseTransform(d.value / max);
      d.sizeRatio = d.value / maxValue;
    }, this);

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    var n = this.normalizedData.length,
        topTag = this.normalizedData[0],
        i = -1,
        cloudBounds = null,
        contextAndRatio = this.getContext(this.cloudCanvas()),
        board = this.zeroArray((this.w >> 5) * this.h);

    this.calculateMaxFontSize(topTag);

    this.normalizedData.forEach(function(d) {
      d.size = ~~(this.minFontSize + scale.transform(d.value) * (this.maxFontSize - this.minFontSize));
      delete d.sprite;
    }, this);

    while (++i < n) {
      var d = this.normalizedData[i];
      d.x = this.w >> 1;
      d.y = this.h >> 1;
      this.cloudSprite(contextAndRatio, d, this.normalizedData, i);
      if (d.hasText && this.place(board, d, cloudBounds)) {
        if (cloudBounds) this.cloudBounds(cloudBounds, d);
        else cloudBounds = [{x: d.x + d.x0, y: d.y + d.y0}, {x: d.x + d.x1, y: d.y + d.y1}];
        d.x -= this.w >> 1;
        d.y -= this.h >> 1;
      }
    }

    var scale_ = cloudBounds ?
        Math.min(
            this.w / Math.abs(cloudBounds[1].x - this.w / 2),
            this.w / Math.abs(cloudBounds[0].x - this.w / 2),
            this.h / Math.abs(cloudBounds[1].y - this.h / 2),
            this.h / Math.abs(cloudBounds[0].y - this.h / 2)) / 2 :
        1;

    if (!this.layer_) {
      this.layer_ = this.container().unmanagedLayer();
      this.textElementsLayer = acgraph.getRenderer().createLayerElement();
      this.layer_.content(this.textElementsLayer);
    }

    this.layer_
        .setTransformationMatrix(scale_, 0, 0, scale_, this.internalBounds_.left + (this.w >> 1), this.internalBounds_.top + (this.h >> 1));

    this.normalizedData.forEach(function(t) {
      var text;
      // if (t.textEl) t.textEl.dispose();
      // var text = t.textEl = container.text();

      if (t.drawed) {
        // var dx = this.internalBounds_.left + this.internalBounds_.width / 2 - (t.srcParentBounds.left + t.srcParentBounds.width / 2);
        // var dy = this.internalBounds_.top + this.internalBounds_.height / 2 - (t.srcParentBounds.top + t.srcParentBounds.height / 2);

        // t.textEl.domElement().setAttribute('transform', 'translate(' + [t.x + dx, t.y + dy] + ') rotate(' + t.rotate + ')');
        t.textEl.setAttribute('font-size', t.size);
        t.textEl.setAttribute('transform', 'translate(' + [t.x, t.y] + ') rotate(' + t.rotate + ')');

        // t.textEl.setTransformationMatrix(1, 0, 0, 1, 0, 0);
        //
        // t.textEl
        //     .translate(t.x + dx, t.y + dy);
        //
        // var bounds = t.textEl.getBoundsWithTransform(t.textEl.getFullTransformation());
        // var cx = bounds.left + bounds.width / 2;
        // var cy = bounds.top + bounds.height / 2;
        //
        // t.textEl
        //     .rotate(t.rotate, cx, cy);

        // t.textEl.setTransformationMatrix(1, 0, 0, 1, 0, 0);
        // t.textEl
        //     .translate(t.x, t.y)
        //     .rotateByAnchor(t.rotate);
      } else {
        // text = t.textEl = container.text();
        text = t.textEl = acgraph.getRenderer().createTextElement();

        // t.srcParentBounds = this.internalBounds_.clone();

        var fill = this.colorScale.valueToColor(t.sizeRatio);
        // text
        //     .translate(t.x, t.y)
        //     .rotateByAnchor(t.rotate)
        //     .fontSize(t.size)
        //     .fontFamily(t.font)
        //     .text(t.text.toLowerCase())
        //     .color(fill);

        text.innerHTML = t.text.toLowerCase();
        text.setAttribute('font-size', t.size);
        text.setAttribute('font-family', t.font);
        text.setAttribute('fill', fill);
        text.setAttribute('transform', 'translate(' + [t.x, t.y] + ')rotate(' + t.rotate + ')');
        text.setAttribute('text-anchor', 'middle');

        this.textElementsLayer.appendChild(text);

        t.drawed = true;

        // text.domElement().setAttribute('transform', "translate(" + [t.x, t.y] + ")rotate(" + t.rotate + ")");
        // text.domElement().setAttribute('y', 0);
        // text.domElement().setAttribute('text-anchor', 'middle');

        // text.attr('transform', 'translate(' + [t.x, t.y] + ') rotate(' + t.rotate + ')');
        // text.attr('y', 0);
        // text.attr('text-anchor', 'middle');
      }
    }, this);

    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }
};


//endregion
//region --- Setup and Dispose
/**
 * Sets default settings.
 * @param {!Object} config
 */
anychart.charts.TagCloud.prototype.setThemeSettings = function(config) {
  for (var name in this.SIMPLE_PROPS_DESCRIPTORS) {
    var val = config[name];
    if (goog.isDef(val))
      this.themeSettings[name] = val;
  }
};


/** @inheritDoc */
anychart.charts.TagCloud.prototype.setupByJSON = function(config, opt_default) {
  anychart.charts.TagCloud.base(this, 'setupByJSON', config);

  if (opt_default) {
    this.setThemeSettings(config);
  } else {
    anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config);
  }
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
(function() {
  var proto = anychart.charts.TagCloud.prototype;
  proto['data'] = proto.data;
  proto['getType'] = proto.getType;
})();
//exports
//endregion
