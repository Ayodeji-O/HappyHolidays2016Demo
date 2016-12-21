

function mainImageTransformationScene() {
	
}


/**
 * Standard scene method - performs a one-time initialization of
 *  scene resources
 */
mainImageTransformationScene.prototype.initialize = function() {
	
	this.totalElapsedSceneTimeMs = 0.0;
	this.currentSceneRunningTimeMs = 0.0;
	this.currentShaderProgramIndex = 0;
	this.currentShaderProgram = null;
	
	// Random offset added to the scene time for the current shader
	// in order to slight randomness.
	this.sceneTimeBaseValueForShaderProgram;
	
	// Maximum duration for each scene.
	this.constMaxSceneRunningTimeMs = 7000.0;
	
	// Maximum random factor to add to scene time
	// when time is provided to shader (provides a slight
	// bit of random behavior to the shader, as the shaders
	// are parameterized function of the current scene time.
	this.maxRandomSceneTimeOffset = 1000.0;
	
	// Display update interval at which the scroller will be
	// updated
	this.constTextScrollerUpdateInterval = 2;
	
	// Current scroller update interval count
	this.textScrollerIntervalCount = 0;
	
	this.currentTextureIndex = 0;
	this.currentTexture = null;
	
	this.firstIterationExecuted = false;
	
	// Quad vertices - configured for drawing as triangle strips.
	this.imageQuadVertices =
	[
		// Upper left
		-1.0, 1.0, 0.0,
		// Lower left
		-1.0, -1.0, 0.0,
		// Upper right
		1.0, 1.0, 0.0,
		// Lower right
		1.0, -1.0, 0.0
	];
	
	// Texture coordinates for each quad vertex
	this.imageVertexTextureCoordinates =
	[
		// Upper left
		0.0, 0.0,
		// Lower left
		0.0, 1.0,
		// Upper right
		1.0, 0.0,
		// Lower right
		1.0, 1.0
	];
	
	this.vertexSize = 3;
	this.textureCoordinateSize = 2;
	this.imageQuadVertexCount = 4;
	
	this.imageQuadVertexBuffer = null;
	this.imageVertexTextureCoordinateBuffer = null;

	var webGlCanvasContext = globalResources.getMainCanvasContext();
	webGlCanvasContext.clearColor(0, 0, 0, 0);
	
	// Create the WebGL buffer for the image display geometry
	// (vertices).
	this.imageQuadVertexBuffer = webGlCanvasContext.createBuffer();
	webGlCanvasContext.bindBuffer(webGlCanvasContext.ARRAY_BUFFER, this.imageQuadVertexBuffer);
	webGlCanvasContext.bufferData(webGlCanvasContext.ARRAY_BUFFER, new Float32Array(this.imageQuadVertices), webGlCanvasContext.STATIC_DRAW);
	
	// Create the WebGL buffer for the per-vertex texture
	// coordinates.
	this.imageVertexTextureCoordinateBuffer = webGlCanvasContext.createBuffer();
	webGlCanvasContext.bindBuffer(webGlCanvasContext.ARRAY_BUFFER, this.imageVertexTextureCoordinateBuffer);
	webGlCanvasContext.bufferData(webGlCanvasContext.ARRAY_BUFFER, new Float32Array(this.imageVertexTextureCoordinates), webGlCanvasContext.STATIC_DRAW);
	
	// Background color for the scroller section.
	this.scrollerBackgroundColor = new rgbColor(
		Constants.scrollerBackgroundUnitIntensity,
		Constants.scrollerBackgroundUnitIntensity,
		Constants.scrollerBackgroundUnitIntensity,		
		Constants.scrollerBackgroundUnitAlpha);
		
	// Position at which the scroller should be displayed.
	this.constScrollerOffsetFromBottom = 100;
	this.scrollerCoordX = 0;
	this.scrollerCoordY = Constants.overlayTextureHeight - this.constScrollerOffsetFromBottom;
	
	// Initialize the message scroller instance
	this.messageScroller = new textScroller(Constants.scrollerFontSizePx, Constants.scrollerFont, Constants.scrollerFontStyle);
	this.messageScroller.setSourceString(Constants.messageText);
	
	// Scroller states - lead-in in is the delay before any of the scroller is displayed,
	// fade in is the period where the background fades-in in, and the text display
	// phase indicates the phase where the scroller is actually operating.
	this.constScrollerStateLeadIn = 0;
	this.constScrollerStateFadeIn = 1;
	this.constScrollerStateDisplayText = 2;
	
	// Stores the current scroller state
	this.currentScrollerState = this.constScrollerStateLeadIn;
	
	// Tracks the time in the present scroller state.
	this.currentScrollerStateTime = 0;
	
	// Scroller lead-in time (milliseconds)
	this.constScrollerStateLeadInTime = 4000;
	
	// Scroller fade-in time (milliseconds)
	this.constScrollerStateFadeInTime = 3000;
}

/**
 * Applies logic used to maintain factors that govern the data being
 *  displayed/rendered for the current scene
 * @param timeQuantum Time delta with respect to the previously-executed
 *                    animation step (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context associated with the
 *                                                      data being rendered
 */
mainImageTransformationScene.prototype.updateScenePropertiesAsNecessary = function(timeQuantum, targetCanvasContext) {
	// Determine if the current image/transformation should be switched.
	if ((this.currentSceneRunningTimeMs > this.constMaxSceneRunningTimeMs) || !this.firstIterationExecuted) {
		this.currentSceneRunningTimeMs = 0.0;
		this.sceneTimeBaseValueForShaderProgram = (this.maxRandomSceneTimeOffset * Math.random());
		
		// Select a random shader program and texture.
		this.currentShaderProgramIndex = Math.round(Math.random() * (globalResources.getShaderProgramCount() - 1.0));
		this.currentTextureIndex = Math.round(Math.random() * (globalResources.getTextureCount() - 1.0));
		
		this.useIndexedShader(this.currentShaderProgramIndex, targetCanvasContext);
		this.useIndexedTexture(this.currentTextureIndex, targetCanvasContext);
	}
	
	this.textScrollerIntervalCount++;
	if (this.textScrollerIntervalCount > this.constTextScrollerUpdateInterval) {
		this.textScrollerIntervalCount = 0;
	}
}

/**
 * Applies a globally-stored shader program, based on an index within the
 *  global shader program store, as the currently-active shader
 * @param textureIndex {number} An index used to reference a shader program
 *                              within the global shader program store
 * @param targetCanvasContext {WebGLRenderingContext2D} Context associated with the
 *                                                      data being rendered
 */
mainImageTransformationScene.prototype.useIndexedShader = function(shaderIndex, targetCanvasContext) {
	if (shaderIndex < globalResources.getShaderProgramCount()) {
		var targetCanvasContext = globalResources.getMainCanvasContext();		
		if (targetCanvasContext != null) {
			var newShaderProgram = globalResources.getIndexedShaderProgram(shaderIndex);
			if (newShaderProgram != null) {
				// Activate the shader program...
				targetCanvasContext.useProgram(newShaderProgram);
				
				var vertexPositionAttribute = targetCanvasContext.getAttribLocation(newShaderProgram, "aVertexPosition");
				targetCanvasContext.enableVertexAttribArray(vertexPositionAttribute);
				
				var textureCoordinateAttribute = targetCanvasContext.getAttribLocation(newShaderProgram, "aTextureCoord");
				targetCanvasContext.enableVertexAttribArray(textureCoordinateAttribute);
				
				// Store the shader program for future access (shader
				// program parameters may need to be accessed during
				// rendering).
				this.currentShaderProgram = newShaderProgram;
				this.currentShaderProgramIndex = shaderIndex;
			}
		}
	}
}

/**
 * Applies a globally-stored texture, based on an index within the
 *  global texture store, as the currently-active texture
 * @param textureIndex {number} An index used to reference a texture
 *                              within the global texture store
 * @param targetCanvasContext {WebGLRenderingContext2D} Context associated with the
 *                                                      data being rendered
 */
mainImageTransformationScene.prototype.useIndexedTexture = function(textureIndex, targetCanvasContext) {
	if (textureIndex < globalResources.getTextureCount()) {
		var targetCanvasContext = globalResources.getMainCanvasContext();
		if (targetCanvasContext != null) {
			var newTexture = globalResources.getIndexedTexture(textureIndex);
			if (newTexture != null) {
				// Enable the texure as the currently-active
				// [level 0] texture.
				targetCanvasContext.activeTexture(targetCanvasContext.TEXTURE0);				
				targetCanvasContext.bindTexture(targetCanvasContext.TEXTURE_2D, newTexture);
				
				this.currentTextureIndex = textureIndex;
				this.currentTexture = newTexture;
			}
		}
	}
}

/**
 * Renders the primary, texture-based portion of the scene
 * @param timeQuantum Time delta with respect to the previously-executed
 *                    animation step (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be drawn
 */
mainImageTransformationScene.prototype.renderScene = function(timeQuantum, targetCanvasContext) {
	targetCanvasContext.clear(targetCanvasContext.COLOR_BUFFER_BIT);

	// Set the active vertex buffer...
	targetCanvasContext.bindBuffer(targetCanvasContext.ARRAY_BUFFER, this.imageQuadVertexBuffer);
	var vertexPositionAttribute = targetCanvasContext.getAttribLocation(this.currentShaderProgram, "aVertexPosition");
	targetCanvasContext.vertexAttribPointer(vertexPositionAttribute, this.vertexSize, targetCanvasContext.FLOAT, false, 0, 0);

	// Set the active texture coordinate buffer...
	targetCanvasContext.bindBuffer(targetCanvasContext.ARRAY_BUFFER, this.imageVertexTextureCoordinateBuffer);
	var textureCoordinateAttribute = targetCanvasContext.getAttribLocation(this.currentShaderProgram, "aTextureCoord");
	targetCanvasContext.vertexAttribPointer(textureCoordinateAttribute, this.textureCoordinateSize, targetCanvasContext.FLOAT, false, 0, 0);
	
	// Set the active texture...
	targetCanvasContext.activeTexture(targetCanvasContext.TEXTURE0);
	targetCanvasContext.bindTexture(targetCanvasContext.TEXTURE_2D, this.currentTexture);
	targetCanvasContext.uniform1i(targetCanvasContext.getUniformLocation(this.currentShaderProgram, "uSampler"), 0);
	
	// Set the active overlay [level 1] texture.
	var overlayTexture = globalResources.getOverlayTexture();
	if (overlayTexture != null) {
		targetCanvasContext.activeTexture(targetCanvasContext.TEXTURE1);
		targetCanvasContext.bindTexture(targetCanvasContext.TEXTURE_2D, overlayTexture);
		targetCanvasContext.uniform1i(targetCanvasContext.getUniformLocation(this.currentShaderProgram, "uOverlaySampler"), 1);
	}
	
	// Update the time quantum value within the shader program.
	targetCanvasContext.uniform1f(targetCanvasContext.getUniformLocation(this.currentShaderProgram, "currentTimeMs"),
		(this.sceneTimeBaseValueForShaderProgram + this.currentSceneRunningTimeMs));

	// ...Render the quad containing the scene texture.
	targetCanvasContext.drawArrays(targetCanvasContext.TRIANGLE_STRIP, 0, this.imageQuadVertexCount);
}

/**
 * Updates the display state of the scroller, depending upon the
 *  amount of total time that has elapsed in the scene execution
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 */
mainImageTransformationScene.prototype.updateScrollerState = function(timeQuantum) {
	this.currentScrollerStateTime += timeQuantum;

	if ((this.currentScrollerState === this.constScrollerStateLeadIn) &&
		(this.currentScrollerStateTime >= this.constScrollerStateLeadInTime)) {
		
		// Lead-in time has been completed - advance the scroller to the
		// fade-in phase.
		this.currentScrollerState = this.constScrollerStateFadeIn;
		this.currentScrollerStateTime = 0;
	}
	else if ((this.currentScrollerState === this.constScrollerStateFadeIn) &&
		(this.currentScrollerStateTime >= this.constScrollerStateFadeInTime)) {
	
		// The scroller fade-in phase has been completed - display the scroller
		// text.
		this.currentScrollerState = this.constScrollerStateDisplayText;
		this.currentScrollerStateTime = 0;	
	}
}

/**
 * Renders the text scroller output to a specified canvas context
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {CanvasRenderingContext2D} The output canvas context
 *                                                       to which the text scroller
 *                                                       will be rendered
 * @param webGlCanvasContext {WebGLRenderingContext2D} A WebGL rendering context used for
 *                                                     writing the final output into a texture
 */
mainImageTransformationScene.prototype.renderScrollerSection = function(timeQuantum, targetCanvasContext,
																		webGlCanvasContext) {
				
	// Determine whether not to draw/update the scroller, based upon the current update interval
	// count.
	var drawScroller = (this.textScrollerIntervalCount >= this.constTextScrollerUpdateInterval);
	if (validateVar(targetCanvasContext) && (this.currentScrollerState !== this.constScrollerStateLeadIn) &&
		drawScroller) {
			
		// Erase any existing scroller text...
		targetCanvasContext.clearRect(this.scrollerCoordX, this.scrollerCoordY,
			targetCanvasContext.canvas.width, this.messageScroller.getTextAreaHeight());
	
		// Draw a background strip in order to enhance scroller readability.
		targetCanvasContext.save();
		targetCanvasContext.fillStyle = this.scrollerBackgroundColor.getRgbaIntValueAsStandardString();
		
		// Set the alpha for the scroller background (the alpha is variable as the scroller background
		// fades-in).
		targetCanvasContext.globalAlpha = (this.currentScrollerState === this.constScrollerStateFadeIn) ?
			Constants.scrollerBackgroundUnitAlpha * (this.currentScrollerStateTime / this.constScrollerStateFadeInTime) :
			Constants.scrollerBackgroundUnitAlpha;
		targetCanvasContext.fillRect(this.scrollerCoordX, this.scrollerCoordY,
			targetCanvasContext.canvas.width, this.messageScroller.getTextAreaHeight());
			
		targetCanvasContext.restore();
		
		// Display the scroller text.
		if (this.currentScrollerState === this.constScrollerStateDisplayText) {
			this.messageScroller.renderScroller(targetCanvasContext, this.scrollerCoordX, this.scrollerCoordY);
			this.messageScroller.advanceScroller();
		}
	}
	
	// Write the canvas data into a texture.
	var overlayTexture = globalResources.getOverlayTexture();
	if ((overlayTexture != null) && drawScroller){
		updateDynamicTextureWithCanvas(webGlCanvasContext, overlayTexture, targetCanvasContext.canvas);
	}
	
	this.updateScrollerState(timeQuantum);
}

/**
 * Executes a time-parameterized single scene animation step
 * @param timeQuantum Time delta with respect to the previously-executed
 *                    animation step (milliseconds)
 * @param targetCanvasContext {CanvasRenderingContext2D} Context onto which
 *                            the scene data will be drawn
 * @param overlayCanvasContext {CanvasRenderingContext2D} Context onto which
 *                             data to be superimposed on the scene will be
 *                             drawn
 */
mainImageTransformationScene.prototype.executeStep = function(timeQuantum, targetCanvasContext, overlayCanvasContext) {
	this.updateScenePropertiesAsNecessary(timeQuantum, targetCanvasContext);
	this.renderScrollerSection(timeQuantum, overlayCanvasContext, targetCanvasContext);
	this.renderScene(timeQuantum, targetCanvasContext);
	
	this.firstIterationExecuted = true;
	
	this.totalElapsedSceneTimeMs += timeQuantum;
	this.currentSceneRunningTimeMs += timeQuantum;
}
