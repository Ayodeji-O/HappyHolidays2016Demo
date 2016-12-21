// RawImageDataRep.js - Representation of raw, uncompressed image
//                      data
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js
//  -RawImagePixelRep.js

function rawImageDataRep (sourceImage, targetWidth, targetHeight) {
	this.targetWidth = 0;
	this.targetHeight = 0;
	
	// 4 bytes per pixel - Red, Green, Blue, Alpha
	this.bytesPerPixel = 4;
	
	if (validateVar(sourceImage) && (returnValidNumOrZero(targetWidth) > 0.0) &&
		(returnValidNumOrZero(targetHeight) > 0.0)) {
			
		this.targetWidth = targetWidth;
		this.targetHeight = targetHeight;
		
		this.imageDataLength = this.targetWidth * this.targetHeight;
		
		this.initializeImageData();
		
		// Read the image data from the image, and store it using the appropriate
		// internal data representation.
		this.importImageDataFromImage(sourceImage);
	}	
}

/**
 * Prepares the internally-stored image storage structures
 */
rawImageDataRep.prototype.initializeImageData = function() {
	this.imageData = [];
	
	for (var initLoop = 0; initLoop < this.imageDataLength; initLoop++) {
		this.imageData[initLoop] = new rawImagePixelRep(0.0, 0.0, 0.0, 0.0);
	}
}

/**
 * Imports an image, storing the image in accordance with the
 *  format of the internally-specified data structures
 * @param sourceImage {Image} Image to be imported
 */
rawImageDataRep.prototype.importImageDataFromImage = function(sourceImage) {
	if (validateVar(sourceImage) && (sourceImage instanceof Image) &&
		(sourceImage.width > 0) && (sourceImage.height > 0)) {

		// A canvas (and its associated context) is required to access the
		// image pixel data.
		var imageAccessCanvas = document.createElement("canvas");
		imageAccessCanvas.width = sourceImage.width;
		imageAccessCanvas.height = sourceImage.height;
		
		var imageAccessCanvasContext = imageAccessCanvas.getContext('2d');
		imageAccessCanvasContext.drawImage(sourceImage, 0, 0);
		
		// Extract the image data from the canvas context.
		this.importImageDataFromCanvasContext(imageAccessCanvasContext);
	}
}

/**
 * Imports image data from a canvas context, storing the image in accordance with the
 *  format of the internally-specified data structures
 * @param sourceContext {CanvasRenderingContext2D} Canvas context containing the image
 *                                                 data to be imported
 */
rawImageDataRep.prototype.importImageDataFromCanvasContext = function(sourceContext) {
	if (validateVar(sourceContext) && (sourceContext instanceof CanvasRenderingContext2D) &&
		(sourceContext.canvas.width > 0) && (sourceContext.canvas.height > 0)) {
		
		// The image data will be imported in a manner that permits retention of
		// the source image aspect ratio - the imported content will contain margins
		// on either the x or y axes...
		var canvasAspectRatio = sourceContext.canvas.width / sourceContext.canvas.height;
		var imageDataRepAspectRatio = this.targetWidth / this.targetHeight;

		var scaledSourceWidth = 0;
		var scaledSourceHeight = 0;
		
		if (canvasAspectRatio > imageDataRepAspectRatio) {
			// ...If the aspect ratio of the source image is greater than that
			// defined within the image representation, scale the source
			// image using the ratio of the target and source x axes (will
			// result in top/bottom margins).
			scaledSourceWidth = this.targetWidth;
			scaledSourceHeight = (this.targetWidth / sourceContext.canvas.width) * sourceContext.canvas.height;
		}
		else {
			// ...If the aspect ratio of the source image is less than (or, equal)
			// that defined within the image representation, scale the
			// source image using the ratio of the target and source y axes (will
			// result in left/right margins).
			scaledSourceWidth = (this.targetHeight / sourceContext.canvas.height) * sourceContext.canvas.width;
			scaledSourceHeight = this.targetHeight;
		}
		
		this.extractCanvasPixelData(sourceContext, scaledSourceWidth, scaledSourceHeight);
	}
}

/**
 * Extracts the pixel data contained within a canvas, scaling the data
 *  to conform to the specified container dimensions, while preserving
 *  the aspect ratio of the original image data (margins will be added
 *  to the horizontal and vertical axes as necessary)
 * @param sourceContext Canvas context containing the image data to be imported
 * @param scaledSourceWidth The target width for the imported image data
 * @param scaledSourceHeight The target height for the imported image data
 */
rawImageDataRep.prototype.extractCanvasPixelData = function(sourceContext, scaledSourceWidth, scaledSourceHeight) {
	if (validateVar(sourceContext) && (sourceContext instanceof CanvasRenderingContext2D) &&
		(sourceContext.canvas.width > 0) && (sourceContext.canvas.height > 0) &&
		(returnValidNumOrZero(scaledSourceWidth) > 0) && (returnValidNumOrZero(scaledSourceHeight) > 0)) {
		
		// Pixel data - 4 bytes/pixel (RGBA)
		var constSourceImageDataPixelSize = 4;
		var constRedComponentOffset = 0;
		var constGreenComponentOffset = 1;
		var constBlueComponentOffset = 2;
		var constAlphaComponentOffset = 3;
		
		// Retrieve a "raw" RGBA image data buffer.
		var sourceImageData = sourceContext.getImageData(0, 0, sourceContext.canvas.width,
			sourceContext.canvas.height);
		
		// Determine the required margin size within the target buffer
		// required to compensate for aspect ratio differences between
		// the source and target image data representation buffers.
		var targetMarginSizeX = Math.round((this.targetWidth - scaledSourceWidth) / 2.0);
		var targetMarginSizeY = Math.round((this.targetHeight - scaledSourceHeight) / 2.0);
		
		for (var rowLoop = targetMarginSizeY; rowLoop < (this.targetHeight - targetMarginSizeY); rowLoop++) {
			for (var columnLoop = targetMarginSizeX; columnLoop < (this.targetWidth - targetMarginSizeX); columnLoop ++) {
				
				// Determine the source coordinates within the image buffer
				// (will be used to read the image data for the current pixel).
				var sourceX = Math.round((columnLoop - targetMarginSizeX) *
					(sourceContext.canvas.width / (this.targetWidth - (2 * targetMarginSizeX))));
				var sourceY = Math.round((rowLoop - targetMarginSizeY) *
					(sourceContext.canvas.height / (this.targetHeight - (2* targetMarginSizeY))));
				var sourcePositionInImageBuffer = ((sourceY * sourceImageData.width) + sourceX) * constSourceImageDataPixelSize;

				// Read the pixel data.
				var pixelColor = new rgbColor(0.0, 0.0, 0.0, 0.0);
				if (sourcePositionInImageBuffer < sourceImageData.data.length) {
					pixelColor.setRgbaValuesFromIntValues(
						sourceImageData.data[sourcePositionInImageBuffer + constRedComponentOffset],
						sourceImageData.data[sourcePositionInImageBuffer + constGreenComponentOffset],
						sourceImageData.data[sourcePositionInImageBuffer + constBlueComponentOffset],
						sourceImageData.data[sourcePositionInImageBuffer + constAlphaComponentOffset]
					);
				}
	
				var pixelRep = new rawImagePixelRep(pixelColor.getRedValue(), pixelColor.getGreenValue(),
					pixelColor.getBlueValue(), pixelColor.getAlphaValue());
					
				var targetImageDataOffset = ((rowLoop * this.targetWidth) + columnLoop);
				if (targetImageDataOffset < this.imageData.length) {
					this.imageData[targetImageDataOffset] = pixelRep;
				}
			}
		}
	}
}

/**
 * Retrieves the internally-stored image data as an HTML image data
 *  object
 * @return {ImageData} An HTML image data upon success, null otherwise
 */
rawImageDataRep.prototype.exportDataAsImageData = function() {
	var outputImageData = null;
	
	if ((this.targetWidth > 0) && (this.targetHeight > 0)) {
		// Create a canvas and a canvas context that will be used
		// to create the final ImageData object...
		var imageExportCanvas = document.createElement("canvas");
		imageExportCanvas.width = this.targetWidth;
		imageExportCanvas.height = this.targetHeight;
		
		var imageExportCanvasContext = imageExportCanvas.getContext("2d");
		
		// Pixel data - 4 bytes/pixel (RGBA)
		var constSourceImageDataPixelSize = 4;
		var constRedComponentOffset = 0;
		var constGreenComponentOffset = 1;
		var constBlueComponentOffset = 2;
		var constAlphaComponentOffset = 3;
		
		var outImageDataArrayLength = this.imageDataLength * this.bytesPerPixel;
		var outImageDataSourceArray = new Uint8ClampedArray(outImageDataArrayLength);
		
		// Write the internal image representation to the canvas.
		for (rowLoop = 0; rowLoop < imageExportCanvas.height; rowLoop++) {
			for (columnLoop = 0; columnLoop < imageExportCanvas.width; columnLoop++) {
				var currentSourcePixel = this.imageData[(rowLoop * this.targetWidth) + columnLoop];
				
				var currentPixelBaseOffset = ((this.targetWidth * rowLoop) + columnLoop) * this.bytesPerPixel;
				outImageDataSourceArray[currentPixelBaseOffset + constRedComponentOffset] = currentSourcePixel.getRgbColor().getRedIntValue();
				outImageDataSourceArray[currentPixelBaseOffset + constGreenComponentOffset] = currentSourcePixel.getRgbColor().getGreenIntValue();
				outImageDataSourceArray[currentPixelBaseOffset + constBlueComponentOffset] = currentSourcePixel.getRgbColor().getBlueIntValue();
				outImageDataSourceArray[currentPixelBaseOffset + constAlphaComponentOffset] = currentSourcePixel.getRgbColor().getAlphaIntValue();
			}
		}
		
		// Read the exported data from the canvas as an ImageData
		// object.
		outputImageData = new ImageData(outImageDataSourceArray, imageExportCanvas.width, imageExportCanvas.height);
	}
	
	return outputImageData;
}


