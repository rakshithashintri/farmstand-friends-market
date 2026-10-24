# Roadmap — Farmer Marketplace Platform

Source: uploaded "Project Prompt: Farmer Marketplace Platform" + workspace follow-ups.

## Foundation
- [x] Read project brief; absorb follow-up requests
- [x] Enable Lovable Cloud (database + auth)
- [ ] Database schema: profiles, produce_listings, buyer_requests, offers, group_orders, contributions, orders, transactions, notifications + GRANTs + RLS
- [ ] Seed demo data incl. 500 kg tomato group-selling scenario (farmer 300 kg + 120 kg + 80 kg)
- [ ] Enable email/password auth

## User flows
- [ ] Separate onboarding for Farmers and Bulk Buyers (role tabs, profile fields)
- [ ] Separate Farmer dashboard and Buyer dashboard; Admin dashboard
- [ ] Farmer: add/manage produce listings (quantity, pricing, harvest date, delivery area, quality, image, availability)
- [ ] Buyer: browse/search produce with filters (crop, quantity, quality, price, location) + smart matching
- [ ] Buyer requests + matching results page
- [ ] Offers + net earnings comparison (Net = Total − Transport − Other costs)
- [ ] Group selling: detect shortage, find compatible farmers, combine contributions, farmer confirmation
- [ ] Offer negotiation: accept / counteroffer statuses (Pending, Accepted, Counteroffer, Rejected)
- [ ] Order lifecycle: inquiry → matching → quotation → confirmation → preparation → dispatch → delivery → completion; buyer confirms receipt
- [ ] Stage matrix: per-stage, per-role actions enforced on each order view (buyer / farmer / admin)
- [ ] Notification matrix: matches, quotations, confirmation, preparation, dispatch, delivery, inspection, payout (DB triggers)
- [ ] Smoke test: deployed buyer/farmer/admin order actions across lifecycle stages
- [ ] Verify order notification triggers fire correctly (retries/fallback: in-app notifications are DB-triggered and immediate)
- [ ] Transaction history page
- [ ] Notifications (in-app) for offers, counteroffers, confirmations, delivery updates
- [ ] Admin dashboard: users, listings, orders, disputes
- [ ] Profile & settings page

## Presentation
- [ ] Home page with intro + featured produce
- [ ] Green/white/earthy design system, responsive, clean cards/tables/status badges
- [ ] Demo scenario labeled as demonstration data
- [ ] README with setup + testing instructions; .env example (no secrets)
- [ ] Verify core flows end-to-end in preview
