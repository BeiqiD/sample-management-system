import { DOMParser } from "@xmldom/xmldom";
import JSZip from "jszip";
import { beforeAll, describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { parseFabuBloxWorkbook } from "./fabublox";

beforeAll(() => {
  Object.defineProperty(globalThis, "DOMParser", { value: DOMParser, configurable: true });
});

const transparentPng = Uint8Array.from(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAHnOcQAAAAABJRU5ErkJggg==", "base64"));

async function syntheticDrawingFixture() {
  const workbook = XLSX.utils.book_new();
  const rows = [
    ["Step #", "Step Name", "Tool Name", "Parameters", "Comments", null, null, null, null, "Layer Stacks"],
    [0, "Coat", "Spinner", "4000 rpm", null],
    [1, "Develop", null, "30 s", null],
  ];
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), "Synthetic");
  const base = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  const zip = await JSZip.loadAsync(base);
  const worksheetPath = "xl/worksheets/sheet1.xml";
  let worksheet = await zip.file(worksheetPath)!.async("text");
  worksheet = worksheet.replace("</worksheet>", '<drawing r:id="rIdDrawing"/></worksheet>');
  zip.file(worksheetPath, worksheet);
  zip.file("xl/worksheets/_rels/sheet1.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      <Relationship Id="rIdDrawing" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/>
    </Relationships>`);
  const anchor = (row: number, relationshipId: string) => `<xdr:twoCellAnchor>
    <xdr:from><xdr:col>9</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${row}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>
    <xdr:to><xdr:col>10</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${row + 1}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to>
    <xdr:pic><xdr:blipFill><a:blip r:embed="${relationshipId}"/></xdr:blipFill></xdr:pic><xdr:clientData/>
  </xdr:twoCellAnchor>`;
  zip.file("xl/drawings/drawing1.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
      ${anchor(1, "rImageA")}${anchor(2, "rImageB")}${anchor(8, "rUnassigned")}
    </xdr:wsDr>`);
  zip.file("xl/drawings/_rels/drawing1.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      <Relationship Id="rImageA" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image9.png"/>
      <Relationship Id="rImageB" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image1.png"/>
      <Relationship Id="rUnassigned" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image5.png"/>
    </Relationships>`);
  zip.file("xl/media/image1.png", transparentPng);
  zip.file("xl/media/image5.png", transparentPng);
  zip.file("xl/media/image9.png", transparentPng);
  return new File([await zip.generateAsync({ type: "uint8array" })], "synthetic.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

describe("OOXML drawing relationships", () => {
  it("supports twoCellAnchor and does not trust media filename order", async () => {
    const preview = await parseFabuBloxWorkbook(await syntheticDrawingFixture());
    expect(preview.steps).toHaveLength(2);
    expect(preview.images.map((image) => image.sourcePart)).toEqual([
      "xl/media/image9.png",
      "xl/media/image1.png",
      "xl/media/image5.png",
    ]);
    expect(preview.steps[0].imageIds).toEqual(["image-1"]);
    expect(preview.steps[1].imageIds).toEqual(["image-2"]);
    expect(preview.unassignedImageIds).toEqual(["image-3"]);
  });
});
