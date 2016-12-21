// Katie-Ayo_HappyHolidays2016Main.js - Happy Holidays 2016 demo entry point
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js
//  -InternalConstants.js
//  -WebGlUtility.js
//  -RawImageDataRep.js


/**
 * Completion function to be used with
 *  globalResources.setProgressFunction() - updates/draws
 *  a progress bar to be used during loading of image
 *  resources
 * @param progressFraction {number} Progress completion fraction
 *                                  (0.0 - 1.0, inclusive)
 * @param pgoressElement {HTMLElement} Progress element to be
 *                                     updated
 * @see globalResources.setProgressFunction
 */
function updateProgressElement(progressFraction, progressElement) {
	if ((progressFraction >= 0.0) && (progressFraction <= 1.0))
	{
		while (progressElement.firstChild !== null) {
			progressElement.removeChild(progressElement.firstChild);
		}
		
		var innerProgressElements = buildInnerProgressElementsWithProgresFraction(progressElement,
			progressFraction, Constants.progressElementWidth);
	}
}

/**
 * Initializes any required DOM resources
 *  (creates objects, etc.)
 * @param completionFunction {function} Function to be invoked after the
 *                                      DOM resource initialization has
 *                                      been completed.
 */
function initDomResources(completionFunction) {
	// Create the main canvas on which output
	// will be displayed..
	mainDiv = document.createElement("div");
	
	// Center the div within the window (the height centering will
	// not be retained if the window size has been altered).
	mainDiv.setAttribute("style", "text-align:center; margin-top: " +
		Math.round((window.innerHeight - Constants.defaultCanvasHeight) / 2.0) + "px");
		
	// Add the DIV to the DOM.
	document.body.appendChild(mainDiv);		
	var mainCanvas = document.createElement("canvas");
	var overlayCanvas = document.createElement("canvas");
	
    if (validateVar(mainCanvas) && validateVar(overlayCanvas) &&
		(typeof mainCanvas.getContext === 'function')) {
		mainCanvas.width = Constants.defaultCanvasWidth;
		mainCanvas.height = Constants.defaultCanvasHeight;
		
		overlayCanvas.width = Constants.overlayTextureWidth;
		overlayCanvas.height = Constants.overlayTextureHeight;
	
        // Store the WeblGL context that will be used
        // to write data to the canvas.
        var mainCanvasContext = getWebGlContextFromCanvas(mainCanvas);
		var overlayCanvasContext = overlayCanvas.getContext("2d");
    
		if (validateVar(mainCanvasContext) && validateVar(overlayCanvasContext)) {
			// Prepare the WebGL context for use.
			initializeWebGl(mainCanvasContext);
			
			// Add the canvas object DOM (within the DIV).
			mainDiv.appendChild(mainCanvas);
			
			// Create an overlay texture - this texture will be used primarily
			// to display the scroller text using multitexturing.
			var overlayTexture = createTextureFromCanvas(mainCanvasContext, overlayCanvas, false);
			if (validateVar(overlayTexture)) {
				globalResources.setOverlayTexture(overlayTexture);
			}
						
			globalResources.setMainCanvasContext(mainCanvasContext);
			globalResources.setOverlayCanvasContext(overlayCanvasContext);
		}
	}
	
	function singleImageLoadCompletionFunction(sourceImage) {
		if (validateVar(sourceImage)) {
			// Convert the loaded image to an ImageData object of a 
			// pre-determined size.
			var exportedImageData = scaleImageAsImageDataWithAspectRatioPreservation(sourceImage,
				Constants.internalBitmapWidth, Constants.internalBitmapHeight);
			if (exportedImageData != null) {
				var imageTexture = createTextureFromImageData(globalResources.getMainCanvasContext(),
					exportedImageData);
				if (imageTexture != null) {
					globalResources.textureCollection.push(imageTexture);
				}
			}
		}
	}

	// Initialize DOM resources - upon completion of the
	// resource initialization, execute the provided
	// completion function.
	var progressElement = setupProgressBar(mainDiv);
	function updateProgress(progressFraction) {
		updateProgressElement(progressFraction, progressElement)
	}
	
	function loadCompletionFunction() {
		removeDomObject(progressElement);
		completionFunction();
	}
	
	globalResources.setProgressFunction(updateProgress);
	globalResources.initialize(singleImageLoadCompletionFunction, loadCompletionFunction);	
}

/**
 * Creates a progress bar, and inserts the progress
 *  bar into the DOM
 * @param parentElement {HTMLElement} The element that will serve
 *                                    as the parent container for the
 *                                    progress bar
 */
setupProgressBar = function(parentElement) {
	var progressElement = null;
	var constProgressElementHeight = 40;
	var outerRectMargin = 1;
	
	if (validateVar(parentElement) && (parentElement instanceof HTMLElement)) {
		progressElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		progressElement.setAttribute("width", Constants.progressElementWidth);
		var absoluteVertCenteredHorizStyle = "position: absolute; top: 70%; left: 50%; transform: translateX(-50%)"
		progressElement.style = absoluteVertCenteredHorizStyle
		var innerProgressElements = buildInnerProgressElementsWithProgresFraction(
			progressElement, 0.0, Constants.progressElementWidth);
		parentElement.appendChild(progressElement);
	}
	
	return progressElement
}

/**
 * Creates the inner constituent elements of a progress
 *  indicator, and inserts the elements into a DOM
 *  sub-tree using a specified parent element
 * @param progressParentElement The element that will ultimately
 *                              be used to contain the created
 *                              progress element
 * @param progressFraction A fraction indicating the progress of
 *                         a particular operation (0.0 - 1.0, inclusive)
 * @param elementWidth The desired width of the progress element to be
 *                     added
 * @return The created inner progress element upon success, null otherwise
 */
buildInnerProgressElementsWithProgresFraction = function(progressParentElement, progressFraction, elementWidth) {
	var innerProgressElements = null;
	
	var progressElement = null;
	var constProgressElementHeight = 40;
	var outerRectMargin = 2;
	
	if (validateVar(progressParentElement) && validateVar(progressFraction) && (typeof progressFraction == "number")) {
		var svgOuterRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		var svgInnerRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		progressParentElement.appendChild(svgOuterRect);
		progressParentElement.appendChild(svgInnerRect);
		var outerRectWidth = elementWidth;		
		var innerRectMaxWidth = outerRectWidth -(2 * outerRectMargin);
		var innerRectHeight = constProgressElementHeight - (2 * outerRectMargin);
		svgOuterRect.setAttribute("width", outerRectWidth);
		svgOuterRect.setAttribute("height", constProgressElementHeight);
		svgOuterRect.setAttribute("x", 0);
		svgOuterRect.setAttribute("y", 0);
		svgOuterRect.style = "fill: #606060";
		
		svgInnerRect.setAttribute("width", innerRectMaxWidth * progressFraction);
		svgInnerRect.setAttribute("height", innerRectHeight);
		svgInnerRect.setAttribute("x", outerRectMargin);
		svgInnerRect.setAttribute("y", outerRectMargin);
		svgInnerRect.style = "fill: #8f8f8f";
		innerProgressElements = svgOuterRect;
	}
	
	return innerProgressElements;
}

/**
 * Removes an object from the DOM
 * @param targetDomObject {Element} The object to be removed from the DOM
 */
removeDomObject = function(targetDomObject) {
	if (validateVar(targetDomObject) && (targetDomObject instanceof Element) &&
		validateVar(targetDomObject.parentElement) ) {	
		
		var elementParent = targetDomObject.parentElement;
		elementParent.removeChild(targetDomObject);
	}
}

/**
 * Completion function to be used with globalResources.initialize() -
 *  performs any final activities related to loading, and executes
 *  the main scene immediately after all image data has been loaded
 * @see globalResources.initialize
 */
finalizeLoading = function() {
	// The progress bar should not be visible after all image loading
	executeMainScene();
}

/**
 * Performs execution of the main demo scene
 */
executeMainScene = function() {
	// Create the main image transformation scene, and ultimately
	// invoke the start of the demo.
	var imageTransformationScene = new mainImageTransformationScene();
	sceneExecution(imageTransformationScene);
}

/**
 * Main routine - function that is
 *  executed when page loading has
 *  completed
 */
onLoadHandler = function() {
	// Initalize the DOM resources, immediately
	// executing the demo after completion of
	// initialization.
	initDomResources(finalizeLoading);
}