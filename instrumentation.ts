// Runs once when the Next.js server starts (before any request is served).
export async function register() {
  // The import must sit INSIDE this `if` (not behind an early `return`): webpack only drops the branch for the
  // edge runtime when it is wrapped in the condition, otherwise it still tries to bundle node:dns for the edge
  // and `next dev --webpack` answers every request with a 500. Turbopack handles both forms.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { prepareMongoUri } = await import("./lib/mongo-uri");
    await prepareMongoUri();
  }
}
