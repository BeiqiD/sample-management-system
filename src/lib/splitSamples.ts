import type { SampleDetail, SampleStatus, SplitSamplePieceInput } from "../../shared/types";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function nextChildNumber(parentCode: string, childCodes: string[]) {
  const pattern = new RegExp(`^${escapeRegExp(parentCode)}-(\\d+)$`);
  return childCodes.reduce((highest, code) => {
    const match = pattern.exec(code);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0) + 1;
}

export function createSplitPieceDrafts(
  sample: Pick<SampleDetail, "code" | "title" | "description" | "children">,
  count: number,
  location: string,
): SplitSamplePieceInput[] {
  const firstNumber = nextChildNumber(sample.code, sample.children.map((child) => child.code));
  return Array.from({ length: count }, (_, index) => ({
    code: `${sample.code}-${firstNumber + index}`,
    title: sample.title,
    description: sample.description || "",
    location,
    status: "stored" as SampleStatus,
  }));
}
