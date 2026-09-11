---
title: Use Cloudflare R2 for Product Asset Storage
status: accepted
date: 2026-09-11
deciders: Engineering Team
consulted: Infrastructure Team
---

# Use Cloudflare R2 for Product Asset Storage

## Context

The system stores product images and videos that need to be served to customers on sales channels (Etsy, eBay, Shopify) and to employees in the dashboard. We need durable, scalable object storage with the following properties:

- **S3-compatible API** so we can use standard SDKs and tooling
- **No egress fees** — assets are served frequently and we want predictable costs
- **Presigned URL support** for secure, time-limited uploads directly from the browser
- **Global edge delivery** for fast image loads on the storefront

## Decision

We will use Cloudflare R2 as the primary asset store.

- Backend and task worker interact with R2 via its S3-compatible API using `boto3` (or `aioboto3` for async)
- Uploads use short-lived presigned URLs so images go directly from browser to R2 without passing through the backend
- Public delivery uses a Cloudflare custom domain backed by the R2 bucket
- The database stores only asset metadata (object key, content type, dimensions) — never the binary data

## Consequences

**Positive:**
- No egress charges when assets are served through Cloudflare's edge
- S3-compatible means we use familiar tooling and can switch providers if needed
- Presigned uploads keep asset traffic off the application server

**Negative:**
- R2 has a smaller ecosystem than AWS S3 (fewer SDK integrations, less community tooling)
- Cold start latency on presigned URL generation if the backend needs to fetch credentials on first request

**Neutral:**
- Account ID, bucket name, endpoint, access key, and secret are managed via environment-specific `.env` files — consistent with the rest of the project's secret management pattern

## Alternatives Considered

- **AWS S3** — Fully featured but egress costs would be significant for high-volume image delivery
- **Local filesystem** — Doesn't scale across multiple backend replicas and adds complexity to container orchestration
- **Postgres large objects** — Would bloat the database and make CDN delivery difficult