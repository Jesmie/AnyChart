goog.provide('anychart.modules.donut');

goog.require('anychart.charts.Donut');
goog.require('anychart.modules.base');


/**
 * Default pie chart.<br/>
 * <b>Note:</b> Contains predefined settings for legend and tooltip.
 * @example
 * anychart.pie([1.3, 2, 1.4])
 *   .container(stage).draw();
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the chart.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {anychart.charts.Pie} Default pie chart.
 */
anychart.donut = function(opt_data, opt_csvSettings) {
    var chart = new anychart.charts.Donut(opt_data, opt_csvSettings);
    chart.setupByVal(anychart.getFullTheme('pie'), true);

    return chart;
};