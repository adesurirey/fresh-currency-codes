# Deprecated currencies are kept forever, frozen at last-seen state

When a currency disappears from the upstream SIX-Group list, we flag it `active: false` but keep the record with whatever fields it had at its last appearance — never updating it again unless the currency reappears (at which point the new upstream record replaces it entirely). The deprecated set grows monotonically (currently ~13 entries).

Alternatives considered: drop deprecated entries entirely (loses the ability to look up old transaction data) and maintain a `history[]` array per currency (over-engineered for the lookup-only use case). The "frozen snapshot" semantics mean consumers can rely on a stable identity for a deprecated record across versions, while accepting that no historical timeline is captured.
