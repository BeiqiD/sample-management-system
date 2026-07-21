export function parameterEntryCount(value: string | null | undefined) {
  return (value || "").split(/\r?\n/).filter((line) => line.trim()).length;
}
