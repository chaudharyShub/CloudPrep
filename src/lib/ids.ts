/** A fresh random 32-bit seed for a new session. Domain code receives seeds; it never creates them. */
export function newSeed(): number {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0] ?? 1;
}

/** A unique id for sessions and records. */
export function newId(): string {
  return crypto.randomUUID();
}
