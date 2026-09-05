import { useEffect, useRef } from "react";

interface Node3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  baseSize: number;
}

export default function CyberCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.offsetWidth || 800);
    let height = (canvas.height = canvas.offsetHeight || 600);

    // Initial 3D nodes creation
    const nodeCount = 65;
    const nodes: Node3D[] = [];
    const maxRadius = Math.min(width, height, 500) * 0.45 || 200;

    for (let i = 0; i < nodeCount; i++) {
      // Create points inside a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = (0.3 + 0.7 * Math.random()) * maxRadius;

      nodes.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        vz: (Math.random() - 0.5) * 0.25,
        baseSize: Math.random() * 2 + 1.5,
      });
    }

    // Perspective parameters
    const focalLength = 400;
    let angleY = 0.0015; // Slow ambient orbit
    let angleX = 0.0006;

    // Handle mouse movement to warp angles and offset centers
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      // Normalize mouse coordinates from -1 to 1 safely
      const safeWidth = width || 800;
      const safeHeight = height || 600;
      let targetX = (clientX / safeWidth) * 2 - 1;
      let targetY = (clientY / safeHeight) * 2 - 1;

      if (!isFinite(targetX)) targetX = 0;
      if (!isFinite(targetY)) targetY = 0;

      mouseRef.current.targetX = targetX;
      mouseRef.current.targetY = targetY;
    };

    try {
      if (typeof window !== "undefined") {
        window.addEventListener("mousemove", handleMouseMove);
      }
    } catch (e) {
      // Ignored
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 800;
      height = canvas.height = canvas.offsetHeight || 600;
    };
    
    try {
      if (typeof window !== "undefined") {
        window.addEventListener("resize", handleResize);
      }
    } catch (e) {
      // Ignored
    }

    // Coordinate rotation helpers
    const rotateY = (node: Node3D, angle: number) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const x = node.x * cos - node.z * sin;
      const z = node.z * cos + node.x * sin;
      node.x = x;
      node.z = z;
    };

    const rotateX = (node: Node3D, angle: number) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const y = node.y * cos - node.z * sin;
      const z = node.z * cos + node.y * sin;
      node.y = y;
      node.z = z;
    };

    // Render loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Smoothly interpolate cursor variables (for magnetic leaning aura)
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      // Adjust rotation angles based on cursor offset
      const currentAngleY = angleY + mouseRef.current.x * 0.003;
      const currentAngleX = angleX + mouseRef.current.y * 0.002;

      // Center perspective projection offset (safely computed)
      let normCurX = mouseRef.current.x;
      let normCurY = mouseRef.current.y;
      if (!isFinite(normCurX)) normCurX = 0;
      if (!isFinite(normCurY)) normCurY = 0;

      const centerX = (width || 800) / 2 + normCurX * 35;
      const centerY = (height || 600) / 2 + normCurY * 25;

      // Nodes updates & rotations
      nodes.forEach((node) => {
        // Dynamic jitter drift
        node.x += node.vx;
        node.y += node.vy;
        node.z += node.vz;

        // Spherical boundary rebound
        const dist = Math.sqrt(node.x * node.x + node.y * node.y + node.z * node.z);
        if (dist > maxRadius) {
          node.vx *= -1;
          node.vy *= -1;
          node.vz *= -1;
        }

        rotateY(node, currentAngleY);
        rotateX(node, currentAngleX);
      });

      // Project 3D nodes to 2D screen positions
      const projected = nodes.map((node) => {
        // Add artificial Z-depth offset to prevent dividing by zero
        const projectedZ = node.z + 350;
        const denom = focalLength + projectedZ;
        const scale = denom !== 0 ? focalLength / denom : 1;
        
        let sx = centerX + node.x * scale;
        let sy = centerY + node.y * scale;
        let size = node.baseSize * scale;

        if (!isFinite(sx)) sx = 0;
        if (!isFinite(sy)) sy = 0;
        if (!isFinite(size) || size < 0) size = 1;

        return {
          sx,
          sy,
          sz: node.z,
          scale,
          size,
        };
      });

      // Render lines connecting close nodes (with glowing transparency gradients)
      ctx.lineWidth = 0.8;
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];

          // Check spatial distance in projected 2D space to establish virtual connections
          const dx = p1.sx - p2.sx;
          const dy = p1.sy - p2.sy;
          const distance2D = Math.sqrt(dx * dx + dy * dy);

          const maxConnectDist = Math.min(width, height, 500) * 0.28;

          if (distance2D < maxConnectDist) {
            const alpha = (1 - distance2D / maxConnectDist) * 0.25;
            ctx.strokeStyle = `rgba(102, 252, 241, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.sx, p1.sy);
            ctx.lineTo(p2.sx, p2.sy);
            ctx.stroke();
          }
        }
      }

      // Render actual glowing neon points
      projected.forEach((p) => {
        // Dot brightness based on its simulated Z-depth position
        const depthAlpha = Math.max(0.2, (p.sz + maxRadius) / (maxRadius * 2));
        ctx.fillStyle = `rgba(102, 252, 241, ${depthAlpha * 0.95})`;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Extra outer glow ring on closer nodes
        if (p.sz > 0) {
          ctx.strokeStyle = `rgba(102, 252, 241, ${depthAlpha * 0.15})`;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, p.size * 3.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Subtle atmospheric grid or center core
      ctx.shadowBlur = 0;

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      try {
        if (typeof window !== "undefined") {
          window.removeEventListener("mousemove", handleMouseMove);
          window.removeEventListener("resize", handleResize);
        }
      } catch (e) {
        // Ignored
      }
    };
  }, []);

  return (
    <div id="cyber-mesh-container" className="absolute inset-0 z-0 pointer-events-none opacity-85 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Dynamic ambient grid layer block for matrix flavor */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_94%,rgba(102,252,241,0.02)_95%),linear-gradient(90deg,rgba(18,18,18,0)_94%,rgba(102,252,241,0.02)_95%)] bg-[size:40px_40px] pointer-events-none" />
      <div style={{ background: "radial-gradient(circle at 50% 50%, transparent 20%, rgba(11, 12, 16, 0.4) 60%, rgb(11, 12, 16) 100%)" }} className="absolute inset-0 pointer-events-none" />
    </div>
  );
}
