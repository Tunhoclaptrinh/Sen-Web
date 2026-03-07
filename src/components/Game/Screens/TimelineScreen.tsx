import React, { useState, useEffect } from "react";
import { Card, Button, Typography, message } from "antd";
import { CheckOutlined, HolderOutlined } from "@ant-design/icons";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TimelineScreen as TimelineScreenType } from "@/types/game.types";
import { useGameSounds } from "@/hooks/useSound";
import { useTranslation } from "react-i18next";
import "./styles.less";

import { getImageUrl } from "@/utils/image.helper";

const { Title, Text } = Typography;

interface Props {
  data: TimelineScreenType;
  onNext: () => void;
  onSubmit: (order: string[]) => Promise<{ isCorrect: boolean; correct_order?: string[] }>;
  fallbackImage?: string;
  loading?: boolean;
}

// Sub-component for Sortable Item
const SortableItem = ({ id, event, isCorrect }: { id: string; event: any; isCorrect: boolean | null }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  // Apply transform and transition
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : "auto",
    position: "relative",
    touchAction: "none", // Important for touch devices
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`timeline-event-item ${isDragging ? "dragging" : ""}`}
    >
      <div className={`drag-handle ${isCorrect ? "disabled" : ""}`} {...(isCorrect ? {} : listeners)}>
        <HolderOutlined style={{ fontSize: 18 }} />
      </div>
      <div className="event-year">{isCorrect ? event.year : "????"}</div>
      <div className="event-content">
        <h4>{event.title}</h4>
        <p>{event.description}</p>
      </div>
    </div>
  );
};

// Transform events from any data format
const transformEvents = (data: TimelineScreenType) => {
  if (data.events && Array.isArray(data.events) && data.events.length > 0) {
    return data.events;
  }
  return [];
};

const TimelineScreen: React.FC<Props> = ({ data, onNext, onSubmit, fallbackImage, loading }) => {
  const { t } = useTranslation();
  const [events, setEvents] = useState(() => transformEvents(data));
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { playClick } = useGameSounds();

  // Computed background
  const bgImage = data.backgroundImage || fallbackImage;

  // Sensors setup
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Require move of 5px to start drag (prevents accidental clicks)
      },
    }),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Reset state when data changes
  useEffect(() => {
    setEvents(transformEvents(data));
    setIsCorrect(null);
    setSubmitting(false);
  }, [data]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && !isCorrect) {
      setEvents((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleCheck = async () => {
    if (events.length === 0) {
      message.warning(t('gamePlay.errors.noData'));
      return;
    }
    setSubmitting(true);
    const currentOrder = events.map((e) => e.id);

    try {
      const result = await onSubmit(currentOrder);
      setIsCorrect(result.isCorrect);

      if (result.isCorrect) {
        message.success({ content: t('gamePlay.screens.timeline.success'), key: "timeline_check" });
      } else {
        message.error({ content: t('gamePlay.screens.timeline.failure'), key: "timeline_check" });
      }
    } catch (error) {
      console.error(error);
      message.error(t('gamePlay.errors.general'));
    } finally {
      setSubmitting(false);
    }
  };

  if (events.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "white" }}>
        <h3>{t('gamePlay.errors.noData')}</h3>
        <Button onClick={() => { playClick(); onNext(); }}>{t('gamePlay.common.skip')}</Button>
      </div>
    );
  }

  return (
    <div className="timeline-screen">
      {/* Background reused from parent container */}
      <div
        className="game-background"
        style={{
          backgroundImage: `url("${getImageUrl(bgImage, "https://via.placeholder.com/1200x600?text=Timeline+Background")}")`,
        }}
      />

      <div className="screen-content-wrapper">
        <Card className="timeline-card">
          <div className="timeline-header">
            <Title level={3} style={{ margin: 0 }}>
              {data.content?.title || t('gamePlay.screens.timeline.title')}
            </Title>
            <Text type="secondary" style={{ display: "block", marginTop: 8, fontSize: 16 }}>
              {data.content?.description || t('gamePlay.screens.timeline.description')}
            </Text>
          </div>

          <div className="timeline-events-container">
            <div className="timeline-drop-zone">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={events.map((e) => e.id)} strategy={verticalListSortingStrategy}>
                  {events.map((event) => (
                    <SortableItem key={event.id} id={event.id} event={event} isCorrect={isCorrect} />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </div>

          <div className="timeline-actions" style={{ textAlign: "center", marginTop: 24 }}>
            {isCorrect ? (
              <Button
                type="primary"
                size="large"
                onClick={() => { playClick(); onNext(); }}
                icon={<CheckOutlined />}
                className="continue-btn"
                disabled={loading}
              >
                {t('gamePlay.screens.quiz.nextStep')}
              </Button>
            ) : (
              <Button type="primary" size="large" onClick={() => { playClick(); handleCheck(); }} loading={submitting} disabled={submitting}>
                {t('gamePlay.screens.timeline.checkResult')}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TimelineScreen;
