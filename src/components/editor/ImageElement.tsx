import React from 'react';
import type { ImageElement as ImageElementType } from '@/types/editor';
import { DraggableElement } from './DraggableElement';

interface ImageElementProps {
  element: ImageElementType;
}

export const ImageElement: React.FC<ImageElementProps> = ({ element }) => {
  return (
    <DraggableElement element={element}>
      <img
        src={element.url}
        alt={element.alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          pointerEvents: 'none',
          borderRadius: `${element.borderRadius}px`,
          border: element.borderWidth > 0
            ? `${element.borderWidth}px solid ${element.borderColor}`
            : 'none',
        }}
        draggable={false}
      />
    </DraggableElement>
  );
};
