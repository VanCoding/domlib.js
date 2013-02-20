var Tag = require("./tag.js");

module.exports = function Div(){
	return Tag.apply(this,["div"].concat(Array.prototype.slice.call(arguments)));
}