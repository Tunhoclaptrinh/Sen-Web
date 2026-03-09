# GA4 Funnel Report Mapping (SEN Mobile + Web)

Last updated: 2026-03-09
Primary audience: Marketing, Product, BI

Data sources:
- Mobile app (Firebase Analytics): `../App/src/services/analytics.service.ts`
- Web app (GA4 via react-ga4): `src/utils/analytics.ts`

## 1. Standard Mapping: Event -> KPI -> Source Screens

| Funnel Stage | Event Name | KPI (Marketing) | KPI Definition (GA4) | Source Screens / Pages |
| --- | --- | --- | --- | --- |
| Content Discovery | `view_product` | Product Detail Views | Event count of `view_product` | Mobile: `HeritageDetailScreen`, `ArtifactDetailScreen`, `ExhibitionDetailScreen`, `ArticleDetailScreen`.<br>Web: `HeritageDetailPage`, `ArtifactDetailPage`, `ExhibitionDetailPage`, `HistoryDetailPage`. |
| Content Save Intent | `add_to_cart` | Collection Saves | Event count of `add_to_cart` (recommended filter: `cart_type = collection`) | Mobile: `AddToCollectionModal`.<br>Web: `AddToCollectionModal`. |
| Monetization Intent | `begin_checkout` | Purchase Intent Starts | Event count of `begin_checkout` | Mobile: `GameHomeScreen` (chapter unlock).<br>Web: `ShopPage` (shop item purchase + AI character purchase). |
| Monetization Conversion | `purchase` | Successful Purchases | Event count of `purchase`; optional value KPI: sum(`value`) by `currency` | Mobile: `GameHomeScreen` (chapter unlock success).<br>Web: `ShopPage` (shop item success + AI character success). |
| Gameplay Success | `complete_level` | Level Completions | Event count of `complete_level`; pass KPI: count where `passed = 1` / total `complete_level` | Mobile: `GamePlayPage` (on finished session).<br>Web: `GamePlayPage` (on completion flow). |
| AI Engagement | `chat_ai_started` | AI Chat Starts | Event count of `chat_ai_started` | Mobile: `AIChatScreen`, `AIChatModal`.<br>Web: `AIChat` overlay component. |

## 2. Recommended KPI Formulas (Ready for Reports)

- `content_save_rate` = `add_to_cart` / `view_product`
- `checkout_to_purchase_rate` = `purchase` / `begin_checkout`
- `level_pass_rate` = `complete_level` (where `passed = 1`) / `complete_level` (all)
- `ai_context_share` = `chat_ai_started` (where `has_context = true`) / `chat_ai_started` (all)

## 3. Parameter Dictionary (Use as Report Dimensions)

| Event | Main Parameters | Notes |
| --- | --- | --- |
| `view_product` | `item_id`, `item_name`, `item_type`, `source_screen` | Core dimensions for content interest by content type and source page. |
| `add_to_cart` | `item_id`, `item_type`, `quantity`, `cart_type`, `cart_id` | In this product, this means "save to collection", not ecommerce cart. |
| `begin_checkout` | `item_id`, `item_name`, `item_type`, `value`, `currency`, `checkout_type` | Represents virtual economy checkout intent. |
| `purchase` | `item_id`, `item_name`, `item_type`, `transaction_id`, `value`, `currency` | Represents successful virtual transactions. |
| `complete_level` | `level_id`, `chapter_id`, `score`, `points_earned`, `passed` | Use `passed` for quality KPI, and score/points for performance segmentation. |
| `chat_ai_started` | `source`, `has_context` | Tracks AI entry points and context usage. |

## 4. Source Value Standards (for Breakdowns)

Use these values directly in GA4 breakdown/filter.

- `view_product.source_screen`
- `HeritageDetailScreen`, `ArtifactDetailScreen`, `ExhibitionDetailScreen`, `ArticleDetailScreen`
- `HeritageDetailPage`, `ArtifactDetailPage`, `ExhibitionDetailPage`, `HistoryDetailPage`

- `chat_ai_started.source`
- `ai_chat_screen`, `ai_chat_modal`, `gameplay_chat_overlay`, `ai_chat_overlay`

- `begin_checkout.checkout_type`
- `chapter_unlock`, `shop_item_purchase`, `ai_character_purchase`

## 5. Suggested Funnel Reports for Marketing

- Report A: Content Engagement Funnel
- Step 1: `view_product`
- Step 2: `add_to_cart` (filter `cart_type = collection`)
- Main KPI: `content_save_rate`

- Report B: Game Economy Conversion Funnel
- Step 1: `begin_checkout`
- Step 2: `purchase`
- Main KPI: `checkout_to_purchase_rate`
- Recommended breakdowns: `item_type`, `checkout_type`, `currency`

- Report C: Gameplay Outcome Funnel
- Step 1: `complete_level`
- Quality KPI: `level_pass_rate`
- Recommended breakdowns: `chapter_id`, `level_id`

- Report D: AI Adoption Funnel
- Step 1: `chat_ai_started`
- Main KPI: AI starts per active user, plus `ai_context_share`
- Recommended breakdown: `source`

## 6. Interpretation Notes

- `add_to_cart` in this project means "saved to collection" behavior.
- `purchase` is virtual economy conversion (petals/coins), not external payment gateway revenue.
- For cross-platform comparison, segment by stream/platform in GA4.
