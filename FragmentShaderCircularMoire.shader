// FragmentShaderLensWarp.shader - Performs a moiré effect using two sets of
//                                 concentric circles, offset from each other,
//                                 as the sampling source
// Author: Ayodeji Oshinnaiye

varying mediump vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform sampler2D uOverlaySampler;

// Time value - the ultimate sampling
// result is a time-parameterized function
uniform mediump float currentTimeMs;
void main() {

	// Coordinates that represent the center
	// of the texture.
	const mediump float kCenterS = 0.5;
	const mediump float kCenterT = 0.5;
	
	const mediump float kEvenValidationDivisor = 2.0;

	const mediump float kRoundingOffset = 0.5;
	
	// Texture fraction increment that defines the width
	// of the moire pattern rings.
	const mediump float kMoireInterval = 0.002;
	
	// Incresing this value decreases the rate of the moire pattern
	// displacement for the first and second overlays, respectively.
	const mediump float kFirstCenterMovementPeriodDivisor = 373.0;
	const mediump float kSecondCenterMovementPeriodDivisor = 1229.0;
	
	// Decreases rate of scaling with increasing values.
	const mediump float kFirstSampleScalingPeriodDivisor = 700.0;
	
	// Increases maximum outward zoom for first image overlay with increasing values.
	const mediump float kFirstSampleZoomModifier = 5.0;
	// Decreases scroll rate for second image overlay with increasing values.
	const mediump float kSecondSampleScrollRateDivisor = 650.0;
	
	// Maximum offset from the center of the image for the first
	// and second moire patterns, respectively.
	const mediump float kFirstCenterOffsetAmplitude = 0.30;
	const mediump float kSecondCenterOffsetAmplitude = 0.13;
	
	// Compute a scaling factor for the first sample, based on time, that will
	// result in a periodic zooming effect. Also, compute an offset such that
	// the zooming will be focued at the center of the texture. This sampling
	// will be applied to the first moire pattern/
	mediump float currentSampleSourceScaling = pow(cos(currentTimeMs / kFirstSampleScalingPeriodDivisor), 2.0) * kFirstSampleZoomModifier;
	mediump float firstSampleSourceS = vTextureCoord.s * currentSampleSourceScaling -
		(kCenterS + kCenterS * currentSampleSourceScaling);
	mediump float firstSampleSourceT = vTextureCoord.t * currentSampleSourceScaling -
		(kCenterT + kCenterT * currentSampleSourceScaling);
		
	// Scroll the samples for the second moire pattern.
	mediump float secondSampleSourceS = vTextureCoord.s + (currentTimeMs / kSecondSampleScrollRateDivisor);
	mediump float secondSampleSourceT = vTextureCoord.t + (currentTimeMs / kSecondSampleScrollRateDivisor);
	
	// Compute the current time-based center positions for the first and second
	// moire patterns...
	mediump float firstMoireCenterS = kCenterS + (kFirstCenterOffsetAmplitude * cos(currentTimeMs / kFirstCenterMovementPeriodDivisor));
	mediump float firstMoireCenterT = kCenterT + (kFirstCenterOffsetAmplitude * sin(currentTimeMs / kSecondCenterMovementPeriodDivisor));
	
	mediump float secondMoireCenterS = kCenterS + kSecondCenterOffsetAmplitude * -cos(currentTimeMs / kSecondCenterMovementPeriodDivisor);
	mediump float secondMoireCenterT = kCenterT + kSecondCenterOffsetAmplitude * sin(currentTimeMs / kSecondCenterMovementPeriodDivisor);

	// Determine which moire pattern to draw (this determination will
	// occur based on whether or not the distance from the center of the
	// texture is odd or even).
	mediump float distanceToFirstCenter = distance(vec2(vTextureCoord.s, vTextureCoord.t), vec2(firstMoireCenterS, firstMoireCenterT));
	mediump float distanceToSecondCenter = distance(vec2(vTextureCoord.s, vTextureCoord.t), vec2(secondMoireCenterS, secondMoireCenterT));
	
	mediump float firstDistanceDivisionResultRounded = floor((distanceToFirstCenter / kMoireInterval) + kRoundingOffset);
	mediump float secondDistanceDivisionResultRounded = floor((distanceToSecondCenter / kMoireInterval) + kRoundingOffset);
	
	// Determine if a ring should be drawn for the current pixel in each of the moire
	// patterns. A ring should be drawn at every-other moire distance interval for
	// each moire pattern.
	bool firstDistanceIsOdd = ((ceil(firstDistanceDivisionResultRounded / kEvenValidationDivisor) - (firstDistanceDivisionResultRounded / kEvenValidationDivisor)) > 0.0);
	bool secondDistanceIsOdd = ((ceil(secondDistanceDivisionResultRounded / kEvenValidationDivisor) - (secondDistanceDivisionResultRounded / kEvenValidationDivisor)) > 0.0);
	
	mediump vec4 baseColor = vec4(0.0, 0.0, 0.0, 0.0);
	if (firstDistanceIsOdd && !secondDistanceIsOdd)
	{
		// ...If sections of both moire patterns overlap, average the sample, and invert
		// the colors.
		mediump vec4 firstSample = texture2D(uSampler, vec2(firstSampleSourceS, firstSampleSourceT));
		mediump vec4 secondSample = texture2D(uSampler, vec2(secondSampleSourceS, secondSampleSourceT));
		mediump vec4 averagedSample = (firstSample + secondSample) / 2.0;
		baseColor = vec4((1.0 - averagedSample.x), (1.0 - averagedSample.y), (1.0 - averagedSample.z), averagedSample.w);
	}
	else if (firstDistanceIsOdd)
	{
		// Draw rings at odd intervals for the first moire pattern...
		baseColor = texture2D(uSampler, vec2(firstSampleSourceS, firstSampleSourceT));
	}
	else if (!secondDistanceIsOdd)
	{
		// Draw rings at even intervals for the second moire pattern.
		baseColor = texture2D(uSampler, vec2(secondSampleSourceS, secondSampleSourceT));
	}
	
	// Blend the output with the overlay texture.
	mediump vec4 overlayColor = texture2D(uOverlaySampler, vec2(vTextureCoord.s, vTextureCoord.t));	
	mediump vec4 baseColorMultiplier = vec4(1.0, 1.0, 1.0, 1.0) - overlayColor.wwww;
	
	gl_FragColor = (baseColor * baseColorMultiplier) + (overlayColor * vec4(overlayColor.www, 1.0));
}