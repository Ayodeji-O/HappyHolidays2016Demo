// FragmentPlasmaWarp.shader - Implementation of a plasma-type effect, using
//                             the result of the plasma effect to alter texture
//                             look-up coordinates
// Author: Ayodeji Oshinnaiye

varying mediump vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform sampler2D uOverlaySampler;

// Time value - the ultimate sampling
// result is a time-parameterized function
uniform mediump float currentTimeMs;
void main() {


	mediump float horizontalCosAngleMultiplier = 10.0;
	mediump float verticalSinAngleMultiplier = 10.0;
	mediump float horizontalOffsetDivisor = 5.0;
	mediump float verticalOffsetDivisor = 5.0;
	
	mediump float scrollOffsetTimeDivisorS = 500.0;
	mediump float scrollOffsetTimeDivisorT = 750.0;
	
	// Time divisors that alter the period of the horizontal
	// and vertical sampling modifier functions, respectively
	// (prime numbers are used to produce periods that are
	// unlikely to have common factors, although these numbers
	// are not the only values that determine the period).
	const mediump float timeDivisorS = 2267.0;
	const mediump float timeDivisorT = 3469.0;
	mediump float periodMultiplierS = 4.0 * sin(currentTimeMs / timeDivisorS) + 1.0;
	mediump float periodMultiplierT = 4.0 * sin(currentTimeMs / timeDivisorT) + 3.0;
	
	// Produce a horizontal offset that is a function of the original
	// vertical offset.
	mediump float horizontalOffsetS = (cos(vTextureCoord.t * horizontalCosAngleMultiplier * periodMultiplierS) /
		horizontalOffsetDivisor) + (currentTimeMs / scrollOffsetTimeDivisorS);
	
	// Produce a vertical offset that is a function of the original horizontal
	// offset.
	mediump float verticalOffsetT = (sin(vTextureCoord.s * verticalSinAngleMultiplier * periodMultiplierT) /
		verticalOffsetDivisor) + (currentTimeMs / scrollOffsetTimeDivisorT);

	// Blend the output with the overlay texture.
	mediump vec4 baseColor = texture2D(uSampler, vec2((vTextureCoord.s + horizontalOffsetS), (vTextureCoord.t + verticalOffsetT)));
	mediump vec4 overlayColor = texture2D(uOverlaySampler, vec2(vTextureCoord.s, vTextureCoord.t));
	mediump vec4 baseColorMultiplier = vec4(1.0, 1.0, 1.0, 1.0) - overlayColor.wwww;
	
	gl_FragColor = (baseColor * baseColorMultiplier) + (overlayColor * vec4(overlayColor.www, 1.0));
}