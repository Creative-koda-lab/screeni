import React from 'react';
import type { TextElement as TextElementType } from '@/types/editor';
import { DraggableElement } from './DraggableElement';

interface TextElementProps {
  element: TextElementType;
}

export const TextElement: React.FC<TextElementProps> = ({ element }) => {
  return (
    <DraggableElement element={element}>
      <div
        contentEditable={false}
        suppressContentEditableWarning
        style={{
          width: '100%',
          height: '100%',
          fontSize: `${element.fontSize}px`,
          fontWeight: element.fontWeight,
          color: element.color,
          fontFamily: element.fontFamily,
          textAlign: element.textAlign,
          display: 'flex',
          alignItems: 'center',
          justifyContent: element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : 'flex-start',
          padding: '8px',
          overflow: 'hidden',
          wordWrap: 'break-word',
        }}
      >
        {element.content}
      </div>
    </DraggableElement>
  );
};
