// ImageUtility.js - Classes and utility routines, purposed for the manipulation
//                   of images/image data, used within the "Happy Holidays 2016" demo
// Author: Ayodeji Oshinnaiye



/**
 * Scales an image such that it conforms to the size of the specified region, preserving
 *  the aspect ratio of the original image (margins are generated on the vertical or
 *  horizontal axis, as necessary)
 * @param sourceImage {Image} Source image to be scaled
 * @param newWidth {number} Target width for the scaled image
 * @param newHeight {number} Target height for the scaled image
 * @return {ImageData} An image data object, containing the scaled image data upon
 *                     success, null otherwise
 */
function scaleImageAsImageDataWithAspectRatioPreservation(sourceImage, newWidth, newHeight) {
	
	var scaledImageData = null;

	if (validateVar(newWidth) && validateVar(newHeight) && validateVar(sourceImage) &&
		(newWidth > 0) && (newHeight > 0) && (sourceImage instanceof Image)) {
	
		// A canvas (and its associated context) is required to access the
		// image pixel data.
		var imageAccessCanvas = document.createElement("canvas");
		imageAccessCanvas.width = sourceImage.width;
		imageAccessCanvas.height = sourceImage.height;

		// Draw the image into the canvas, and process the canvas...
		var imageAccessCanvasContext = imageAccessCanvas.getContext('2d');
		imageAccessCanvasContext.drawImage(sourceImage, 0, 0);
		scaledImageData = scaleCanvasAsImageDataWithAspectRatioPreservation(imageAccessCanvas,
			newWidth, newHeight);
	}
		
	return scaledImageData;
}

/**
 * Scales image data contained in a canvas, such that it conforms to the size of the
 *  specified region, preserving the aspect ratio of the original canvas (margins are
 *  generated on the vertical or horizontal axis, as necessary)
 * @param sourceCanvas {HTMLCanvasElement} Source canvas to be scaled
 * @param newWidth {number} Target width for the scaled canvas
 * @param newHeight {number} Target height for the scaled canvas
 * @return {ImageData} An image data object, containing the scaled image data upon
 *                     success, null otherwise
 */
function scaleCanvasAsImageDataWithAspectRatioPreservation(sourceCanvas, newWidth, newHeight) {
	
	var scaledImageData = null;
	
	if (validateVar(newWidth) && validateVar(newHeight) && validateVar(sourceCanvas) &&
		(newWidth > 0) && (newHeight > 0) && (sourceCanvas instanceof HTMLCanvasElement)) {
				
		var newImageAspectRatio = newWidth / newHeight;
		var imageAspectRatio = sourceCanvas.width / sourceCanvas.height;

		var scaledSourceWidth = 0;
		var scaledSourceHeight = 0;
		
		if (imageAspectRatio > newImageAspectRatio) {
			// ...If the aspect ratio of the source image is greater than that
			// specified for the scaled image, scale the source image using the
			// ratio of the target and source x axes (will
			// result in top/bottom margins).
			scaledSourceWidth = newWidth;
			scaledSourceHeight = (newWidth / sourceCanvas.width) * sourceCanvas.height;
		}
		else {
			// ...If the aspect ratio of the source image is less than (or, equal)
			// that specified for the scaled image, scale the
			// source image using the ratio of the target and source y axes (will
			// result in left/right margins).
			scaledSourceWidth = (newHeight / sourceCanvas.height) * sourceCanvas.width;
			scaledSourceHeight = newHeight;
		}
		
		var targetMarginSizeX = Math.round((newWidth - scaledSourceWidth) / 2.0);
		var targetMarginSizeY = Math.round((newHeight - scaledSourceHeight) / 2.0);
		
		var outputImageCanvas = document.createElement("canvas");
		outputImageCanvas.width = newWidth;
		outputImageCanvas.height = newHeight;

		// Draw the image into the canvas, scaling the image in the process...
		var outputImageCanvasContext = outputImageCanvas.getContext('2d');
		outputImageCanvasContext.drawImage(sourceCanvas, targetMarginSizeX, targetMarginSizeY,
			(newWidth - (2.0 * targetMarginSizeX)), (newHeight - (2.0 * targetMarginSizeY)));
			
		// Return the scaled image data.
		scaledImageData = outputImageCanvasContext.getImageData(0, 0, newWidth, newHeight)
	}
	
	return scaledImageData;
}
