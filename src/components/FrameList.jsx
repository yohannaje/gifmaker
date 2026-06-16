import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import FrameThumb from './FrameThumb.jsx'

export default function FrameList({ frames, onRemove, onReorder }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return
    if (result.source.index === result.destination.index) return
    onReorder(result.source.index, result.destination.index)
  }

  return (
    <div className="frame-list-section">
      <div className="frame-list-header">
        <h3>Frames</h3>
        <span className="frame-count">{frames.length} image{frames.length !== 1 ? 's' : ''}</span>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="frames" direction="horizontal">
          {(provided) => (
            <div
              className="frame-list"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {frames.map((frame, i) => (
                <FrameThumb
                  key={frame.id}
                  frame={frame}
                  index={i}
                  onRemove={onRemove}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}
