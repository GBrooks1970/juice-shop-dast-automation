// The single, fixed target for the confirmation lane.
//
// SAFETY (design note §7 — non-negotiable): the exploit scenarios run ONLY against the locally
// booted, pinned Juice Shop. The base URL is read from an env var solely so the same scenarios can
// run against the container whether it is reached via the host port (local) or a service name (CI);
// it defaults to localhost and MUST only ever point at a Juice Shop instance we started ourselves.
// Do not point this at any host you do not own — Juice Shop is an intentionally vulnerable target
// and these scenarios actively exploit it.

export const TARGET_BASE_URL = process.env.JUICE_SHOP_URL ?? 'http://localhost:3000';
