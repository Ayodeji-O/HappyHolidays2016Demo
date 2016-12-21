// RawImagePixelRep.js - Representation of data that defines a single
//						pixel within an, uncompressed image data set
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js
//  -RgbColor.js

function rawImagePixelRep(unitRedValue, unitGreenValue, unitBlueValue, unitAlphaValue) {
	this.rgbColor = new rgbColor(unitRedValue, unitGreenValue, unitBlueValue, unitAlphaValue);
	
	// Client specified, custom data
	this.auxiliaryData = null;
}

/**
 * Sets the pixel color, using a provided RGB value 
 * @param rgbValue {rgbColor} Color object used to define the pixel
 *                            color
 */
rawImagePixelRep.prototype.setColorsFromRgbValue = function(rgbValue) {
	if (validateVar(rgbValue)) {
		this.rgbColor = rgbValue;
	}
}

/**
 * Retrieves the represented RGB color value
 * @return {rgbColor} An object containing the represented color
 *                    value
 */
rawImagePixelRep.prototype.getRgbColor = function() {
	return this.rgbColor;
}