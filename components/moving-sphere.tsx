import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const perlin4dGlsl = `
//  Classic Perlin 4D Noise 
//  by Stefan Gustavson
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec4 fade(vec4 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float perlin4d(vec4 P){
  vec4 Pi0 = floor(P); // Integer part for indexing
  vec4 Pi1 = Pi0 + 1.0; // Integer part + 1
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec4 Pf0 = fract(P); // Fractional part for interpolation
  vec4 Pf1 = Pf0 - 1.0; // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = vec4(Pi0.zzzz);
  vec4 iz1 = vec4(Pi1.zzzz);
  vec4 iw0 = vec4(Pi0.wwww);
  vec4 iw1 = vec4(Pi1.wwww);

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);
  vec4 ixy00 = permute(ixy0 + iw0);
  vec4 ixy01 = permute(ixy0 + iw1);
  vec4 ixy10 = permute(ixy1 + iw0);
  vec4 ixy11 = permute(ixy1 + iw1);

  vec4 gx00 = ixy00 / 7.0;
  vec4 gy00 = floor(gx00) / 7.0;
  vec4 gz00 = floor(gy00) / 6.0;
  gx00 = fract(gx00) - 0.5;
  gy00 = fract(gy00) - 0.5;
  gz00 = fract(gz00) - 0.5;
  vec4 gw00 = vec4(0.75) - abs(gx00) - abs(gy00) - abs(gz00);
  vec4 sw00 = step(gw00, vec4(0.0));
  gx00 -= sw00 * (step(0.0, gx00) - 0.5);
  gy00 -= sw00 * (step(0.0, gy00) - 0.5);

  vec4 gx01 = ixy01 / 7.0;
  vec4 gy01 = floor(gx01) / 7.0;
  vec4 gz01 = floor(gy01) / 6.0;
  gx01 = fract(gx01) - 0.5;
  gy01 = fract(gy01) - 0.5;
  gz01 = fract(gz01) - 0.5;
  vec4 gw01 = vec4(0.75) - abs(gx01) - abs(gy01) - abs(gz01);
  vec4 sw01 = step(gw01, vec4(0.0));
  gx01 -= sw01 * (step(0.0, gx01) - 0.5);
  gy01 -= sw01 * (step(0.0, gy01) - 0.5);

  vec4 gx10 = ixy10 / 7.0;
  vec4 gy10 = floor(gx10) / 7.0;
  vec4 gz10 = floor(gy10) / 6.0;
  gx10 = fract(gx10) - 0.5;
  gy10 = fract(gy10) - 0.5;
  gz10 = fract(gz10) - 0.5;
  vec4 gw10 = vec4(0.75) - abs(gx10) - abs(gy10) - abs(gz10);
  vec4 sw10 = step(gw10, vec4(0.0));
  gx10 -= sw10 * (step(0.0, gx10) - 0.5);
  gy10 -= sw10 * (step(0.0, gy10) - 0.5);

  vec4 gx11 = ixy11 / 7.0;
  vec4 gy11 = floor(gx11) / 7.0;
  vec4 gz11 = floor(gy11) / 6.0;
  gx11 = fract(gx11) - 0.5;
  gy11 = fract(gy11) - 0.5;
  gz11 = fract(gz11) - 0.5;
  vec4 gw11 = vec4(0.75) - abs(gx11) - abs(gy11) - abs(gz11);
  vec4 sw11 = step(gw11, vec4(0.0));
  gx11 -= sw11 * (step(0.0, gx11) - 0.5);
  gy11 -= sw11 * (step(0.0, gy11) - 0.5);

  vec4 g0000 = vec4(gx00.x,gy00.x,gz00.x,gw00.x);
  vec4 g1000 = vec4(gx00.y,gy00.y,gz00.y,gw00.y);
  vec4 g0100 = vec4(gx00.z,gy00.z,gz00.z,gw00.z);
  vec4 g1100 = vec4(gx00.w,gy00.w,gz00.w,gw00.w);
  vec4 g0010 = vec4(gx10.x,gy10.x,gz10.x,gw10.x);
  vec4 g1010 = vec4(gx10.y,gy10.y,gz10.y,gw10.y);
  vec4 g0110 = vec4(gx10.z,gy10.z,gz10.z,gw10.z);
  vec4 g1110 = vec4(gx10.w,gy10.w,gz10.w,gw10.w);
  vec4 g0001 = vec4(gx01.x,gy01.x,gz01.x,gw01.x);
  vec4 g1001 = vec4(gx01.y,gy01.y,gz01.y,gw01.y);
  vec4 g0101 = vec4(gx01.z,gy01.z,gz01.z,gw01.z);
  vec4 g1101 = vec4(gx01.w,gy01.w,gz01.w,gw01.w);
  vec4 g0011 = vec4(gx11.x,gy11.x,gz11.x,gw11.x);
  vec4 g1011 = vec4(gx11.y,gy11.y,gz11.y,gw11.y);
  vec4 g0111 = vec4(gx11.z,gy11.z,gz11.z,gw11.z);
  vec4 g1111 = vec4(gx11.w,gy11.w,gz11.w,gw11.w);

  vec4 norm00 = taylorInvSqrt(vec4(dot(g0000, g0000), dot(g0100, g0100), dot(g1000, g1000), dot(g1100, g1100)));
  g0000 *= norm00.x;
  g0100 *= norm00.y;
  g1000 *= norm00.z;
  g1100 *= norm00.w;

  vec4 norm01 = taylorInvSqrt(vec4(dot(g0001, g0001), dot(g0101, g0101), dot(g1001, g1001), dot(g1101, g1101)));
  g0001 *= norm01.x;
  g0101 *= norm01.y;
  g1001 *= norm01.z;
  g1101 *= norm01.w;

  vec4 norm10 = taylorInvSqrt(vec4(dot(g0010, g0010), dot(g0110, g0110), dot(g1010, g1010), dot(g1110, g1110)));
  g0010 *= norm10.x;
  g0110 *= norm10.y;
  g1010 *= norm10.z;
  g1110 *= norm10.w;

  vec4 norm11 = taylorInvSqrt(vec4(dot(g0011, g0011), dot(g0111, g0111), dot(g1011, g1011), dot(g1111, g1111)));
  g0011 *= norm11.x;
  g0111 *= norm11.y;
  g1011 *= norm11.z;
  g1111 *= norm11.w;

  float n0000 = dot(g0000, Pf0);
  float n1000 = dot(g1000, vec4(Pf1.x, Pf0.yzw));
  float n0100 = dot(g0100, vec4(Pf0.x, Pf1.y, Pf0.zw));
  float n1100 = dot(g1100, vec4(Pf1.xy, Pf0.zw));
  float n0010 = dot(g0010, vec4(Pf0.xy, Pf1.z, Pf0.w));
  float n1010 = dot(g1010, vec4(Pf1.x, Pf0.y, Pf1.z, Pf0.w));
  float n0110 = dot(g0110, vec4(Pf0.x, Pf1.yz, Pf0.w));
  float n1110 = dot(g1110, vec4(Pf1.xyz, Pf0.w));
  float n0001 = dot(g0001, vec4(Pf0.xyz, Pf1.w));
  float n1001 = dot(g1001, vec4(Pf1.x, Pf0.yz, Pf1.w));
  float n0101 = dot(g0101, vec4(Pf0.x, Pf1.y, Pf0.z, Pf1.w));
  float n1101 = dot(g1101, vec4(Pf1.xy, Pf0.z, Pf1.w));
  float n0011 = dot(g0011, vec4(Pf0.xy, Pf1.zw));
  float n1011 = dot(g1011, vec4(Pf1.x, Pf0.y, Pf1.zw));
  float n0111 = dot(g0111, vec4(Pf0.x, Pf1.yzw));
  float n1111 = dot(g1111, Pf1);

  vec4 fade_xyzw = fade(Pf0);
  vec4 n_0w = mix(vec4(n0000, n1000, n0100, n1100), vec4(n0001, n1001, n0101, n1101), fade_xyzw.w);
  vec4 n_1w = mix(vec4(n0010, n1010, n0110, n1110), vec4(n0011, n1011, n0111, n1111), fade_xyzw.w);
  vec4 n_zw = mix(n_0w, n_1w, fade_xyzw.z);
  vec2 n_yzw = mix(n_zw.xy, n_zw.zw, fade_xyzw.y);
  float n_xyzw = mix(n_yzw.x, n_yzw.y, fade_xyzw.x);
  return 2.2 * n_xyzw;
}
`;

const vertexShader = `
#define M_PI 3.1415926535897932384626433832795

${perlin4dGlsl}

uniform vec3 uLightAColor;
uniform vec3 uLightAPosition;
uniform float uLightAIntensity;
uniform vec3 uLightBColor;
uniform vec3 uLightBPosition;
uniform float uLightBIntensity;

uniform vec2 uSubdivision;

uniform vec3 uOffset;

uniform float uDistortionFrequency;
uniform float uDistortionStrength;
uniform float uDisplacementFrequency;
uniform float uDisplacementStrength;

uniform float uFresnelOffset;
uniform float uFresnelMultiplier;
uniform float uFresnelPower;

uniform float uTime;

varying vec3 vColor;

vec3 getDisplacedPosition(vec3 _position)
{
    vec3 distoredPosition = _position;
    distoredPosition += perlin4d(vec4(distoredPosition * uDistortionFrequency + uOffset, uTime)) * uDistortionStrength;

    float perlinStrength = perlin4d(vec4(distoredPosition * uDisplacementFrequency + uOffset, uTime));
    
    vec3 displacedPosition = _position;
    displacedPosition += normalize(_position) * perlinStrength * uDisplacementStrength;

    return displacedPosition;
}

void main()
{
    // Position
    vec3 displacedPosition = getDisplacedPosition(position);
    vec4 viewPosition = viewMatrix * vec4(displacedPosition, 1.0);
    gl_Position = projectionMatrix * viewPosition;

    // Bi tangents
    float distanceA = (M_PI * 2.0) / uSubdivision.x;
    float distanceB = M_PI / uSubdivision.x;

    vec3 biTangent = cross(normal, tangent.xyz);

    vec3 positionA = position + tangent.xyz * distanceA;
    vec3 displacedPositionA = getDisplacedPosition(positionA);

    vec3 positionB = position + biTangent.xyz * distanceB;
    vec3 displacedPositionB = getDisplacedPosition(positionB);

    vec3 computedNormal = cross(displacedPositionA - displacedPosition.xyz, displacedPositionB - displacedPosition.xyz);
    computedNormal = normalize(computedNormal);

    // Fresnel
    vec3 viewDirection = normalize(displacedPosition.xyz - cameraPosition);
    float fresnel = uFresnelOffset + (1.0 + dot(viewDirection, computedNormal)) * uFresnelMultiplier;
    fresnel = pow(max(0.0, fresnel), uFresnelPower);

    // Color
    float lightAIntensity = max(0.0, - dot(computedNormal.xyz, normalize(- uLightAPosition))) * uLightAIntensity;
    float lightBIntensity = max(0.0, - dot(computedNormal.xyz, normalize(- uLightBPosition))) * uLightBIntensity;

    vec3 color = vec3(0.0);
    color = mix(color, uLightAColor, lightAIntensity * fresnel);
    color = mix(color, uLightBColor, lightBIntensity * fresnel);
    color = mix(color, vec3(1.0), clamp(pow(max(0.0, fresnel - 0.8), 3.0), 0.0, 1.0));

    // Varying
    vColor = color;
}`;

const fragmentShader = `
precision highp float;

varying vec3 vColor;

void main()
{
    gl_FragColor = vec4(vColor, 1.0);
}`;

export type MovingSphereStatus =
	| "disconnected"
	| "connected"
	| "agentlistening"
	| "agentspeaking";

interface MovingSphereProps {
	width?: string;
	height?: string;
	status?: MovingSphereStatus;
}

const SPHERE_PROFILES = {
	disconnected: {
		uLightAColor: "#A7C7E7",
		uLightAPosition: [1, 1, 1],
		uLightAIntensity: 1,
		uLightBColor: "#A7C7E7",
		uLightBPosition: [-1, -1, -1],
		uLightBIntensity: 1,
		uDistortionFrequency: 1.0,
		uDistortionStrength: 0.01,
		uDisplacementFrequency: 2,
		uDisplacementStrength: 0.01,
		uFresnelOffset: -1.0,
		uFresnelMultiplier: 3.0,
		uFresnelPower: 2.0,
	},
	connected: {
		uLightAColor: "#A7C7E7",
		uLightAPosition: [1, 1, 1],
		uLightAIntensity: 4,
		uLightBColor: "#A7C7E7",
		uLightBPosition: [-1, -1, -1],
		uLightBIntensity: 4,
		uDistortionFrequency: 1.2,
		uDistortionStrength: 0.1,
		uDisplacementFrequency: 1.2,
		uDisplacementStrength: 0.08,
		uFresnelOffset: -1.2,
		uFresnelMultiplier: 2.7,
		uFresnelPower: 2.2,
	},
	agentlistening: {
		uLightAColor: "#A7C7E7",
		uLightAPosition: [1, 1, 1],
		uLightAIntensity: 4,
		uLightBColor: "#A7C7E7",
		uLightBPosition: [-1, -1, -1],
		uLightBIntensity: 4,
		uDistortionFrequency: 1.7,
		uDistortionStrength: 0.22,
		uDisplacementFrequency: 2.0,
		uDisplacementStrength: 0.13,
		uFresnelOffset: -1.0,
		uFresnelMultiplier: 3.0,
		uFresnelPower: 2.4,
	},
	agentspeaking: {
		uLightAColor: "#EDBB99",
		uLightAPosition: [1, 1, 1],
		uLightAIntensity: 4,
		uLightBColor: "#EDBB99",
		uLightBPosition: [-1, -1, -1],
		uLightBIntensity: 4,
		uDistortionFrequency: 2.4,
		uDistortionStrength: 0.37,
		uDisplacementFrequency: 2.0,
		uDisplacementStrength: 0.19,
		uFresnelOffset: -0.8,
		uFresnelMultiplier: 3.0,
		uFresnelPower: 2.4,
	},
};

function lerp(a: number, b: number, t: number) {
	return a + (b - a) * t;
}

function lerpColor(a: THREE.Color, b: THREE.Color, t: number) {
	return a.clone().lerp(b, t);
}

const MovingSphere: React.FC<MovingSphereProps> = ({
	width = "100%",
	height = "100%",
	status = "connected",
}) => {
	const mountRef = useRef<HTMLDivElement | null>(null);
	const uniformsRef = useRef<THREE.ShaderMaterial["uniforms"] | null>(null);
	const prevProfileRef = useRef<
		(typeof SPHERE_PROFILES)[MovingSphereStatus] | null
	>(null);
	const lerpState = useRef<{
		t: number;
		from: MovingSphereStatus;
		to: MovingSphereStatus;
	}>({ t: 1, from: status, to: status });

	useEffect(() => {
		const mount = mountRef.current;
		if (!mount) return;

		const geometry = new THREE.SphereGeometry(1, 512, 512);
		geometry.computeTangents();

		const initialProfile = SPHERE_PROFILES[status];
		const uniforms: Record<
			string,
			{ value: THREE.Color | THREE.Vector3 | THREE.Vector2 | number }
		> = {
			uLightAColor: { value: new THREE.Color(initialProfile.uLightAColor) },
			uLightAPosition: {
				value: new THREE.Vector3(...initialProfile.uLightAPosition),
			},
			uLightAIntensity: { value: initialProfile.uLightAIntensity },
			uLightBColor: { value: new THREE.Color(initialProfile.uLightBColor) },
			uLightBPosition: {
				value: new THREE.Vector3(...initialProfile.uLightBPosition),
			},
			uLightBIntensity: { value: initialProfile.uLightBIntensity },
			uSubdivision: { value: new THREE.Vector2(512, 512) },
			uOffset: { value: new THREE.Vector3() },
			uDistortionFrequency: { value: initialProfile.uDistortionFrequency },
			uDistortionStrength: { value: initialProfile.uDistortionStrength },
			uDisplacementFrequency: { value: initialProfile.uDisplacementFrequency },
			uDisplacementStrength: { value: initialProfile.uDisplacementStrength },
			uFresnelOffset: { value: initialProfile.uFresnelOffset },
			uFresnelMultiplier: { value: initialProfile.uFresnelMultiplier },
			uFresnelPower: { value: initialProfile.uFresnelPower },
			uTime: { value: 0.0 },
		};
		uniformsRef.current = uniforms;
		prevProfileRef.current = initialProfile;

		const material = new THREE.ShaderMaterial({
			uniforms,
			vertexShader,
			fragmentShader,
			defines: { USE_TANGENT: "" },
			side: THREE.DoubleSide,
		});

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(
			45,
			mount.clientWidth / mount.clientHeight,
			0.1,
			100,
		);
		camera.position.z = 5;
		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setSize(mount.clientWidth, mount.clientHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		mount.appendChild(renderer.domElement);

		const offset = {
			spherical: new THREE.Spherical(
				1,
				Math.random() * Math.PI,
				Math.random() * Math.PI * 2,
			),
			direction: new THREE.Vector3(),
		};

		const mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);

		let frameId: number;
		const clock = new THREE.Clock();
		const timeFrequency = 0.02;
		let elapsedTime = 0;

		const animate = () => {
			if (lerpState.current.t < 1) {
				lerpState.current.t = Math.min(lerpState.current.t + 0.04, 1);
				const from = SPHERE_PROFILES[lerpState.current.from];
				const to = SPHERE_PROFILES[lerpState.current.to];
				uniforms.uLightAColor.value = lerpColor(
					new THREE.Color(from.uLightAColor),
					new THREE.Color(to.uLightAColor),
					lerpState.current.t,
				);
				uniforms.uLightAPosition.value.lerpVectors(
					new THREE.Vector3(...from.uLightAPosition),
					new THREE.Vector3(...to.uLightAPosition),
					lerpState.current.t,
				);
				uniforms.uLightAIntensity.value = lerp(
					from.uLightAIntensity,
					to.uLightAIntensity,
					lerpState.current.t,
				);
				uniforms.uLightBColor.value = lerpColor(
					new THREE.Color(from.uLightBColor),
					new THREE.Color(to.uLightBColor),
					lerpState.current.t,
				);
				uniforms.uLightBPosition.value.lerpVectors(
					new THREE.Vector3(...from.uLightBPosition),
					new THREE.Vector3(...to.uLightBPosition),
					lerpState.current.t,
				);
				uniforms.uLightBIntensity.value = lerp(
					from.uLightBIntensity,
					to.uLightBIntensity,
					lerpState.current.t,
				);
				uniforms.uDistortionFrequency.value = lerp(
					from.uDistortionFrequency,
					to.uDistortionFrequency,
					lerpState.current.t,
				);
				uniforms.uDistortionStrength.value = lerp(
					from.uDistortionStrength,
					to.uDistortionStrength,
					lerpState.current.t,
				);
				uniforms.uDisplacementFrequency.value = lerp(
					from.uDisplacementFrequency,
					to.uDisplacementFrequency,
					lerpState.current.t,
				);
				uniforms.uDisplacementStrength.value = lerp(
					from.uDisplacementStrength,
					to.uDisplacementStrength,
					lerpState.current.t,
				);
				uniforms.uFresnelOffset.value = lerp(
					from.uFresnelOffset,
					to.uFresnelOffset,
					lerpState.current.t,
				);
				uniforms.uFresnelMultiplier.value = lerp(
					from.uFresnelMultiplier,
					to.uFresnelMultiplier,
					lerpState.current.t,
				);
				uniforms.uFresnelPower.value = lerp(
					from.uFresnelPower,
					to.uFresnelPower,
					lerpState.current.t,
				);
			}

			const delta = clock.getDelta();
			elapsedTime += delta * timeFrequency;
			const offsetTime = elapsedTime * 0.3;
			offset.spherical.phi =
				(Math.sin(offsetTime * 0.001) * Math.sin(offsetTime * 0.001) * 0.5 +
					0.5) *
				Math.PI;
			offset.spherical.theta =
				(Math.sin(offsetTime * 0.0001) * Math.sin(offsetTime * 0.0001) * 0.5 +
					0.5) *
				Math.PI *
				2;
			offset.direction.setFromSpherical(offset.spherical);
			offset.direction.multiplyScalar(timeFrequency);
			uniforms.uOffset.value.add(offset.direction);
			uniforms.uTime.value += delta * timeFrequency;
			renderer.render(scene, camera);
			frameId = requestAnimationFrame(animate);
		};

		const handleResize = () => {
			if (!mount) return;
			camera.aspect = mount.clientWidth / mount.clientHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(mount.clientWidth, mount.clientHeight);
		};
		window.addEventListener("resize", handleResize);
		animate();

		return () => {
			window.removeEventListener("resize", handleResize);
			cancelAnimationFrame(frameId);
			scene.remove(mesh);
			geometry.dispose();
			material.dispose();
			renderer.dispose();
			mount.removeChild(renderer.domElement);
		};
	}, []);

	React.useEffect(() => {
		if (!uniformsRef.current) return;
		if (lerpState.current.to !== status) {
			lerpState.current.from = lerpState.current.to;
			lerpState.current.to = status;
			lerpState.current.t = 0;
		}
	}, [status]);

	return (
		<div
			ref={mountRef}
			style={{
				width,
				height,
				display: "block",
				position: "relative",
				overflow: "hidden",
			}}
		/>
	);
};

export default MovingSphere;
