## Three Layer Split (routes + controllers + services) 

**Picked:** Routes define URLs, controllers handle HTTP, service hold busness logic

## Bcrypt for hashing

**Picked:** bcryptjs at saltRounds = 10
**Considered:** scrypt,argon2
**Why?** bcryptjs is classical standard in Node ecosystem and at saltRounds = 10 it's decent enough for current attack hardware. Can upgrade to argon2 if user volume emerges
