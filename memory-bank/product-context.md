# Thrift Store Sales Channel Manager Tool

*This project is meant to show a near-complete stack for a web application.*

Arbitrary Thrift Store Chain is a chain of several thrift stores across the US that also list select products on various sales channels (e.g. Etsy, Ebay, Shopify.)  It has come to their attention that they need a centralized sales channel management system to allow them to list their products on multiple channels in an automated manner.

## Key Concepts

- **Product** &mdash; A physical item in inventory with photos, a description, a SKU, and a price. Products live in the central catalog and are not tied to any specific sales channel.
- **Listing** &mdash; A product published to a specific sales channel (Etsy, eBay, Shopify, etc.). One product can have multiple listings across different channels.
- **Channel plugin** &mdash; A pluggable adapter that translates the internal product representation into the API shape expected by a single sales channel.
- **Agent batch** &mdash; A queued background job that uses an LLM agent to propose improved descriptions or pricing for a set of products. Employees review agent suggestions before they take effect.

## Key Features

- Allows listing items on multiple sales channels simultaneously
    - Sales channels can be added later, where individual channels are treated as plugins
- Automatically disables listings on all channels a product is listed on when an item is sold out
- Has batch processing for:
    - Agent-improved product descriptions, has a review process for these descriptions
    - Agent-suggested pricing
    - Bulk product pricing and data updates
    - Report generation
- Central storage of product assets (e.g. images, videos) using Cloudflare R2
- Employee-facing interface for managing products
- Employee-facing dashboard with information about products, what's working, and what needs attention
- Allows live track of listing views outside of sales channel data via a 1px by 1px transparent png

## Key Workflows

### 1. Adding a New Product and Listing It

1. An employee photographs an item and uploads the images through the dashboard.
2. The employee fills in a basic form (title, category, condition, measurements, initial price).
3. The system stores the images in Cloudflare R2 and saves the product record in Postgres.
4. Immediately, a background agent job is queued to generate a richer description and a suggested price.
5. When the agent job completes, a notification appears on the employee's dashboard for review.
6. The employee reviews the agent suggestion, accepts, edits, or rejects it.
7. Once the product is finalized, the employee selects one or more sales channels to publish to, and the system creates listings via the corresponding channel plugins.

### 2. Cross-Channel Inventory Sync (Sold Out)

1. A product sells on any one channel (e.g. Etsy).
2. The channel plugin detects the sale or receives a webhook and marks the listing as sold.
3. The backend automatically disables all other listings for that product across every channel.
4. The product is marked as sold in the central catalog.
5. Employees see the updated status on the dashboard immediately.

### 3. Batch Description / Pricing Review

1. An employee selects a group of products from the dashboard (e.g. "all unsold items in the Electronics category added this month").
2. The employee queues an agent-improved descriptions batch and/or an agent-suggested pricing batch.
3. The task worker processes each product through the LLM agent and stores the suggestions.
4. The employee sees a review queue across all pending agent suggestions.
5. For each suggestion, the employee can accept, edit, or reject it with one click.
6. Accepted changes are applied to the product record and, if already listed, are pushed to the corresponding sales channels.

### 4. Dashboard Daily Check-In

1. An employee opens the dashboard and sees a summary: total active products, recently added, recently sold, pending agent reviews, and flagged listings (e.g. pricing outliers, low stock).
2. The employee can drill into each section to see detailed lists and take action (e.g. review a suggestion, update pricing, re-photograph an item).
3. The dashboard also shows listing view counts collected from the tracking pixel, giving a rough sense of which products are getting attention even before they sell.

## User Personas

### Customer

Customers discover the store's products through search engines or social media. They land on a product detail page served by the web storefront (a NextJS app), which directs them to the appropriate sales channel (Etsy, eBay, Shopify) to complete the purchase.

- **Goals**: Find interesting items, see accurate photos and descriptions, and buy with confidence.
- **Pain points**: Inconsistent or missing descriptions, stale pricing, out-of-stock items that still appear listed.
- **Relationship to the system**: Indirect — they interact only with the sales channels and the storefront; the system keeps those channels accurate.

### Employee (Store Associate / Manager)

Employees are the primary users of the system. They work in one or more physical stores and are responsible for the end-to-end lifecycle of a product: from intake and photography through listing, monitoring, and marking items as sold.

- **Goals**: Get products listed quickly and accurately across all relevant channels, review agent suggestions efficiently, keep inventory in sync, and spot underperforming listings.
- **Pain points**: Manually listing the same product on multiple sites today; tracking what needs attention (pending reviews, sold-but-still-listed items, pricing outliers); writing compelling descriptions for every item.
- **Relationship to the system**: Primary operators — they use the employee dashboard daily to manage products, listings, and agent batch jobs.

## Non-Goals / Out of Scope

- **Direct-to-consumer checkout** &mdash; The web storefront does not process payments; all purchases are completed on the external sales channels.
- **Inventory receiving / supply chain** &mdash; This system does not track purchase orders, donations intake, or physical inventory arriving at the back door.
- **Point of sale (POS) integration** &mdash; In-store POS transactions are handled by a separate system.
- **Customer accounts** &mdash; There is no customer-facing login; the storefront is anonymous/public.
- **Full-text CMS** &mdash; Product content is structured (title, category, condition, measurements, description), not a free-form content management system.
- **Multi-language / localization** &mdash; The system is English-only for the foreseeable future.

## Related Docs

| File | Reason |
|------|--------|
|[architecture.md](./architecture.md)|Project architecture, stack, and infrastructure|
|[project-structure.md](./project-structure.md)|Directory structure mapped to architecture components|
|[specs/](./specs/README.md)|Project specs — includes the [build plan](./specs/01-process-build-plan.md)|
|[decisions/](./decisions/README.md)|ADRs for this project — includes the [R2 storage decision](./decisions/01-use-cloudflare-r2-for-asset-storage.md)|
