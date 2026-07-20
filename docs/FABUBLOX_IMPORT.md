# FabuBlox browser import

The importer is format-aware for FabuBlox OOXML workbooks. It is not presented as a universal Excel importer.

## Parsing contract

1. SheetJS reads resolved cell values and locates known headers by normalized labels.
2. JSZip opens the OPC package.
3. `workbook.xml` and its relationships resolve the selected worksheet part.
4. The worksheet relationship resolves its drawing part.
5. Drawing relationships resolve each embedded image relationship to its media part.
6. `oneCellAnchor` and `twoCellAnchor` coordinates map drawings to source rows.
7. Images outside the detected layer-stack column or without a matching step remain unassigned and produce visible warnings.

Media filenames are never used to infer step order. Resolved shared-string values are used instead of raw shared-string indices.

## Preview and confirmation

The preview shows the detected sheet, object kind, structured step fields, layer-stack thumbnails, unassigned images, and warnings. Nothing is uploaded before confirmation.

Confirmation sends one multipart request containing:

- the original workbook;
- a schema-versioned normalized manifest;
- compressed extracted images keyed by local image ID.

The Worker creates a pending import, stores workbook/manifest/images in R2, writes an immutable template version and normalized steps/assets to D1, and only then marks the import ready. Pending and failed imports are hidden from template assignment.

## Test strategy

- Generated fixtures verify header detection, relationship-based media resolution, `oneCellAnchor`/`twoCellAnchor`, deliberately reordered media filenames, and unassigned-image warnings.
- Real workbooks remain private local fixtures and are never committed to the public repository.
