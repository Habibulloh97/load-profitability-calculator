## Three Layer Split (routes + controllers + services)

**Picked:** Routes define URLs, controllers handle HTTP, service hold busness logic

## Bcrypt for hashing

**Picked:** bcryptjs at saltRounds = 10
**Considered:** scrypt,argon2
**Why?** bcryptjs is classical standard in Node ecosystem and at saltRounds = 10 it's decent enough for current attack hardware. Can upgrade to argon2 if user volume emerges

## Auth: JWT in httpOnly cookie (vs localStorage)

**Picked:** JWT issued at login, stored in httpOnly cookie with sameSite=lax and secure in production.
**Considered:** localStorage (simpler frontend code, but vulnerable to XSS — any compromised script can exfiltrate the token).
**Why:** XSS is more common than CSRF. httpOnly defeats XSS-based token theft entirely. sameSite=lax mitigates CSRF for the same domain. Trade-off accepted: frontend can't read auth state directly, so I'll add a /me endpoint that the frontend calls to check auth.
