/**
 * @fileoverview anychart.data namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.data');

goog.require('anychart.data.ConcatView');
goog.require('anychart.data.FilterView');
goog.require('anychart.data.OrdinalView');
goog.require('anychart.data.ParetoMapping');
goog.require('anychart.data.PieView');
goog.require('anychart.data.ScatterView');
goog.require('anychart.data.Set');
goog.require('anychart.data.SortView');
goog.require('anychart.data.Table');
goog.require('anychart.data.Tree');
goog.require('anychart.enums');

/**
 * Classes for handling data structures/sources<br/>
 * The following data types/hierarchy is supported:
 * <ul>
 *  <li>Linear ({@link anychart.data.Set} and {@link anychart.data.Table})</li>
 *  <li>Tree ({@link anychart.data.Tree})</li>
 * </ul>
 * You can map any of these data sets to ({@link anychart.data.View}), and then
 * work with it using {@link anychart.data.Iterator} iterator.
 * @namespace
 * @name anychart.data
 */


/**
 * @typedef {{
 *  mode: (anychart.enums.TextParsingMode|undefined),
 *  rowsSeparator: (string|undefined),
 *  columnsSeparator: (string|undefined),
 *  ignoreTrailingSpaces: (boolean|undefined),
 *  ignoreFirstRow: (boolean|undefined),
 *  minLength: (number|undefined),
 *  maxLength: (number|undefined),
 *  cutLength: (number|undefined),
 *  ignoreItems: (Array.<string>|undefined),
 *  maxItems: (number|undefined)
 * }}
 */
anychart.data.TextParsingSettings;


/**
 * @typedef {{
 *  title: (string|undefined),
 *  header: (Array.<string>|undefined),
 *  rows: (Array|undefined),
 *  text: (string|undefined),
 *  textSettings: (anychart.enums.TextParsingMode|anychart.data.TextParsingSettings|undefined)
 * }}
 */
anychart.data.DataSettings;


/**
 * Maps passed data as an array of mappings. Data is expected to be a table, e.g. an array of arrays of values.
 * The function treats the table as a source for several series of points, that have the same X value.
 * Each row of the table is treated as a bunch of points, one for each series. Column number 0 is treated as an X value.
 * Other columns (number per series depends on the opt_mode) are treated as data values.
 * @example <t>lineChart</t>
 * var data = [
 *   ['A1', 100, 200, 150, 115],
 *   ['A2', 115, 101, 175, 230],
 *   ['A3', 70, 60, 125, 100],
 *   ['A4', 156, 98, 150, 180],
 *   ['A5', 213, 150, 160, 210],
 *   ['A6', '173', '205', '150', '140'],
 *   ['A7', 95, 190, 140, 60]
 * ];
 * var series = anychart.data.mapAsTable(data, 'range');
 * for (var i in series) {
 *   chart.rangeColumn(series[i]);
 * };
 * @example <c>Lifehack using .apply()</c>
 * var data = [
 *   ['A1', 100, 200, 150, 115],
 *   ['A2', 115, 101, 175, 230],
 *   ['A3', 70, 60, 125, 100],
 *   ['A4', 156, 98, 150, 180]
 * ];
 * anychart.line
 *     .apply(this, anychart.data.mapAsTable(data))
 *     .container(stage).draw();
 * @param {Array.<Array.<*>>} data Source data table.
 * @param {(anychart.enums.MapAsTableMode|string)=} opt_mode Mapping mode.
 * @param {number=} opt_seriesCount Explicit number of series to make mapping for. If not set, auto-determination by
 *    the first table row is used.
 * @return {!Array.<anychart.data.Mapping>} Returns an array of mappings, one per series.
 */
anychart.data.mapAsTable = function(data, opt_mode, opt_seriesCount) {
  if (!data || !goog.isArray(data)) return [];
  var columnsPerSeries;
  if (goog.isDef(opt_mode)) {
    opt_mode = String(opt_mode).toLowerCase();
    switch (opt_mode) {
      case anychart.enums.MapAsTableMode.RANGE:
        columnsPerSeries = 2;
        break;
      case anychart.enums.MapAsTableMode.OHLC:
        columnsPerSeries = 4;
        break;
      default:
        columnsPerSeries = 1;
        break;
    }
  } else {
    columnsPerSeries = 1;
  }
  var seriesCount;
  if (!goog.isDef(opt_seriesCount) ||
      isNaN(seriesCount = anychart.utils.normalizeToNaturalNumber(opt_seriesCount, NaN, false))) {
    if (goog.isArray(data[0])) {
      seriesCount = Math.floor((data[0].length - 1) / columnsPerSeries);
    } else {
      seriesCount = 0;
    }
  }
  if (isNaN(seriesCount) || seriesCount <= 0)
    return [];
  var dataSet = new anychart.data.Set(data);
  var i;
  var res = [];
  if (columnsPerSeries == 1) {
    for (i = 0; i < seriesCount; i++) {
      res.push(dataSet.mapAs({
        'x': [0],
        'value': [1 + i]
      }));
    }
  } else if (columnsPerSeries == 2) {
    for (i = 0; i < seriesCount; i++) {
      res.push(dataSet.mapAs({
        'x': [0],
        'low': [1 + i * 2],
        'high': [1 + i * 2 + 1]
      }));
    }
  } else if (columnsPerSeries == 4) {
    for (i = 0; i < seriesCount; i++) {
      res.push(dataSet.mapAs({
        'x': [0],
        'open': [1 + i * 4],
        'high': [1 + i * 4 + 1],
        'low': [1 + i * 4 + 2],
        'close': [1 + i * 4 + 3]
      }));
    }
  }
  return res;
};


/**
 * If opt_keys passed, build object mapping otherwise array mapping
 * @param {anychart.data.Set} dataSet
 * @param {number} fromIndex
 * @param {number} toIndex
 * @param {!Array.<string>} names
 * @param {Array.<string>=} opt_keys
 * @return {!anychart.data.Mapping} *.
 */
anychart.data.buildMapping = function(dataSet, fromIndex, toIndex, names, opt_keys) {
  var settings = {'x': opt_keys ? opt_keys[0] : 0};

  for (var i = 0, count = names.length; i < count; i++) {
    settings[names[i]] = opt_keys ? opt_keys[fromIndex] : fromIndex;
    fromIndex++;
  }

  return opt_keys ? dataSet.mapAs(undefined, settings) : dataSet.mapAs(settings, undefined);
};


/**
 * Text parsing.
 * @param {string} text .
 * @param {(anychart.enums.TextParsingMode|anychart.data.TextParsingSettings)=} opt_settings .
 * @return {Array.<Array.<string|number>>} .
 */
anychart.data.parseText = function(text, opt_settings) {
  var isCsv = goog.isString(anychart.enums.TextParsingMode) ?
      anychart.enums.TextParsingMode == 'csv' :
      !anychart.enums.TextParsingMode || !anychart.enums.TextParsingMode.mode || !anychart.enums.TextParsingMode.mode == 'csv';

  var result;
  if (isCsv) {
    try {
      var parser = new anychart.data.csv.Parser();
      if (goog.isObject(opt_settings)) {
        parser.rowsSeparator(/** @type {string|undefined} */(opt_settings['rowsSeparator'])); // if it is undefined, it will not be set.
        parser.columnsSeparator(/** @type {string|undefined} */(opt_settings['columnsSeparator'])); // if it is undefined, it will not be set.
        parser.ignoreTrailingSpaces(/** @type {boolean|undefined} */(opt_settings['ignoreTrailingSpaces'])); // if it is undefined, it will not be set.
        parser.ignoreFirstRow(/** @type {boolean|undefined} */(opt_settings['ignoreFirstRow'])); // if it is undefined, it will not be set.
      }
      result = parser.parse(text);
    } catch (e) {
      if (e instanceof Error) {
        try {
          goog.global['console']['log'](e.message);
        } catch (ignored) {
        }
      }
      result = null;
    }
  } else {
    var tags = {};
    var e = {};

    text.split(anychart.charts.TagCloud.WORD_SEPARATORS).forEach(function(t) {
      if (!anychart.charts.TagCloud.DROP_TEXTS.test(t)) {
        t = t.replace(anychart.charts.TagCloud.PUNCTUATION, '');
        if (!this.ignoreList_.test(t.toLowerCase())) {
          t = t.substr(0, this.maxLength_);
          e[t.toLowerCase()] = t;
          tags[t = t.toLowerCase()] = (tags[t] || 0) + 1;
        }
      }
    });

    tags = anychart.utils.entries(tags).sort(function(t, e) {
      return e.value - t.value;
    });

    goog.array.forEach(tags, function(t) {
      t.key = e[t.key];
    });

    result = tags;
  }

  return result;
};


//exports
goog.exportSymbol('anychart.data.mapAsTable', anychart.data.mapAsTable);//doc|ex
goog.exportSymbol('anychart.data.buildMapping', anychart.data.buildMapping);
