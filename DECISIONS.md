# DECISIONS.md

This document captures the architectural and product decisions made during the build.
Each entry follows: what I picked, what I considered, why.

---

## Three-layer split: routes + controllers + services

**Picked:** Routes define URLs, controllers handle HTTP I/O, services hold business logic.
**Considered:** Inline logic in routes (faster), or routes + controllers only (less ceremony for small handlers).
**Why:** Pattern I'm comfortable with from previous MERN work. Switching mid-project costs more than the slight over-engineering of small services.

---

## Auth: bcryptjs for password hashing

**Picked:** bcryptjs at saltRounds=10.
**Considered:** scrypt (built into Node, but verbose API), argon2 (newer OWASP recommendation, but native version has deploy issues on free-tier hosts and pure-JS version is significantly slower).
**Why:** bcryptjs is the most-recognized choice in Node ecosystems with a clean API. saltRounds=10 is the standard and provides good resistance against current attack hardware. If user volume or security requirements grew, argon2 would be the natural next step — migration path is straightforward (write new hashes with argon2, verify old ones with bcrypt during a transition window).

---

## Auth: JWT in httpOnly cookie (vs localStorage)

**Picked:** JWT issued at login, stored in httpOnly cookie with sameSite=lax and secure in production.
**Considered:** localStorage (simpler frontend code, but vulnerable to XSS — any compromised script can exfiltrate the token).
**Why:** XSS is more common than CSRF. httpOnly defeats XSS-based token theft entirely. sameSite=lax mitigates CSRF for the same domain. Trade-off accepted: frontend can't read auth state directly, so /me endpoint exists for the frontend to check auth status.

---

## Auth: requireAuth middleware re-fetches user from DB

**Picked:** Middleware verifies JWT, then queries User.findById(payload.id) before attaching to req.user.
**Considered:** Trust the JWT payload alone — skip the DB query for performance.
**Why:** Token is valid for 7 days. A user could be deleted, banned, or have their role changed in that window. Re-fetching keeps req.user in sync with the source of truth. Cost: one extra DB query per protected request — acceptable trade.

---

## Auth UI: ProtectedRoute pattern with /me check

**Picked:** A wrapper component that hits GET /api/auth/me on mount, then either renders children, redirects to /login, or shows nothing while loading.
**Considered:** Storing auth state in React Context (knows status across the app without re-fetching). Rejected for now — adds complexity without value at this scale, and re-fetching /me on protected route mount is the source of truth anyway.
**Why:** Backend cookie is httpOnly so JS can't inspect it directly. /me is the only way to verify the cookie is valid. ProtectedRoute centralizes that check so individual pages don't repeat it.

---

## Product scope: simplified from original spec

**Picked:** Single dispatcher role, no owner-op mode toggle, focused on the per-load decision flow.
**Considered:** Full original spec with owner-op + dispatcher dual personas, role toggle in nav, dual dashboard views.
**Why:** Mapped against the actual user workflow — dispatchers send loads to drivers, currently via Google Maps screenshots. Dual-persona was over-scope for a v1 portfolio. Simpler product, sharper interview narrative ("I built the tool that replaces the Google Maps screenshot workflow").

---

## Schema: dispatch and maintenance rates live on User

**Picked:** dispatchRates and maintenanceRates fields on the User document, structured as { company, lease, ownerOp }. Driver records hold only name and type. Calc engine looks up rates from User by Driver.type at calc time.
**Considered:** Per-driver pay configuration (different percentage per driver record).
**Why:** In real-world dispatch, percentages are set company-wide, not per-driver. Lease drivers have higher percentages because of company policy, not individual negotiation. Storing rates on User keeps the data model honest — change company policy in one place, applies to all drivers of that type.

---

## Schema: Driver references Truck, not the other way around

**Picked:** Truck has no driverId. Driver has truckId pointing to current truck.
**Considered:** Truck has driverId (more intuitive: "this truck has a driver").
**Why:** Drivers churn. Trucks are stable assets. If Truck.driverId existed, every driver departure would either rewrite the truck record (breaking historical loads) or create a new truck (worse). Modeling the relationship in the direction of churn — many Drivers over time pointing at one stable Truck — preserves history correctly. Owner-op edge case (driver brings their own truck) handled by deleting both Driver and Truck when they leave.

---

## Schema: Load doesn't store truckId

**Picked:** Load stores driverId. Truck reachable via driver.truckId at query time.
**Considered:** Storing truckId on Load (denormalized, faster reads).
**Why:** A single source of truth for "which truck did this driver use." If Driver.truckId changes (driver reassigned to a new truck mid-week), historical loads still resolve correctly through the driver. No drift between two stored fields.

---

## Schema: weekOf is computed at query time, not stored

**Picked:** Aggregate weekly load data using Mongo's $dateTrunc on createdAt at query time.
**Considered:** Store weekOf as a snapshot field on Load for cheaper queries.
**Why:** weekOf is fully derivable from createdAt. Storing it creates two sources of truth that can drift (timezone bugs, manual edits). Aggregation cost is small at portfolio scale. If load volume grew significantly, an indexed snapshot field would be worth revisiting.

---

## Schema: fuelPricePerGallon snapshotted on Load, breakdown denormalized

**Picked:** Capture fuelPricePerGallon on Load (input snapshot). Capture full breakdown object on Load (output snapshot).
**Considered:** Recompute breakdown on every read using current truck/driver values.
**Why:** Fuel prices change daily, sometimes hourly. Maintenance and dispatch rates can change as company policy evolves. The load was decided at a specific moment with specific numbers — that historical correctness is the entire point of the breakdown field. Recomputing on read would silently change historical profit numbers when current policy shifts. Read performance is also better with snapshots: list views don't need to look up Truck and Driver per row.

---

## Schema: Load status is a state machine

**Picked:** status: "draft" | "accepted" | "sent". driverId is conditionally required: optional on draft, required on accepted/sent (enforced at the schema level via Mongoose validator function).
**Considered:** Always require driverId, ignore the calc-without-driver use case.
**Why:** Quick load evaluation is the core UX — dispatchers need to see profit math in seconds, before committing to a driver. Forcing driver assignment at calc time breaks the flow. The conditional required field encodes the workflow rule at the data layer, so the rule can't be bypassed by adding a new endpoint that forgets to validate.

---

## Tolls: manual entry in v1, TollGuru API deferred to v2

**Picked:** tollsEstimate is a manual numeric input on Load, defaults to 0.
**Considered:** TollGuru API integration ($80/month minimum at the Starter tier).
**Why:** The schema field shape is identical whether the value comes from a form or an API call, so the v2 swap is straightforward. Manual entry is honest — dispatchers running the same routes weekly already know roughly what tolls cost. Avoiding the $80/month subscription pre-revenue is the right call for a portfolio. Pricing scales reasonably ($0.016 per route at the Starter tier) when revenue justifies it.

---

## Dialog: single instance for create and editDialog: single instance for create and edit

**Picked:** One Dialog controlled by selectedTruck state — null means create mode, populated means edit mode.
**Considered:** Two separate Dialogs, separate page routes (/trucks/new, /trucks/:id/edit), inline cell editing.
**Why:** Single Dialog means one formData and one formError — no risk of two state trees drifting out of sync. Separate routes lose list context and add unnecessary navigation for a two-field form. Inline editing complicates validation. One Dialog, one truth.

## Excluded from v1

These features were considered and explicitly cut:

- **Detention pay logic** — real but rare in dispatch; adds state machine complexity for marginal value
- **Driver ready status** — real-time fleet visibility belongs to a fleet ops tool, not a load calculator
- **Upcoming loads queue per driver** — scheduling view is a different product
- **Auto-fill driver location from last delivery** — small UX win, scoped for v1.5
- **Live load progress tracking** — ELD-adjacent, out of v1 scope entirely
- **Aggregated weekly fleet financials (insurance, lease)** — fleet-level costs don't belong in per-load math; would mislead the per-load profit number. v2 would add a separate Expenses collection
- **Driver dropdown during initial calc** — scrolling 100+ drivers under time pressure breaks the core "decisions in seconds" UX. Driver selection is deferred to the accept step

---

## v2 backlog

Features the spec excluded but are real for a sellable product:

- TollGuru API for accurate toll estimates
- Driver ready status / availability dashboard
- Upcoming loads queue per driver
- Auto-fill driver location from last load's delivery
- Aggregated fleet financials (insurance, lease, permits — non-load expenses on a separate Expenses collection)
- Real-time load progress tracking
- PDF/SMS load summary export to send to drivers
- Saved-broker list with payment history
