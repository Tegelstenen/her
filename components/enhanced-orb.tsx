import { useEffect, useRef } from "react";

interface EnhancedOrbProps {
	speaking?: boolean;
	connected?: boolean;
	color1?: string;
	color2?: string;
}

const EnhancedOrb = ({
	speaking = false,
	connected = false,
	color1 = "#2792DC", // Primary color (similar to ElevenLabs blue)
	color2 = "#9CE6E6", // Secondary color
}: EnhancedOrbProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	// Using refs to track previous state to prevent animation resets
	const prevStateRef = useRef({ speaking, connected });
	const animStateRef = useRef({
		// Start with a reasonable activity level to prevent initial jump
		currentActivity: speaking ? 1.0 : connected ? 0.5 : 0.2,
		// Track the base animation seed to maintain continuity
		animationSeed: 0,
	});

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const gl = canvas.getContext("webgl2");
		if (!gl) {
			console.error("WebGL2 not supported by your browser");
			return;
		}

		// Set canvas size
		const setCanvasSize = () => {
			const canvas = canvasRef.current;
			if (!canvas) return;

			const container = canvas.parentElement;
			if (!container) return;

			const size = Math.min(container.offsetWidth, container.offsetHeight);
			canvas.width = size;
			canvas.height = size;
			gl.viewport(0, 0, canvas.width, canvas.height);
		};

		setCanvasSize();
		window.addEventListener("resize", setCanvasSize);

		// Create shader program
		const createShader = (type: number, source: string): WebGLShader | null => {
			const shader = gl.createShader(type);
			if (!shader) {
				console.error("Failed to create shader");
				return null;
			}

			gl.shaderSource(shader, source);
			gl.compileShader(shader);
			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				console.error(gl.getShaderInfoLog(shader));
				gl.deleteShader(shader);
				return null;
			}
			return shader;
		};

		const vertexShaderSource = `#version 300 es
      in vec2 position;
      out vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0, 1);
      }
    `;

		const fragmentShaderSource = `#version 300 es
      precision highp float;
      
      uniform float uTime;
      uniform float uActivity;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform float uOffsets[7];
      // Add a continuous animation seed to prevent discontinuities
      uniform float uAnimSeed;
      
      in vec2 vUv;
      out vec4 outColor;
      
      const float PI = 3.14159265358979323846;
      
      // Function to create consistent noise
      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }
      
      float smoothNoise(vec2 p) {
        vec2 ip = floor(p);
        vec2 fp = fract(p);
        
        // Use smooth quintic interpolation
        fp = fp * fp * fp * (fp * (fp * 6.0 - 15.0) + 10.0);
        
        float bl = noise(ip);
        float br = noise(ip + vec2(1.0, 0.0));
        float tl = noise(ip + vec2(0.0, 1.0));
        float tr = noise(ip + vec2(1.0, 1.0));
        
        float bottom = mix(bl, br, fp.x);
        float top = mix(tl, tr, fp.x);
        
        return mix(bottom, top, fp.y);
      }
      
      // Improved oval drawing function
      bool drawOval(vec2 uv, vec2 center, float a, float b, bool reverseGradient, float softness, out vec4 color) {
        vec2 p = uv - center;
        float oval = (p.x * p.x) / (a * a) + (p.y * p.y) / (b * b);
        
        // Very smooth edge transition
        float edge = smoothstep(1.0, 1.0 - softness, oval);
        edge = pow(edge, 1.15); // Subtle falloff
        
        if (edge > 0.0) {
          // Create a smooth gradient
          float t = reverseGradient 
            ? 1.0 - (p.x / a + 1.0) / 2.0
            : (p.x / a + 1.0) / 2.0;
          
          // Subtle easing
          float gradient = t * t * (3.0 - 2.0 * t);
          
          // Consistent opacity for smoother blending
          color = vec4(vec3(gradient), 0.65 * edge); 
          return true;
        }
        return false;
      }
      
      // Smooth color mapping
      vec3 colorRamp(float value, vec3 color1, vec3 color2) {
        // Smoother easing
        float t = value;
        t = t * t * (3.0 - 2.0 * t);
        return mix(color1, color2, t);
      }
      
      void main() {
        // Convert coordinates to be centered at (0,0)
        vec2 uv = (vUv * 2.0 - 1.0);
        float radius = length(uv);
        
        // Create a circular mask with a soft edge
        float circle = smoothstep(1.0, 0.97, radius);
        
        // Get polar coordinates
        float theta = atan(uv.y, uv.x);
        if (theta < 0.0) theta += 2.0 * PI;
        
        // Initialize color
        vec4 color = vec4(1.0);
        
        // Base animation parameters that are constant regardless of activity
        float baseTime = uTime * 0.5;
        
        // Create smoothly animated wave patterns based on activity
        // Use uAnimSeed to maintain continuity between state changes
        float continuousTime = baseTime + uAnimSeed;
        
        // The key is to make speed a function of activity, not a discontinuous value
        float waveStrength = 0.06 + uActivity * 0.14;
        // Smooth function instead of conditional logic - more direct speed scaling
        float waveSpeed = 0.3 + 2.0 * uActivity; // Linear acceleration with activity
        
        // Create multiple overlapping oval shapes
        float originalCenters[7] = float[7](0.0, 0.5 * PI, 1.0 * PI, 1.5 * PI, 2.0 * PI, 2.5 * PI, 3.0 * PI);
        float centers[7];
        
        // Use continuous functions for all animation parameters
        for (int i = 0; i < 7; i++) {
          // Use a continuous function of activity for frequency
          float baseFreq = 0.12 + float(i) * 0.04;
          float frequency = baseFreq * (1.0 + uActivity * 1.2);
          
          // Ensure movement is continuous regardless of activity
          // Only the rate of movement changes with activity level
          centers[i] = originalCenters[i] + 
                      waveStrength * sin(continuousTime * waveSpeed * frequency + uOffsets[i]) * 
                      (0.4 + 0.6 * uActivity) +
                      0.08 * uActivity * cos(continuousTime * frequency * 1.3 + uOffsets[i] * 1.8);
        }
        
        float a, b;
        vec4 ovalColor;
        
        // Draw multiple ovals with smooth parameters
        for (int i = 0; i < 7; i++) {
          // Use a continuous time parameter for noise 
          float timeScale = 0.08 + 0.25 * uActivity;
          float noise = smoothNoise(vec2(mod(centers[i] * 0.2 + continuousTime * timeScale, 10.0), 0.5));
          
          // Smooth scaling of shape parameters
          a = 0.6 + noise * (1.0 + uActivity * 0.8);
          b = 2.0 + noise * (2.8 + uActivity * 1.8);
          bool reverseGradient = (i % 2 == 1);
          
          // Calculate distance in polar coordinates
          float distTheta = abs(theta - centers[i]);
          if (distTheta > PI) distTheta = 2.0 * PI - distTheta;
          float distRadius = radius;
          
          // Consistent softness with subtle variation
          float softness = 0.4 + uActivity * 0.08;
          
          // Draw the oval
          if (drawOval(vec2(distTheta, distRadius), vec2(0.0, 0.0), a, b, reverseGradient, softness, ovalColor)) {
            color.rgb = mix(color.rgb, ovalColor.rgb, ovalColor.a);
            color.a = max(color.a, ovalColor.a);
          }
        }
        
        // Smooth pulsing effect that scales with activity
        float basePulseSpeed = 0.25 + uActivity * 1.2; // More direct speed scaling with activity
        float pulse = 0.5 + 0.5 * sin(continuousTime * basePulseSpeed);
        float pulseEffect = pulse * (0.04 + 0.1 * uActivity); // Slightly stronger effect with activity
        float ringRadius = 0.82 + pulseEffect;
        float ringWidth = 0.04 + 0.05 * uActivity;
        float ring = smoothstep(ringRadius + ringWidth, ringRadius, radius) * 
                    smoothstep(ringRadius - ringWidth, ringRadius, radius);
        
        // Add the ring to the color
        vec3 ringColor = vec3(1.0);
        color.rgb = mix(color.rgb, ringColor, ring * 0.22);
        
        // Apply color mapping
        color.rgb = colorRamp(color.r, uColor1, uColor2);
        
        // Smooth ripple effect scaled by activity
        float rippleIntensity = smoothstep(0.5, 0.95, uActivity) * 0.035; // Gentler smoothstep and reduced intensity
        if (rippleIntensity > 0.001) {
          float rippleSpeed = 2.2;
          float rippleCount = 3.0;
          float ripple = sin(radius * rippleCount * PI - continuousTime * rippleSpeed);
          color.rgb += ripple * rippleIntensity;
        }
        
        // Fixed opacity for consistency
        float finalOpacity = 0.8;
        outColor = vec4(color.rgb, color.a * circle * finalOpacity);
      }`;

		const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
		const fragmentShader = createShader(
			gl.FRAGMENT_SHADER,
			fragmentShaderSource,
		);

		if (!vertexShader || !fragmentShader) {
			console.error("Failed to compile shaders");
			return;
		}

		const program = gl.createProgram();
		if (!program) {
			console.error("Failed to create shader program");
			return;
		}

		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error(gl.getProgramInfoLog(program));
			return;
		}

		// Set up the vertex buffer
		const vertexBuffer = gl.createBuffer();
		if (!vertexBuffer) {
			console.error("Failed to create vertex buffer");
			return;
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		const vertices = new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

		// Get attribute and uniform locations
		const positionLoc = gl.getAttribLocation(program, "position");
		const timeLoc = gl.getUniformLocation(program, "uTime");
		const activityLoc = gl.getUniformLocation(program, "uActivity");
		const color1Loc = gl.getUniformLocation(program, "uColor1");
		const color2Loc = gl.getUniformLocation(program, "uColor2");
		const offsetsLoc = gl.getUniformLocation(program, "uOffsets");
		const animSeedLoc = gl.getUniformLocation(program, "uAnimSeed");

		if (positionLoc === -1) {
			console.error("Failed to get position attribute location");
			return;
		}

		// Uniform locations can be null, but we'll check for timeLoc as it's essential
		if (!timeLoc) {
			console.error("Failed to get time uniform location");
			return;
		}

		// Set up attributes
		gl.enableVertexAttribArray(positionLoc);
		gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

		// Generate evenly distributed offsets for smoother animation
		const offsets = new Float32Array(7);
		for (let i = 0; i < 7; i++) {
			offsets[i] = (i / 7) * Math.PI * 2;
		}

		// Parse colors to RGB
		const parseColor = (color: string): [number, number, number] => {
			const hex = color.replace("#", "");
			const r = parseInt(hex.substring(0, 2), 16) / 255;
			const g = parseInt(hex.substring(2, 4), 16) / 255;
			const b = parseInt(hex.substring(4, 6), 16) / 255;
			// Apply gamma correction
			return [Math.pow(r, 2.2), Math.pow(g, 2.2), Math.pow(b, 2.2)];
		};

		const rgb1 = parseColor(color1);
		const rgb2 = parseColor(color2);

		// Animation variables
		const startTime = Date.now();
		let requestId: number;

		// State transition variables
		const transitionDuration = 1800; // Longer transition for smoother effect
		let transitionStartTime = 0;
		let isInTransition = false;
		let transitionFromActivity = animStateRef.current.currentActivity;
		let transitionToActivity = speaking ? 1.0 : connected ? 0.5 : 0.2;

		// Initialize if state changed since last render
		if (
			speaking !== prevStateRef.current.speaking ||
			connected !== prevStateRef.current.connected
		) {
			transitionStartTime = Date.now();
			isInTransition = true;
			transitionFromActivity = animStateRef.current.currentActivity;
			transitionToActivity = speaking ? 1.0 : connected ? 0.5 : 0.2;

			// Update prev state ref
			prevStateRef.current = { speaking, connected };
		}

		// Improved easing function for silky smooth transitions
		const easeInOutCubic = (t: number): number => {
			// Very gradual easing function
			return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
		};

		// Update animation
		const render = (): void => {
			const now = Date.now();

			// Handle state transitions with smooth easing
			if (isInTransition) {
				const elapsed = now - transitionStartTime;
				const progress = Math.min(elapsed / transitionDuration, 1.0);

				if (progress < 1.0) {
					// Apply easing for super smooth transition
					const easedProgress = easeInOutCubic(progress);
					animStateRef.current.currentActivity =
						transitionFromActivity +
						(transitionToActivity - transitionFromActivity) * easedProgress;
				} else {
					// Transition complete
					animStateRef.current.currentActivity = transitionToActivity;
					isInTransition = false;
				}
			}

			// Update the animation seed (slowly for stability but continuously to prevent resets)
			animStateRef.current.animationSeed += 0.0008;

			// Calculate normalized time for animation
			const normalizedTime = (now - startTime) / 1000;

			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);

			gl.useProgram(program);

			// Set uniforms with null checks
			gl.uniform1f(timeLoc, normalizedTime);
			if (activityLoc)
				gl.uniform1f(activityLoc, animStateRef.current.currentActivity);
			if (color1Loc) gl.uniform3fv(color1Loc, rgb1);
			if (color2Loc) gl.uniform3fv(color2Loc, rgb2);
			if (offsetsLoc) gl.uniform1fv(offsetsLoc, offsets);
			if (animSeedLoc)
				gl.uniform1f(animSeedLoc, animStateRef.current.animationSeed);

			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

			requestId = requestAnimationFrame(render);
		};

		render();

		return () => {
			window.removeEventListener("resize", setCanvasSize);
			if (requestId) {
				cancelAnimationFrame(requestId);
			}

			// Clean up WebGL resources
			if (gl) {
				if (program) gl.deleteProgram(program);
				if (vertexShader) gl.deleteShader(vertexShader);
				if (fragmentShader) gl.deleteShader(fragmentShader);
				if (vertexBuffer) gl.deleteBuffer(vertexBuffer);
			}
		};
	}, [speaking, connected, color1, color2]);

	return (
		<canvas
			ref={canvasRef}
			className="h-full w-full rounded-full"
			style={{
				boxShadow: "0 0 20px rgba(0, 0, 0, 0.15)",
			}}
		/>
	);
};

export default EnhancedOrb;
