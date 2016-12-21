// FragmentShaderTunnel.shader - Simple "tunnel" texture transformation,
//                               with alpha-blending applied inversely proportional
//                               to the distance from the texture center in order
//                               to emulate light-fall off in a rudimentary fashion
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
	
	// Zoom per unit time factor (higher values produce
	// slower zooming)
	const mediump float kTimeZoomDivisor = 600.0;
	
	const mediump float kPi = acos(-1.0);
	
	mediump float zoomOffset = currentTimeMs / kTimeZoomDivisor;
	
	mediump float distanceToCenter = distance(vec2(vTextureCoord.s, vTextureCoord.t), vec2(centerS, centerT));
	
	// Exponent used to produce a perspective effect on the texture
	// (lower values produce a more pronounced perspective effect).
	const mediump float perspectiveExponent = 0.05;
	
	// Coefficient used to produce a perspective effect on the texture
	// (lower values produce a more pronounced effect).
	const mediump float perspectiveCoefficient = 5.0;
	
	// Exponent used to simulate light fall-off based on distance
	// (higher values produce a more pronounced effect).
	const mediump float distanceDimmingExponent = 0.2;

	// Reference vector used for computing angular orientations
	// to a vector comprised of the texture center point and the
	// currently-sampled fragment.
	const mediump vec2 kReferenceAngleVector = vec2(0.0, 1.0);
	
	// Compute the angle between the current sampling vector (from the
	// center of the texture to the current sample) and the reference
	// vector.
	mediump vec2 currentCenterToSampleVector = vec2(vTextureCoord.s - centerS, vTextureCoord.t - centerT);
	mediump float referenceSampleDotProduct = dot(kReferenceAngleVector, currentCenterToSampleVector);
	mediump float angleCosine = referenceSampleDotProduct / (length(currentCenterToSampleVector) * length(kReferenceAngleVector));
	mediump float angleFromReferenceVector = acos(angleCosine);
	
	// ...Use the angle to determine the horizontal position along
	// the current texture row.
	mediump float sCoordFromAngle = (angleFromReferenceVector - -kPi) / (2.0 * kPi);

	// Use the distance from the center to determine the row.
	mediump float tCoordFromDistance = perspectiveCoefficient * pow(distanceToCenter, perspectiveExponent);

	mediump vec4 sourceColor = texture2D(uSampler, vec2(sCoordFromAngle, tCoordFromDistance - zoomOffset));
	
	// Apply the distance fall-off simulation using the alpha component.
	mediump float finalRedColor = sourceColor.x;
	mediump float finalGreenColor = sourceColor.y;
	mediump float finalBlueColor = sourceColor.z;
	
	// Blend the output with the overlay texture.
	mediump vec4 baseColor = vec4(finalRedColor, finalGreenColor, finalBlueColor, sourceColor.w * pow(distanceToCenter, distanceDimmingExponent));
	mediump vec4 overlayColor = texture2D(uOverlaySampler, vec2(vTextureCoord.s, vTextureCoord.t));	
	mediump vec4 baseColorMultiplier = vec4(1.0, 1.0, 1.0, 1.0) - overlayColor.wwww;
	
	gl_FragColor = (baseColor * baseColorMultiplier) + (overlayColor * vec4(overlayColor.www, 1.0));
}