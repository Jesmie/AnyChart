goog.provide('anychart.math.dmi');
goog.require('anychart.math.CycledQueue');
goog.require('anychart.utils');


/**
 * @typedef {{
 *   highQueue: !anychart.math.CycledQueue,
 *   lowQueue: !anychart.math.CycledQueue,
 *   closeQueue: !anychart.math.CycledQueue,
 *   adxQueue: !anychart.math.CycledQueue,
 *   period: number,
 *   adxPeriod: number,
 *   useWildersSmoothing: boolean,
 *   alpha: number,
 *   adxAlpha: number,
 *   pdiValue: number,
 *   ndiValue: number,
 *   adxValue: number,
 *   pdiSumValue: number,
 *   ndiSumValue: number,
 *   trSumValue: number,
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
  var useWildersSmoothing = goog.isDef(opt_useWildersSmoothing) ? !!opt_useWildersSmoothing : true;
  var alpha = 2 / (period + 1);
  var adxAlpha = 2 / (adxPeriod + 1);
  return {
    highQueue: anychart.math.cycledQueue(period + 1),
    lowQueue: anychart.math.cycledQueue(period + 1),
    closeQueue: anychart.math.cycledQueue(period + 1),
    adxQueue: anychart.math.cycledQueue(adxPeriod),
    period: period,
    adxPeriod: adxPeriod,
    useWildersSmoothing: useWildersSmoothing,
    alpha: alpha,
    adxAlpha: adxAlpha,
    pdiValue: NaN,
    ndiValue: NaN,
    adxValue: NaN,
    pdiSumValue: NaN,
    ndiSumValue: NaN,
    trSumValue: NaN,
    /**
     * @this {anychart.math.dmi.Context}
     */
    'dispose': function() {
      this.highQueue.clear();
      this.lowQueue.clear();
      this.closeQueue.clear();
      this.adxQueue.clear();
    }
  };
};


/**
 * Start calculation function for DMI indicator calculation.
 * @param {anychart.math.dmi.Context} context
 * @this {anychart.math.dmi.Context}
 */
anychart.math.dmi.startFunction = function(context) {
  context.highQueue.clear();
  context.lowQueue.clear();
  context.closeQueue.clear();
  context.adxQueue.clear();
  context.pdiValue = NaN;
  context.ndiValue = NaN;
  context.adxValue = NaN;
};


/**
 * Calculates DMI value.
 * @param {anychart.math.dmi.Context} context
 * @param {number} close
 * @param {number} high
 * @param {number} low
 * @return {Array.<number>}
 */
anychart.math.dmi.calculate = function(context, close, high, low) {
  if (isNaN(high) || isNaN(low) || isNaN(close))
    return [NaN, NaN, NaN];

  var highQueue = context.highQueue;
  var lowQueue = context.lowQueue;
  var closeQueue = context.closeQueue;
  var adxQueue = context.adxQueue;

  highQueue.enqueue(high);
  lowQueue.enqueue(low);
  closeQueue.enqueue(close);

  if (highQueue.getLength() < (context.period + 1)) {
    return [NaN, NaN, NaN];
  } else {
    var highValue, lowValue, i;
    var dTmpP, dTmpN, TR, dx, tmp1, tmp2;
    var resultPDI, resultNDI;
    if (isNaN(context.pdiValue)) {
      // init +DI, -DI calculation
      context.pdiValue = 0;
      context.ndiValue = 0;
      context.pdiSumValue = 0;
      context.ndiSumValue = 0;
      context.trSumValue = 0;

      highValue = /** @type {number} */ (highQueue.get(0));
      lowValue = /** @type {number} */ (lowQueue.get(0));
      var prevHigh, prevLow, prevClose;
      for (i = 1; i < context.period + 1; i++) {
        prevHigh = highValue;
        prevLow = lowValue;
        highValue = /** @type {number} */ (highQueue.get(i));
        lowValue = /** @type {number} */ (lowQueue.get(i));
        prevClose = /** @type {number} */ (closeQueue.get(i - 1));
        dTmpP = highValue - prevHigh;
        dTmpN = prevLow - lowValue;
        if (dTmpP < 0.0) dTmpP = 0.0;
        if (dTmpN < 0.0) dTmpN = 0.0;
        if (dTmpP > dTmpN) {
          dTmpN = 0.0;
        } else if (dTmpP < dTmpN) {
          dTmpP = 0.0;
        } else {
          dTmpP = 0.0;
          dTmpN = 0.0;
        }
        TR = Math.max(Math.abs(highValue - lowValue), Math.abs(highValue - prevClose), Math.abs(lowValue - prevClose));
        if (TR != 0) {
          context.pdiValue += context.alpha * (100 * dTmpP / TR - context.pdiValue);
          context.ndiValue += context.alpha * (100 * dTmpN / TR - context.ndiValue);
        } else {
          context.pdiValue -= context.alpha * context.pdiValue;
          context.ndiValue -= context.alpha * context.ndiValue;
        }
        context.pdiSumValue += dTmpP;
        context.ndiSumValue += dTmpN;
        context.trSumValue += TR;
      }

      if (context.useWildersSmoothing) {
        if (context.trSumValue != 0) {
          tmp1 = 100 * context.pdiSumValue / context.trSumValue;
          tmp2 = 100 * context.ndiSumValue / context.trSumValue;
          dx = 100 * Math.abs(tmp1 - tmp2) / (tmp1 + tmp2);
          resultPDI = tmp1;
          resultNDI = tmp2;
        } else {
          resultPDI = 0;
          resultNDI = 0;
          dx = 0;
        }
      } else {
        resultPDI = context.pdiValue;
        resultNDI = context.ndiValue;
        dx = 100 * Math.abs(resultPDI - resultNDI) / (resultPDI + resultNDI);
      }
    } else {
      // process +DI, -DI calculation
      highValue = /** @type {number} */ (highQueue.get(-1));
      prevHigh = /** @type {number} */ (highQueue.get(-2));
      lowValue = /** @type {number} */ (lowQueue.get(-1));
      prevLow = /** @type {number} */ (lowQueue.get(-2));
      dTmpP = highValue - prevHigh;
      dTmpN = prevLow - lowValue;
      if (dTmpP < 0) dTmpP = 0;
      if (dTmpN < 0) dTmpN = 0;
      if (dTmpP > dTmpN) {
        dTmpN = 0;
      } else if (dTmpP < dTmpN) {
        dTmpP = 0;
      } else {
        dTmpP = 0;
        dTmpN = 0;
      }
      prevClose = /** @type {number} */ (closeQueue.get(-2));
      TR = Math.max(
          Math.abs(highValue - lowValue),
          Math.abs(highValue - prevClose),
          Math.abs(lowValue - prevClose));
      if (TR != 0) {
        context.pdiValue += context.alpha * (100.0 * dTmpP / TR - context.pdiValue);
        context.ndiValue += context.alpha * (100.0 * dTmpN / TR - context.ndiValue);
      } else {
        context.pdiValue -= context.alpha * context.pdiValue;
        context.ndiValue -= context.alpha * context.ndiValue;
      }
      context.pdiSumValue = context.pdiSumValue - context.pdiSumValue / context.period + dTmpP;
      context.ndiSumValue = context.ndiSumValue - context.ndiSumValue / context.period + dTmpN;
      context.trSumValue = context.trSumValue - context.trSumValue / context.period + TR;

      if (context.useWildersSmoothing) {
        if (context.trSumValue != 0) {
          tmp1 = 100 * context.pdiSumValue / context.trSumValue;
          tmp2 = 100 * context.ndiSumValue / context.trSumValue;
          if (tmp1 + tmp2 > 0)
            dx = 100 * Math.abs(tmp1 - tmp2) / (tmp1 + tmp2);
          else
            dx = 0;

          resultPDI = tmp1;
          resultNDI = tmp2;
        } else {
          resultPDI = 0;
          resultNDI = 0;
          dx = 0;
        }
      } else {
        resultPDI = context.pdiValue;
        resultNDI = context.ndiValue;
        dx = 100.0 * Math.abs(resultPDI - resultNDI) / (resultPDI + resultNDI);
      }
    }
    if (isNaN(dx))
      return [resultPDI, resultNDI, NaN];

    adxQueue.enqueue(dx);
    if (adxQueue.getLength() < context.adxPeriod) {
      return [resultPDI, resultNDI, NaN];
    } else {
      if (isNaN(context.adxValue)) {
        // init ADX calculation
        var sum = 0;
        for (i = 0; i < context.adxPeriod; i++) {
          sum += /** @type {number} */ (adxQueue.get(i));
        }
        sum /= context.adxPeriod;
        context.adxValue = sum;
      } else {
        // process ADX calculation
        var adxValue = /** @type {number} */ (adxQueue.get(-1));
        if (context.useWildersSmoothing) {
          context.adxValue = context.adxValue + (adxValue - context.adxValue) / context.adxPeriod;
        } else {
          context.adxValue += context.adxAlpha * (adxValue - context.adxValue);
        }
      }
    }
    return [resultPDI, resultNDI, context.adxValue];
  }
};


/**
 * Calculation function for DMI.
 * @param {anychart.data.TableComputer.RowProxy} row
 * @param {anychart.math.dmi.Context} context
 * @this {anychart.math.dmi.Context}
 */
anychart.math.dmi.calculationFunction = function(row, context) {
  var close = anychart.utils.toNumber(row.get('close'));
  var high = anychart.utils.toNumber(row.get('high'));
  var low = anychart.utils.toNumber(row.get('low'));
  var rv = anychart.math.dmi.calculate(context, close, high, low);
  row.set('pdiResult', rv[0]);
  row.set('ndiResult', rv[1]);
  row.set('adxResult', rv[2]);
};


/**
 * Creates DMI computer for the given table mapping.
 * @param {anychart.data.TableMapping} mapping
 * @param {number=} opt_period [14] Indicator period. Defaults to 14.
 * @param {number=} opt_adxPeriod [14] Indicator adx period. Defaults to 14.
 * @param {boolean=} opt_useWildersSmoothing [true] Use Wilders smoothing. Defaults to true.
 * @return {anychart.data.TableComputer}
 */
anychart.math.dmi.createComputer = function(mapping, opt_period, opt_adxPeriod, opt_useWildersSmoothing) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.math.dmi.initContext(opt_period, opt_adxPeriod, opt_useWildersSmoothing));
  result.setStartFunction(anychart.math.dmi.startFunction);
  result.setCalculationFunction(anychart.math.dmi.calculationFunction);
  result.addOutputField('pdiResult');
  result.addOutputField('ndiResult');
  result.addOutputField('adxResult');
  return result;
};


//exports
goog.exportSymbol('anychart.math.dmi.initContext', anychart.math.dmi.initContext);
goog.exportSymbol('anychart.math.dmi.startFunction', anychart.math.dmi.startFunction);
goog.exportSymbol('anychart.math.dmi.calculate', anychart.math.dmi.calculate);
goog.exportSymbol('anychart.math.dmi.calculationFunction', anychart.math.dmi.calculationFunction);
goog.exportSymbol('anychart.math.dmi.createComputer', anychart.math.dmi.createComputer);
