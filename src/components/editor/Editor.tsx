import React, { useRef } from 'react';
import { Canvas } from './Canvas';
import { Toolbar } from './Toolbar';
import { PropertiesPanel } from './PropertiesPanel';

export const Editor: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex h-screen w-screen bg-background">
      {/* Left Toolbar */}
      <div className="w-64 shrink-0">
        <Toolbar canvasRef={canvasRef} />
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 overflow-hidden">
        <Canvas ref={canvasRef} />
      </div>

      {/* Right Properties Panel */}
      <div className="shrink-0">
        <PropertiesPanel />
      </div>
    </div>
  );
};
