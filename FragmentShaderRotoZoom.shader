// FragmentShaderRotoZoom.shader - Applies a rotation and a scaling effect to the
//                                 source texture
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
	
	// Minimum texture coordinate scale factor from
	// center (maximum zoom)
	const mediump float kMinScaleFactor = 5.0;
	// Maximum texture coordiante scale factor from
	// center (minimum zoom)
	const mediump float kMaxScaleFactor = 30.0;
	// Rotation rate divisor (high values produce slower
	// rotation)
	const mediump float kRotationRateDivisor = 45.0;
	// Scaling rate divisor (high values produce slower
	// scaling rates)
	const mediump float kScaleRateDivisor = 400.0;

	mediump float offsetS = vTextureCoord.s - centerS;
	mediump float offsetT = vTextureCoord.t - centerT;
	
	// Scale the current coordinate away from the center of the
	// texture, effectively zooming the image in or out.
	mediump float currentCoordScaleFactor = (kMaxScaleFactor - kMinScaleFactor) * ((sin(currentTimeMs / kScaleRateDivisor) + 1.0) / 2.0) + kMinScaleFactor;
	mediump float scaledCoordS = offsetS * currentCoordScaleFactor + centerS;
	mediump float scaledCoordT = offsetT * currentCoordScaleFactor + centerT;
	
	mediump float angleRadians = currentTimeMs / kRotationRateDivisor;
	
	// Rotate the current texture coordinate around the center of the
	// texture (ultimately producing a rotation of the entire texture).
	// Apply the following equation(s) in order to rotate the points
	// (referenced from "Gamedev Math Recipes: Rotating One Point Around
	// Another Point" -
	// http://www.gamefromscratch.com/post/2012/11/24/GameDev-math-recipes-Rotating-one-point-around-another-point.aspx):
	// Xrotated = (cos(angle) x (X - Xcenter)) - (sin(angle) x (Y - Ycenter) + Xcenter
	// Yrotated = (sin(angle) x (X - Xcenter)) - (cos(angle) x (Y - Ycenter) + Ycenter
	mediump float sRotated =
		cos(angleRadians) * (scaledCoordS - centerS) -
		sin(angleRadians) * (scaledCoordT - centerT) +
		centerS;
	mediump float tRotated = 
		sin(angleRadians) * (scaledCoordS - centerS) +
		cos(angleRadians) * (scaledCoordT - centerT) +
		centerS;
	
	// Blend the output with the overlay texture.
	mediump vec4 baseColor = texture2D(uSampler, vec2(sRotated, tRotated));
	mediump vec4 overlayColor = texture2D(uOverlaySampler, vec2(vTextureCoord.s, vTextureCoord.t));	
	mediump vec4 baseColorMultiplier = vec4(1.0, 1.0, 1.0, 1.0) - overlayColor.wwww;
	
	gl_FragColor = (baseColor * baseColorMultiplier) + (overlayColor * vec4(overlayColor.www, 1.0));
}