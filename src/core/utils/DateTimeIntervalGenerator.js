goog.provide('anychart.core.utils.DateTimeIntervalGenerator');
goog.require('anychart.core.utils.IIntervalGenerator');
goog.require('anychart.utils');



/**
 * Class representing a date/time interval. Used for date calculations.
 * This class is a combination of goog.date.Interval and goog.date.UtcDateTime with some performance improvements in
 * iteration by the interval - no new Date objects are created while adding - all manipulations are made in one Date
 * object and the result of iteration is a number timestamp.
 *
 * @param {string} unit Years or string representing date part.
 * @param {number} count Months or number of whatever date part specified
 *     by first parameter.
 * @constructor
 * @implements {anychart.core.utils.IIntervalGenerator}
 */
anychart.core.utils.DateTimeIntervalGenerator = function(unit, count) {
  /**
   * Interval unit.
   * @type {anychart.enums.Interval}
   * @private
   */
  this.unit_ = anychart.enums.normalizeInterval(unit);

  /**
   * Interval unit count.
   * @type {number}
   * @private
   */
  this.count_ = count || 1;

  /**
   * Internal date container.
   * @type {Date}
   * @private
   */
  this.date_ = new Date(0);

  switch (this.unit_) {
    case anychart.enums.Interval.YEAR:
      this.range_ = this.count_ * 1000 * 60 * 60 * 24 * 365.25;
      this.align_ = this.alignYears_;
      this.next = this.nextYear_;
      return this;
    case anychart.enums.Interval.SEMESTER:
      this.range_ = this.count_ * 1000 * 60 * 60 * 24 * 365.25 / 2;
      this.align_ = this.alignSemesters_;
      this.next = this.nextSemester_;
      return this;
    case anychart.enums.Interval.QUARTER:
      this.range_ = this.count_ * 1000 * 60 * 60 * 24 * 365.25 / 4;
      this.align_ = this.alignQuarters_;
      this.next = this.nextQuarter_;
      return this;
    case anychart.enums.Interval.MONTH:
      this.range_ = this.count_ * 1000 * 60 * 60 * 24 * 365.25 / 12;
      this.align_ = this.alignMonths_;
      this.next = this.nextMonth_;
      return this;
    case anychart.enums.Interval.THIRD_OF_MONTH:
      this.range_ = this.count_ * 1000 * 60 * 60 * 24 * 365.25 / 36;
      this.align_ = this.alignThirdOfMonths_;
      this.next = this.nextThirdOfMonth_;
      return this;
    case anychart.enums.Interval.WEEK:
      this.range_ = this.count_ * 1000 * 60 * 60 * 24 * 7;
      this.align_ = this.alignWeeks_;
      this.next = this.nextWeek_;
      return this;
    case anychart.enums.Interval.DAY:
    default:
      this.range_ = this.count_ * 1000 * 60 * 60 * 24;
      this.align_ = this.alignDays_;
      this.next = this.nextDay_;
      break;
    case anychart.enums.Interval.HOUR:
      this.range_ = this.count_ * 1000 * 60 * 60;
      this.align_ = this.alignHours_;
      this.next = this.nextHour_;
      break;
    case anychart.enums.Interval.MINUTE:
      this.range_ = this.count_ * 1000 * 60;
      this.align_ = this.alignMinutes_;
      this.next = this.nextMinute_;
      break;
    case anychart.enums.Interval.SECOND:
      this.range_ = this.count_ * 1000;
      this.align_ = this.alignSeconds_;
      this.next = this.nextSecond_;
      break;
    case anychart.enums.Interval.MILLISECOND:
      this.range_ = this.count_;
      this.align_ = this.alignMilliseconds_;
      this.next = this.nextMillisecond_;
      break;
  }
};


/**
 * Aligns current position to the left by current unit and count and shifts left for one interval.
 * @type {function(this:anychart.core.utils.DateTimeIntervalGenerator)}
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.align_;


/**
 * Estimated interval in milliseconds.
 * @type {number}
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.range_;


/**
 * Moves current generator timestamp to the next one and returns it.
 * @return {number}
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.next;


/**
 * Sets generator current position to the date previous to aligned passed value.
 * Known issue - for complex intervals like P2Y3D aligning works unstable.
 * @param {number} value Date to start iteration from.
 * @return {anychart.core.utils.DateTimeIntervalGenerator} this for chaining.
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.setStart = function(value) {
  this.date_.setTime(value);
  this.align_();
  return this;
};


/**
 * Aligns by years.
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.alignYears_ = function() {
  var year = anychart.utils.alignLeft(this.date_.getUTCFullYear(), this.count_, 2000) - this.count_;
  this.date_.setTime(Date.UTC(year, 0));
};


/**
 * Aligns by semesters.
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.alignSemesters_ = function() {
  var val = anychart.utils.alignLeft(
      this.date_.getUTCMonth() + this.date_.getUTCFullYear() * 12,
      this.count_ * 6,
      2000 * 12) - this.count_ * 6;
  var year = Math.floor(val / 12);
  var month = val % 12;
  if (month < 0) month += 12;
  this.date_.setTime(Date.UTC(year, month));
};


/**
 * Aligns by quarters.
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.alignQuarters_ = function() {
  var val = anychart.utils.alignLeft(
      this.date_.getUTCMonth() + this.date_.getUTCFullYear() * 12,
      this.count_ * 3,
      2000 * 12) - this.count_ * 3;
  var year = Math.floor(val / 12);
  var month = val % 12;
  if (month < 0) month += 12;
  this.date_.setTime(Date.UTC(year, month));
};


/**
 * Aligns by months.
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.alignMonths_ = function() {
  var val = anychart.utils.alignLeft(
      this.date_.getUTCMonth() + this.date_.getUTCFullYear() * 12,
      this.count_,
      2000 * 12) - this.count_;
  var year = Math.floor(val / 12);
  var month = val % 12;
  if (month < 0) month += 12;
  this.date_.setTime(Date.UTC(year, month));
};


/**
 * Aligns by third of months.
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.alignThirdOfMonths_ = function() {
  var decade;
  var date = this.date_.getUTCDate();
  if (date <= 10)
    decade = 0;
  else if (date <= 20)
    decade = 1;
  else
    decade = 2;
  var val = anychart.utils.alignLeft(
      (this.date_.getUTCFullYear() * 12 + this.date_.getUTCMonth()) * 3 + decade,
      this.count_,
      2000 * 12 * 3) - this.count_;
  var year = Math.floor(val / 36);
  val %= 36;
  var month = Math.floor(val / 3);
  if (month < 0) month += 12;
  decade = val % 3;
  if (decade < 0) decade += 3;
  this.date_.setTime(Date.UTC(year, month, 1 + decade * 10));
};


/**
 * Aligns by weeks.
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.alignWeeks_ = function() {
  var time = this.count_ * 1000 * 60 * 60 * 24 * 7;
  // we align relative to the 2nd of Jan, 2000 because it's Sunday
  this.date_.setTime(anychart.utils.alignLeft(this.date_.getTime(), time, Date.UTC(2000, 0, 2)) - time);
};


/**
 * Aligns by days.
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.alignDays_ = function() {
  var time = this.count_ * 1000 * 60 * 60 * 24;
  this.date_.setTime(anychart.utils.alignLeft(this.date_.getTime(), time, Date.UTC(2000, 0)) - time);
};


/**
 * Aligns by hours.
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.alignHours_ = function() {
  var time = this.count_ * 1000 * 60 * 60;
  this.date_.setTime(anychart.utils.alignLeft(this.date_.getTime(), time, Date.UTC(2000, 0)) - time);
};


/**
 * Aligns by minutes.
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.alignMinutes_ = function() {
  var time = this.count_ * 1000 * 60;
  this.date_.setTime(anychart.utils.alignLeft(this.date_.getTime(), time, Date.UTC(2000, 0)) - time);
};


/**
 * Aligns by seconds.
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.alignSeconds_ = function() {
  var time = this.count_ * 1000;
  this.date_.setTime(anychart.utils.alignLeft(this.date_.getTime(), time, Date.UTC(2000, 0)) - time);
};


/**
 * Aligns by milliseconds.
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.alignMilliseconds_ = function() {
  var time = this.count_;
  this.date_.setTime(anychart.utils.alignLeft(this.date_.getTime(), time, Date.UTC(2000, 0)) - time);
};


/**
 * Returns next year from the current date.
 * @return {number}
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.nextYear_ = function() {
  // we use this simple way because we assume that this.date_ is aligned by year.
  this.date_.setUTCFullYear(this.date_.getUTCFullYear() + this.count_);
  return this.date_.getTime();
};


/**
 * Returns next semester from the current date.
 * @return {number}
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.nextSemester_ = function() {
  var month = this.date_.getUTCMonth() + this.count_ * 6;
  var year = this.date_.getUTCFullYear() + Math.floor(month / 12);
  month %= 12;
  if (month < 0) {
    month += 12;
  }
  this.date_.setUTCFullYear(year);
  this.date_.setUTCMonth(month);
  return this.date_.getTime();
};


/**
 * Returns next quarter from the current date.
 * @return {number}
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.nextQuarter_ = function() {
  var month = this.date_.getUTCMonth() + this.count_ * 3;
  var year = this.date_.getUTCFullYear() + Math.floor(month / 12);
  month %= 12;
  if (month < 0) {
    month += 12;
  }
  this.date_.setUTCFullYear(year);
  this.date_.setUTCMonth(month);
  return this.date_.getTime();
};


/**
 * Returns next month from the current date.
 * @return {number}
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.nextMonth_ = function() {
  var month = this.date_.getUTCMonth() + this.count_;
  var year = this.date_.getUTCFullYear() + Math.floor(month / 12);
  month %= 12;
  if (month < 0) {
    month += 12;
  }
  this.date_.setUTCFullYear(year);
  this.date_.setUTCMonth(month);
  return this.date_.getTime();
};


/**
 * Returns next third of month from the current date.
 * @return {number}
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.nextThirdOfMonth_ = function() {
  var decade;
  var date = this.date_.getUTCDate();
  if (date <= 10)
    decade = 0;
  else if (date <= 20)
    decade = 1;
  else
    decade = 2;
  var val = (this.date_.getUTCFullYear() * 12 + this.date_.getUTCMonth()) * 3 + decade + this.count_;
  var year = Math.floor(val / 36);
  val %= 36;
  var month = Math.floor(val / 3);
  if (month < 0) month += 12;
  decade = val % 3;
  if (decade < 0) decade += 3;
  this.date_.setTime(Date.UTC(year, month, 1 + decade * 10));
  return this.date_.getTime();
};


/**
 * Returns next week from the current date.
 * @return {number}
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.nextWeek_ = function() {
  var res = this.date_.getTime() + this.count_ * 1000 * 60 * 60 * 24 * 7;
  this.date_.setTime(res);
  return res;
};


/**
 * Returns next day from the current date.
 * @return {number}
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.nextDay_ = function() {
  var res = this.date_.getTime() + this.count_ * 1000 * 60 * 60 * 24;
  this.date_.setTime(res);
  return res;
};


/**
 * Returns next hour from the current date.
 * @return {number}
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.nextHour_ = function() {
  var res = this.date_.getTime() + this.count_ * 1000 * 60 * 60;
  this.date_.setTime(res);
  return res;
};


/**
 * Returns next minute from the current date.
 * @return {number}
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.nextMinute_ = function() {
  var res = this.date_.getTime() + this.count_ * 1000 * 60;
  this.date_.setTime(res);
  return res;
};


/**
 * Returns next second from the current date.
 * @return {number}
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.nextSecond_ = function() {
  var res = this.date_.getTime() + this.count_ * 1000;
  this.date_.setTime(res);
  return res;
};


/**
 * Returns next millisecond from the current date.
 * @return {number}
 * @private
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.nextMillisecond_ = function() {
  var res = this.date_.getTime() + this.count_;
  this.date_.setTime(res);
  return res;
};


/**
 * Serializes anychart.core.utils.DateTimeIntervalGenerator.
 * @return {string}
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.getHash = function() {
  return this.unit_ + this.count_.toFixed(0);
};


/**
 * Returns interval unit.
 * @return {anychart.enums.Interval}
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.getUnit = function() {
  return this.unit_;
};


/**
 * Returns interval units count.
 * @return {number}
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.getCount = function() {
  return this.count_;
};


/**
 * Returns estimated interval of the generator in milliseconds.
 * @return {number}
 */
anychart.core.utils.DateTimeIntervalGenerator.prototype.getRange = function() {
  return this.range_;
};


/**
 * Compares two generators.
 * @param {anychart.core.utils.DateTimeIntervalGenerator} a
 * @param {anychart.core.utils.DateTimeIntervalGenerator} b
 * @return {number}
 */
anychart.core.utils.DateTimeIntervalGenerator.comparator = function(a, b) {
  var res = a.getRange() - b.getRange();
  // if ranges are equal we consider the generator with greater unit (e.g. less units count) bigger
  return res ? res : b.count_ - a.count_;
};