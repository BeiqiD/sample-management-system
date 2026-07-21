export function titleChangeAudit(previousTitle: string, nextTitle: string) {
  if (previousTitle === nextTitle) return null;
  return {
    body: `Sample name changed from ${previousTitle} to ${nextTitle}`,
    metadata: {
      action: "sample_details_updated",
      changes: { title: { from: previousTitle, to: nextTitle } },
    },
  } as const;
}
