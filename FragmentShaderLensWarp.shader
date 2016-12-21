// FragmentShaderLensWarp.shader - Performs a convex lens-type distortion, with
//                                 simulated chromatic aberration increasingly
//                                 added as the distance from the texture
//                                 center increases
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
	const mediump float centerS = 0.5;
	const mediump float centerT = 0.5;
	
	// Maximum distance from the center
	// that will be encountered during
	// texture rendering.
	const mediump float maxDistanceFromCenter = sqrt(0.5);
	
	const mediump float warpExponent = 3.5;
	const mediump float warpMultiplier = 2.5;
	
	const mediump float maxOffsetS = 5.0;
	const mediump float maxOffsetT = 5.0;
	const mediump float offsetPeriodDivisor = 2000.0;
	const mediump float redAberrationFactor = 1.0;
	const mediump float greenAberrationFactor = 1.01;
	const mediump float blueAberrationFactor = 1.008;
	const mediump float aberrationDistanceExponent = 2.0;
	
	// The warp will be performed by decreasing the sampling
	// step as the rasterization approaches the center of the
	// source texture.
	mediump float distanceToCenter = distance(vec2(vTextureCoord.s, vTextureCoord.t), vec2(centerS, centerT));

	mediump float scaledCoordS = centerS + (((vTextureCoord.s - centerS) * pow(abs(distanceToCenter / maxDistanceFromCenter), warpExponent)) * warpMultiplier);
	mediump float scaledCoordT = centerT + (((vTextureCoord.t - centerT) * pow(abs(distanceToCenter / maxDistanceFromCenter), warpExponent)) * warpMultiplier);
	
	mediump float finalCoordS = scaledCoordS + (maxOffsetS * cos(currentTimeMs / offsetPeriodDivisor));
	mediump float finalCoordT = scaledCoordT + (maxOffsetS * cos(currentTimeMs / offsetPeriodDivisor));
	
	// Add chromatic aberration to the output image - offset the red, green, and
	// blue sampling by a small amount relative to each other. The offset increases
	// proportional to the distance from the texture center.
	mediump float redAberrationOffsetS = 0.0;
	mediump float redAberrationOffsetT = 0.0;
	mediump float greenAberrationOffsetS = ((greenAberrationFactor * finalCoordS) - finalCoordS) * pow(distanceToCenter, aberrationDistanceExponent);
	mediump float greenAberrationOffsetT = ((greenAberrationFactor * finalCoordT) - finalCoordT) * pow(distanceToCenter, aberrationDistanceExponent);
	mediump float blueAberrationOffsetT = ((blueAberrationFactor * finalCoordS) - finalCoordS) * pow(distanceToCenter, aberrationDistanceExponent);
	mediump float blueAberrationOffsetS = ((blueAberrationFactor * finalCoordT) - finalCoordT) * pow(distanceToCenter, aberrationDistanceExponent);
	
	// Combine the sampled colors to create the final fragment.
	mediump vec4 redSampleSource = texture2D(uSampler, vec2(finalCoordS + redAberrationOffsetS, finalCoordT + redAberrationOffsetT));
	mediump vec4 greenSampleSource = texture2D(uSampler, vec2(finalCoordS + greenAberrationOffsetS, finalCoordT + greenAberrationOffsetT));
	mediump vec4 blueSampleSource = texture2D(uSampler, vec2(finalCoordS + blueAberrationOffsetS, finalCoordT + blueAberrationOffsetT));
	mediump float sampleAlpha = max(max(redSampleSource.w, greenSampleSource.w), blueSampleSource.w);
	
	// Blend the output with the overlay texture.
	mediump vec4 baseColor = vec4(redSampleSource.x, greenSampleSource.y, blueSampleSource.z, sampleAlpha);
	mediump vec4 overlayColor = texture2D(uOverlaySampler, vec2(vTextureCoord.s, vTextureCoord.t));	
	mediump vec4 baseColorMultiplier = vec4(1.0, 1.0, 1.0, 1.0) - overlayColor.wwww;
	
	gl_FragColor = (baseColor * baseColorMultiplier) + (overlayColor * vec4(overlayColor.www, 1.0));
}
