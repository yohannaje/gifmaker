import { Draggable } from '@hello-pangea/dnd'

export default function FrameThumb({ frame, index, onRemove, isDragPlaceholder }) {
  if (isDragPlaceholder) {
    return <div className="drop-placeholder" />
  }

  return (
    <Draggable draggableId={String(frame.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`frame-thumb${snapshot.isDragging ? ' dragging' : ''}`}
          style={provided.draggableProps.style}
        >
          <img src={frame.src} alt={frame.name} />
          <span className="frame-thumb-order">{index + 1}</span>
          <button
            className="frame-thumb-remove"
            onClick={(e) => { e.stopPropagation(); onRemove(frame.id) }}
          >
            ×
          </button>
        </div>
      )}
    </Draggable>
  )
}
