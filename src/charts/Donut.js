goog.provide('anychart.charts.Donut');
goog.require('anychart.charts.Pie');
goog.require('anychart.context');
goog.require('anychart.core.utils.IInteractiveSeries');



/**
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the chart.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @extends {anychart.context.PieChart}
 * @implements {anychart.core.utils.IInteractiveSeries}
 * @constructor
 */
anychart.charts.Donut = function(opt_data, opt_csvSettings) {
    anychart.charts.Donut.base(this, 'constructor', opt_data, opt_csvSettings);
};
window['anychrat']['context'].inherits(anychart.charts.Donut, window['anychrat']['context'].PieChart);
