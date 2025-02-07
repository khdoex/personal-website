'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Scene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    containerRef.current.appendChild(renderer.domElement);

    // Create stars
    const starsGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    const starColors = [];
    const starSizes = [];

    // Create more stars and add colors
    for (let i = 0; i < 10000; i++) {
      const radius = 5 + Math.random() * 15;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      starVertices.push(x, y, z);

      // Add color variation
      const color = new THREE.Color();
      const distanceFromCenter = Math.sqrt(x * x + y * y + z * z);
      
      if (distanceFromCenter < 8) {
        // Inner stars are bright blue/white
        color.setHSL(0.6, 1.0, 0.9);
      } else if (distanceFromCenter < 12) {
        // Middle stars are yellow/white
        color.setHSL(0.15, 0.8, 0.9);
      } else {
        // Outer stars are reddish
        color.setHSL(0.05, 0.9, 0.9);
      }
      
      starColors.push(color.r, color.g, color.b);
      starSizes.push(Math.random() * 0.2 + 0.1);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    starsGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));

    // Create custom shader material for better-looking stars
    const starsMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          // Animate size with time
          float pulse = sin(time + position.x * 10.0) * 0.1 + 1.0;
          gl_PointSize = size * (300.0 / -mvPosition.z) * pulse;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          float r = length(gl_PointCoord - vec2(0.5));
          if (r > 0.5) discard;
          
          // Add glow effect
          float intensity = 1.0 - (r * 2.0);
          intensity = pow(intensity, 1.5);
          gl_FragColor = vec4(vColor * intensity, intensity);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    // Position camera
    camera.position.z = 15;
    camera.position.y = 5;
    camera.lookAt(0, 0, 0);

    // Animation
    let time = 0;
    function animate() {
      requestAnimationFrame(animate);
      time += 0.001;

      // Update star material time uniform
      starsMaterial.uniforms.time.value = time;

      // Rotate star field
      starField.rotation.y = time * 0.1;
      starField.rotation.x = Math.sin(time * 0.2) * 0.1;

      // Move camera in a gentle circle
      camera.position.x = Math.sin(time * 0.2) * 3;
      camera.position.z = 15 + Math.cos(time * 0.2) * 3;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      starsGeometry.dispose();
      starsMaterial.dispose();
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -10,
        background: 'black'
      }} 
    />
  );
} 