goog.provide('anychart.math.dmi');
goog.require('anychart.math.CycledQueue');
goog.require('anychart.utils');


/**
 * @typedef {{
 *   queue: !anychart.math.CycledQueue,
 *   period: number,
 *   prevResult: number,
 *   dispose: Function
 * }}
 */
anychart.math.dmi.Context;


/**
 * Creates context for DMI indicator calculation.
 * @param {number=} opt_period [14] Indicator period. Defaults to 14.
 * @param {number=} opt_adxPeriod [14] Indicator adx period. Defaults to 14.
 * @param {boolean=} opt_useWildersSmoothing [true] Use Wilders smoothing. Defaults to true.
 * @return {anychart.math.dmi.Context}
 */
anychart.math.dmi.initContext = function(opt_period, opt_adxPeriod, opt_useWildersSmoothing) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 14, false);
  var adxPeriod = anychart.utils.normalizeToNaturalNumber(opt_adxPeriod, 14 , false);
  var useWildersSmoothing = !opt_useWildersSmoothing;
  return {
    queue: anychart.math.cycledQueue(period + 1),
    adxQueue: anychart.math.cycledQueue(adxPeriod),
    period: period,
    adxPeriod: adxPeriod,
    useWildersSmoothing: useWildersSmoothing,
    prevResult: NaN,
    /**
     * @this {anychart.math.dmi.Context}
     */
    'dispose': function() {
      this.queue.clear();
    }
  };
};


/**
 * Start calculation function for DMI indicator calculation.
 * @param {anychart.math.dmi.Context} context
 * @this {anychart.math.dmi.Context}
 */
anychart.math.dmi.startFunction = function(context) {
  context.queue.clear();
  context.adxQueue.clear();
  context.prevResult = NaN;
};


/**
 * Calculates DMI value.
 * @param {Object} context
 * @param {number} high
 * @param {number} low
 * @param {number} value
 * @return {number}
 */
anychart.math.dmi.calculate = function(context, high, low, value) {
  if (isNaN(high) || isNaN(low) || isNaN(value))
    return NaN;

};


/**
 * Calculation function for DMI.
 * @param {anychart.data.TableComputer.RowProxy} row
 * @param {anychart.math.dmi.Context} context
 * @this {anychart.math.dmi.Context}
 */
anychart.math.dmi.calculationFunction = function(row, context) {
  var high = anychart.utils.toNumber(row.get('high'));
  var low = anychart.utils.toNumber(row.get('low'));
  var value = anychart.utils.toNumber(row.get('value'));
  var rv = anychart.math.dmi.calculate(context, high, low, value);
  row.set('result', rv);
};


/**
 * Creates DMI computer for the given table mapping.
 * @param {anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @return {anychart.data.TableComputer}
 */
anychart.math.dmi.createComputer = function(mapping, opt_period) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.math.dmi.initContext(opt_period));
  result.setStartFunction(anychart.math.dmi.startFunction);
  result.setCalculationFunction(anychart.math.dmi.calculationFunction);
  result.addOutputField('result');
  return result;
};


//exports
goog.exportSymbol('anychart.math.dmi.initContext', anychart.math.dmi.initContext);
goog.exportSymbol('anychart.math.dmi.startFunction', anychart.math.dmi.startFunction);
goog.exportSymbol('anychart.math.dmi.calculate', anychart.math.dmi.calculate);
goog.exportSymbol('anychart.math.dmi.calculationFunction', anychart.math.dmi.calculationFunction);
goog.exportSymbol('anychart.math.dmi.createComputer', anychart.math.dmi.createComputer);
