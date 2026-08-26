"""OpenTelemetry setup — batched span/metric export (Session 4).

Uses BatchSpanProcessor + PeriodicExportingMetricReader (not SimpleSpanProcessor).
Tunables (env):
  OTEL_EXPORTER_OTLP_ENDPOINT   e.g. http://otel-collector:4318
  OTEL_SERVICE_NAME
  OTEL_BSP_SCHEDULE_DELAY       ms between batch exports (default 1000)
  OTEL_BSP_MAX_EXPORT_BATCH_SIZE
  OTEL_METRIC_EXPORT_INTERVAL   ms (default 5000)

Fail-open: if endpoint unset or setup fails, the app still serves traffic.
"""

from __future__ import annotations

import logging
import os
from typing import Optional

logger = logging.getLogger("brevity-api.telemetry")

_tracer_provider = None
_meter_provider = None


def setup_telemetry(service_name: str) -> bool:
    """Configure OTel SDK. Returns True if exporters were attached."""
    global _tracer_provider, _meter_provider

    endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "").rstrip("/")
    if not endpoint:
        logger.info("OTEL_EXPORTER_OTLP_ENDPOINT unset — telemetry disabled")
        return False

    try:
        from opentelemetry import metrics, trace
        from opentelemetry.exporter.otlp.proto.http.metric_exporter import (
            OTLPMetricExporter,
        )
        from opentelemetry.exporter.otlp.proto.http.trace_exporter import (
            OTLPSpanExporter,
        )
        from opentelemetry.sdk.metrics import MeterProvider
        from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
        from opentelemetry.sdk.resources import Resource
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.trace.export import BatchSpanProcessor
    except ImportError:
        logger.warning("OpenTelemetry packages missing — telemetry disabled")
        return False

    name = os.getenv("OTEL_SERVICE_NAME", service_name)
    resource = Resource.create({"service.name": name})

    try:
        span_exporter = OTLPSpanExporter(endpoint=f"{endpoint}/v1/traces")
        schedule_delay = int(os.getenv("OTEL_BSP_SCHEDULE_DELAY", "1000"))
        max_batch = int(os.getenv("OTEL_BSP_MAX_EXPORT_BATCH_SIZE", "64"))
        tracer_provider = TracerProvider(resource=resource)
        tracer_provider.add_span_processor(
            BatchSpanProcessor(
                span_exporter,
                schedule_delay_millis=schedule_delay,
                max_export_batch_size=max_batch,
            )
        )
        trace.set_tracer_provider(tracer_provider)
        _tracer_provider = tracer_provider

        metric_interval = int(os.getenv("OTEL_METRIC_EXPORT_INTERVAL", "5000"))
        metric_exporter = OTLPMetricExporter(endpoint=f"{endpoint}/v1/metrics")
        metric_reader = PeriodicExportingMetricReader(
            metric_exporter,
            export_interval_millis=metric_interval,
        )
        meter_provider = MeterProvider(
            resource=resource,
            metric_readers=[metric_reader],
        )
        metrics.set_meter_provider(meter_provider)
        _meter_provider = meter_provider

        from opentelemetry.propagate import set_global_textmap
        from opentelemetry.trace.propagation.tracecontext import (
            TraceContextTextMapPropagator,
        )

        set_global_textmap(TraceContextTextMapPropagator())

        logger.info(
            "telemetry enabled service=%s endpoint=%s bsp_delay_ms=%s "
            "bsp_max_batch=%s metric_interval_ms=%s",
            name,
            endpoint,
            schedule_delay,
            max_batch,
            metric_interval,
        )
        return True
    except Exception:
        logger.exception("telemetry setup failed — continuing without OTel")
        return False


def instrument_fastapi(app) -> None:
    try:
        from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

        FastAPIInstrumentor.instrument_app(app, excluded_urls="health,metrics")
    except Exception:
        logger.exception("FastAPI instrumentation failed")


def instrument_httpx() -> None:
    try:
        from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor

        HTTPXClientInstrumentor().instrument()
    except Exception:
        logger.exception("httpx instrumentation failed")


def shutdown_telemetry() -> None:
    global _tracer_provider, _meter_provider
    for provider in (_tracer_provider, _meter_provider):
        if provider is None:
            continue
        try:
            provider.force_flush(timeout_millis=5000)
            provider.shutdown()
        except Exception:
            logger.exception("telemetry shutdown error")
    _tracer_provider = None
    _meter_provider = None


def get_tracer(name: str = "brevity-api"):
    from opentelemetry import trace

    return trace.get_tracer(name)


def get_meter(name: str = "brevity-api"):
    from opentelemetry import metrics

    return metrics.get_meter(name)
