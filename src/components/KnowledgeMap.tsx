import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'motion/react';
import { ChevronLeft, Share2, Zap, Activity, Shield, Network } from 'lucide-react';
import { Subject, Note } from '../types';

interface KnowledgeMapProps {
  subjects: Subject[];
  notes: Note[];
  onBack: () => void;
}

export const KnowledgeMap: React.FC<KnowledgeMapProps> = ({ subjects, notes, onBack }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState({ nodes: 0, connections: 0, integrity: 98 });

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Group for all nodes
    const group = new THREE.Group();
    scene.add(group);

    // Create Subject Nodes
    const subjectNodes: THREE.Mesh[] = [];
    subjects.forEach((subject, i) => {
      const geometry = new THREE.SphereGeometry(0.5, 32, 32);
      const material = new THREE.MeshPhongMaterial({ 
        color: 0x00ffcc, 
        emissive: 0x00ffcc,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.8
      });
      const mesh = new THREE.Mesh(geometry, material);
      
      // Random position in a sphere
      const phi = Math.acos(-1 + (2 * i) / subjects.length);
      const theta = Math.sqrt(subjects.length * Math.PI) * phi;
      
      mesh.position.set(
        5 * Math.cos(theta) * Math.sin(phi),
        5 * Math.sin(theta) * Math.sin(phi),
        5 * Math.cos(phi)
      );
      
      group.add(mesh);
      subjectNodes.push(mesh);
    });

    // Create Note Nodes (smaller, orbiting subjects)
    const noteNodes: THREE.Mesh[] = [];
    notes.forEach((note, i) => {
      const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      const material = new THREE.MeshPhongMaterial({ 
        color: 0xff00ff,
        emissive: 0xff00ff,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.6
      });
      const mesh = new THREE.Mesh(geometry, material);
      
      // Find parent subject
      const subjectIdx = subjects.findIndex(s => s.id === note.subject_id);
      const parentPos = subjectIdx !== -1 ? subjectNodes[subjectIdx].position : new THREE.Vector3(0,0,0);
      
      mesh.position.set(
        parentPos.x + (Math.random() - 0.5) * 2,
        parentPos.y + (Math.random() - 0.5) * 2,
        parentPos.z + (Math.random() - 0.5) * 2
      );
      
      group.add(mesh);
      noteNodes.push(mesh);
    });

    // Connections (Lines)
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.1 });
    subjectNodes.forEach((node, i) => {
      subjectNodes.forEach((otherNode, j) => {
        if (i >= j) return;
        if (node.position.distanceTo(otherNode.position) < 8) {
          const geometry = new THREE.BufferGeometry().setFromPoints([node.position, otherNode.position]);
          const line = new THREE.Line(geometry, lineMaterial);
          group.add(line);
        }
      });
    });

    // Central Core
    const coreGeom = new THREE.IcosahedronGeometry(1, 1);
    const coreMat = new THREE.MeshPhongMaterial({ 
      color: 0x00ffcc, 
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });
    const core = new THREE.Mesh(coreGeom, coreMat);
    scene.add(core);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x00ffcc, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    camera.position.z = 15;

    setStats({
      nodes: subjects.length + notes.length,
      connections: group.children.length,
      integrity: 98
    });

    const animate = () => {
      requestAnimationFrame(animate);
      group.rotation.y += 0.002;
      group.rotation.x += 0.001;
      core.rotation.y -= 0.005;
      
      // Pulse effect
      const time = Date.now() * 0.001;
      subjectNodes.forEach((node, i) => {
        node.scale.setScalar(1 + Math.sin(time + i) * 0.1);
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [subjects, notes]);

  return (
    <div className="h-screen flex flex-col bg-app-bg theme-cyber cyber-grid overflow-hidden relative">
      {/* Header */}
      <div className="p-6 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 rounded-2xl bg-app-card border border-app-border text-app-text hover:text-app-accent transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-app-text tracking-tight flex items-center gap-2">
              <Network className="text-app-accent" />
              Neural Knowledge Map
            </h1>
            <p className="text-[10px] font-black text-app-text-muted uppercase tracking-[0.2em]">Synaptic Visualization v2.0</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={async () => { try { await navigator.clipboard?.writeText('StudySnap Knowledge Map'); } catch {} }} aria-label="Share knowledge map" className="p-3 rounded-2xl bg-app-card border border-app-border text-app-text-muted hover:text-app-accent transition-colors">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div ref={containerRef} className="flex-1 relative">
        {/* HUD Elements */}
        <div className="absolute top-10 right-10 flex flex-col gap-4 pointer-events-none">
          <HUDCard icon={<Activity size={16} />} label="Synapses" value={stats.connections.toString()} />
          <HUDCard icon={<Zap size={16} />} label="Neural Nodes" value={stats.nodes.toString()} />
          <HUDCard icon={<Shield size={16} />} label="Integrity" value={stats.integrity + "%"} />
        </div>

        <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-3 max-h-36 overflow-y-auto pr-1">
          {subjects.map(subject => (
            <motion.div 
              key={subject.id}
              whileHover={{ y: -5 }}
              className="px-4 py-3 rounded-2xl bg-app-card/90 backdrop-blur-xl border border-app-border flex items-center gap-3"
            >
              <div className={`w-3 h-3 rounded-full ${subject.color}`} />
              <span className="text-xs font-black text-app-text uppercase tracking-widest">{subject.name}</span>
              <span className="text-[10px] font-bold text-app-text-muted">{notes.filter(n => n.subject_id === subject.id).length} Nodes</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scanning Overlay Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ y: ['0%', '100%', '0%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="h-px w-full bg-app-accent/20 shadow-[0_0_20px_var(--color-app-accent)]"
        />
      </div>
    </div>
  );
};

const HUDCard: React.FC<{ icon: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => (
  <motion.div 
    initial={{ x: 50, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    className="px-6 py-4 rounded-2xl bg-app-card/40 backdrop-blur-md border border-app-border flex flex-col gap-1 min-w-[140px]"
  >
    <div className="flex items-center gap-2 text-app-text-muted">
      {icon}
      <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <span className="text-xl font-display font-black text-app-text">{value}</span>
  </motion.div>
);
