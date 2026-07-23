import { DOMParser } from "@xmldom/xmldom";
import JSZip from "jszip";
import { beforeAll, describe, expect, it } from "vitest";
import { parseFabuBloxWorkbook } from "./fabublox";

beforeAll(() => {
  Object.defineProperty(globalThis, "DOMParser", { value: DOMParser, configurable: true });
});

const transparentPng = Uint8Array.from(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAHnOcQAAAAABJRU5ErkJggg==", "base64"));

async function syntheticDrawingFixture(initialName = "Substrate Stack", duplicateInitial = false) {
  const zip = new JSZip();
  zip.file("xl/workbook.xml", `<?xml version="1.0" encoding="UTF-8"?>
    <workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
      <sheets><sheet name="Synthetic" sheetId="1" r:id="rSheet1"/></sheets>
    </workbook>`);
  zip.file("xl/_rels/workbook.xml.rels", `<?xml version="1.0" encoding="UTF-8"?>
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      <Relationship Id="rSheet1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
    </Relationships>`);
  zip.file("xl/sharedStrings.xml", `<?xml version="1.0" encoding="UTF-8"?>
    <sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
      <si><t>Step #</t></si><si><t>Step Name</t></si>
    </sst>`);
  const worksheetPath = "xl/worksheets/sheet1.xml";
  zip.file(worksheetPath, `<?xml version="1.0" encoding="UTF-8"?>
    <worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
      <sheetData>
        <row r="1">
          <c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c>
          <c r="C1" t="inlineStr"><is><t>Tool Name</t></is></c><c r="D1" t="inlineStr"><is><t>Parameters</t></is></c>
          <c r="E1" t="inlineStr"><is><t>Comments</t></is></c><c r="J1" t="inlineStr"><is><t>Layer Stacks</t></is></c>
        </row>
        <row r="2"><c r="A2"><v>0</v></c><c r="B2" t="inlineStr"><is><t>${initialName}</t></is></c><c r="D2" t="inlineStr"><is><t>SOI / 2 µm BOX</t></is></c></row>
        <row r="3"><c r="A3"><v>1</v></c><c r="B3" t="inlineStr"><is><t>Coat</t></is></c><c r="C3" t="inlineStr"><is><t>Spinner</t></is></c><c r="D3" t="inlineStr"><is><t>4000 rpm</t></is></c></row>
        <row r="4"><c r="A4"><v>2</v></c><c r="B4" t="inlineStr"><is><t>Develop</t></is></c><c r="D4" t="inlineStr"><is><t>30 s</t></is></c></row>
        ${duplicateInitial ? '<row r="5"><c r="A5"><v>0</v></c><c r="B5" t="inlineStr"><is><t>Substrate Stack</t></is></c></row>' : ""}
      </sheetData>
      <drawing r:id="rIdDrawing"/>
    </worksheet>`);
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
      ${anchor(1, "rInitial")}${anchor(2, "rImageA")}${anchor(3, "rImageB")}${anchor(8, "rUnassigned")}
    </xdr:wsDr>`);
  zip.file("xl/drawings/_rels/drawing1.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      <Relationship Id="rInitial" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/initial.png"/>
      <Relationship Id="rImageA" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image9.png"/>
      <Relationship Id="rImageB" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image1.png"/>
      <Relationship Id="rUnassigned" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image5.png"/>
    </Relationships>`);
  zip.file("xl/media/initial.png", transparentPng);
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
      "xl/media/initial.png",
      "xl/media/image9.png",
      "xl/media/image1.png",
      "xl/media/image5.png",
    ]);
    expect(preview.initialSubstrateStep?.name).toBe("Substrate Stack");
    expect(preview.initialSubstrateStep?.parametersText).toBe("SOI / 2 µm BOX");
    expect(preview.initialStateImageIds).toEqual(["image-1"]);
    expect(preview.steps[0].imageIds).toEqual(["image-2"]);
    expect(preview.steps[1].imageIds).toEqual(["image-3"]);
    expect(preview.steps.map((step) => step.name)).toEqual(["Coat", "Develop"]);
    expect(preview.unassignedImageIds).toEqual(["image-4"]);
  });

  it("does not guess an initial substrate from a differently named Step 0", async () => {
    const preview = await parseFabuBloxWorkbook(await syntheticDrawingFixture("Coat"));
    expect(preview.initialSubstrateStep).toBeNull();
    expect(preview.initialStateImageIds).toEqual([]);
    expect(preview.steps.map((step) => step.name)).toEqual(["Coat", "Coat", "Develop"]);
    expect(preview.warnings).toContainEqual(expect.objectContaining({ code: "missing_initial_substrate_step" }));
  });

  it("does not choose between duplicate Step 0 substrate definitions", async () => {
    const preview = await parseFabuBloxWorkbook(await syntheticDrawingFixture("Substrate Stack", true));
    expect(preview.initialSubstrateStep).toBeNull();
    expect(preview.initialStateImageIds).toEqual([]);
    expect(preview.steps).toHaveLength(4);
    expect(preview.warnings).toContainEqual(expect.objectContaining({ code: "ambiguous_initial_substrate_step" }));
  });
});
