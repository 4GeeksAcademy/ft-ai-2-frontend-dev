CREATE TABLE analytics_events (
    id          UUID PRIMARY KEY,
    event_type  TEXT NOT NULL,
    user_id     UUID,
    metadata    JSONB NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_events_created_at
    ON analytics_events (created_at DESC);

CREATE INDEX idx_analytics_events_event_type_created_at
    ON analytics_events (event_type, created_at DESC);
