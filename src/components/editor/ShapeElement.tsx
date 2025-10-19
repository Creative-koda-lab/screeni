import React from 'react';
import type { ShapeElement as ShapeElementType } from '@/types/editor';
import { DraggableElement } from './DraggableElement';

interface ShapeElementProps {
  element: ShapeElementType;
}

export const ShapeElement: React.FC<ShapeElementProps> = ({ element }) => {
  const getShapeStyle = () => {
    const baseStyle = {
      width: '100%',
      height: '100%',
      backgroundColor: element.backgroundColor,
      border: `${element.borderWidth}px solid ${element.borderColor}`,
    };

    if (element.shape === 'circle') {
      return { ...baseStyle, borderRadius: '50%' };
    } else if (element.shape === 'rectangle') {
      return { ...baseStyle, borderRadius: `${element.borderRadius}px` };
    } else if (element.shape === 'triangle') {
      return {
        width: 0,
        height: 0,
        borderLeft: `${element.size.width / 2}px solid transparent`,
        borderRight: `${element.size.width / 2}px solid transparent`,
        borderBottom: `${element.size.height}px solid ${element.backgroundColor}`,
        backgroundColor: 'transparent',
        border: 'none',
      };
    }

    return baseStyle;
  };

  return (
    <DraggableElement element={element}>
      <div style={getShapeStyle()} />
    </DraggableElement>
  );
};
