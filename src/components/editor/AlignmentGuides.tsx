import React from 'react';
import { useEditorStore } from '@/store/editorStore';

export const AlignmentGuides: React.FC = () => {
  const { alignmentGuides } = useEditorStore();

  return (
    <>
      {alignmentGuides.map((guide, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            ...(guide.type === 'vertical'
              ? {
                  left: guide.position,
                  top: 0,
                  bottom: 0,
                  width: '1px',
                }
              : {
                  top: guide.position,
                  left: 0,
                  right: 0,
                  height: '1px',
                }),
            backgroundColor: '#3b82f6',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        />
      ))}
    </>
  );
};
