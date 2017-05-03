goog.provide('anychart.context');



/**
 * Inherit the prototype methods from one constructor into another.
 *
 * Usage:
 * <pre>
 * function ParentClass(a, b) { }
 * ParentClass.prototype.foo = function(a) { };
 *
 * function ChildClass(a, b, c) {
 *   ChildClass.base(this, 'constructor', a, b);
 * }
 * goog.inherits(ChildClass, ParentClass);
 *
 * var child = new ChildClass('a', 'b', 'see');
 * child.foo(); // This works.
 * </pre>
 *
 * @param {!Function} childCtor Child class.
 * @param {!Function} parentCtor Parent class.
 */
anychart.context.inherits = goog.inherits;
anychart.context.exportSymbol = goog.exportSymbol;
anychart.context.getFullTheme = anychart.getFullTheme;
window['anychrat'] = window['anychrat'] || {};
window['anychrat']['context'] = anychart.context;
