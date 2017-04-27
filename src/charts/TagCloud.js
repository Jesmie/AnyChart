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
  this.size = [900, 600];

  this.colorScale = anychart.scales.linearColor(anychart.color.singleHueProgression('#3b5998'));
  this.scale = anychart.scales.linear().minimum(10).maximum(150);

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
    c.font = d.style + " " + d.weight + " " + ~~ ((d.size + 1) / ratio) + "px " + d.font;
    var w = c.measureText(d.text + "m").width * ratio,
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

anychart.charts.TagCloud.prototype.cloudBounds = function(bounds, d) {
  var b0 = bounds[0],
      b1 = bounds[1];
  if (d.x + d.x0 < b0.x) b0.x = d.x + d.x0;
  if (d.y + d.y0 < b0.y) b0.y = d.y + d.y0;
  if (d.x + d.x1 > b1.x) b1.x = d.x + d.x1;
  if (d.y + d.y1 > b1.y) b1.y = d.y + d.y1;
};

anychart.charts.TagCloud.prototype.collideRects = function(a, b) {
  return a.x + a.x1 > b[0].x && a.x + a.x0 < b[1].x && a.y + a.y1 > b[0].y && a.y + a.y0 < b[1].y;
};

anychart.charts.TagCloud.prototype.archimedeanSpiral = function(size) {
  var e = size[0] / size[1];
  return function(t) {
    return [e * (t *= .1) * Math.cos(t), t * Math.sin(t)];
  };
};

anychart.charts.TagCloud.prototype.rectangularSpiral = function(size) {
  var dy = 4,
      dx = dy * size[0] / size[1],
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

anychart.charts.TagCloud.prototype.zeroArray = function(n) {
  var a = [],
      i = -1;
  while (++i < n) a[i] = 0;
  return a;
};

anychart.charts.TagCloud.prototype.cloudCanvas = function() {
  return document.createElement("canvas");
};

anychart.charts.TagCloud.prototype.getContext = function(canvas) {
  canvas.width = canvas.height = 1;
  var ratio = Math.sqrt(canvas.getContext("2d").getImageData(0, 0, 1, 1).data.length >> 2);
  canvas.width = (this.cw << 5) / ratio;
  canvas.height = this.ch / ratio;

  var context = canvas.getContext("2d");
  context.fillStyle = context.strokeStyle = "red";
  context.textAlign = "center";

  return {
    context: context,
    ratio: ratio
  };
};

anychart.charts.TagCloud.prototype.place = function(board, tag, bounds) {
  var perimeter = [{
        x: 0,
        y: 0
      }, {
        x: this.size[0],
        y: this.size[1]
      }],
      startX = tag.x,
      startY = tag.y,
      maxDelta = Math.sqrt(this.size[0] * this.size[0] + this.size[1] * this.size[1]),
      s = this.archimedeanSpiral(this.size),
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

    if (tag.x + tag.x0 < 0 || tag.y + tag.y0 < 0 || tag.x + tag.x1 > this.size[0] || tag.y + tag.y1 > this.size[1]) continue;
    if (!bounds || !this.cloudCollide(tag, board, this.size[0])) {
      if (!bounds || this.collideRects(tag, bounds)) {
        var sprite = tag.sprite,
            w = tag.width >> 5,
            sw = this.size[0] >> 5,
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
  var contextAndRatio = this.getContext(this.cloudCanvas());
  var board = this.zeroArray((this.size[0] >> 5) * this.size[1]);
  var bounds = null;

  var parentView = this.parentViewToDispose_.data();
  var normalizedData = [];
  parentView.forEach(function(item) {
    normalizedData.push({key: item[0], value: item[1]})
  });
  var max = normalizedData[0].value;

  var n = normalizedData.length;
  var i = -1;
  var tags = [];

  var scale = this.scale;

  var data = normalizedData.map(function(d, i) {
    d.text = d.key;
    d.font = 'Times new roman';
    d.style = 'normal';
    d.weight = 'normal';
    // d.rotate = (~~(Math.random() * 6) - 3) * 30;
    d.rotate = 45;
    d.size = ~~scale.inverseTransform(d.value / max);
    d.sizeRatio = d.value / max;
    d.padding = 1;
    return d;
  }).sort(function(a, b) {
    return b.size - a.size;
  });


  while (++i < n) {
    var d = data[i];
    // d.x = (this.size[0] * (Math.random() + .5)) >> 1;
    // d.y = (this.size[1] * (Math.random() + .5)) >> 1;
    d.x = (this.size[0] * 1.5) >> 1;
    d.y = (this.size[1] * 1.5) >> 1;
    this.cloudSprite(contextAndRatio, d, data, i);
    if (d.hasText && this.place(board, d, bounds)) {
      tags.push(d);
      // event.call("word", cloud, d);
      if (bounds) this.cloudBounds(bounds, d);
      else bounds = [{
        x: d.x + d.x0,
        y: d.y + d.y0
      }, {
        x: d.x + d.x1,
        y: d.y + d.y1
      }];
      // Temporary hack
      d.x -= this.size[0] >> 1;
      d.y -= this.size[1] >> 1;
    }
  }

  var w = this.size[0];
  var h = this.size[1];

  var scale_ = bounds ? Math.min(w / Math.abs(bounds[1].x - w / 2), w / Math.abs(bounds[0].x - w / 2), h / Math.abs(bounds[1].y - h / 2), h / Math.abs(bounds[0].y - h / 2)) / 2 : 1;

  var container = this.container().layer();
  data.forEach(function(t) {
    var text = container.text();
    var fill = this.colorScale.valueToColor(t.sizeRatio);

    text
        .translate(t.x, t.y)
        .rotateByAnchor(t.rotate)
        .fontSize(t.size)
        .fontFamily(t.font)
        .text(t.text.toLowerCase())
        .color(fill);

    container
        .setTransformationMatrix(scale_, 0, 0, scale_, w >> 1, h >> 1);


    text.domElement().setAttribute('y', 0);
    text.domElement().setAttribute('text-anchor', 'middle');
  }, this);
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
