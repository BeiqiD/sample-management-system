import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { SampleDetail, SampleEvent } from "../../shared/types";
import { ConfirmDeleteDialog } from "../components/ConfirmDeleteDialog";
import { SampleTimeline } from "../components/SampleTimeline";
import { StatusPill } from "../components/StatusPill";
import { api } from "../lib/api";
import { filterSampleHistory, sampleEventCategory, type SampleHistoryFilter } from "../lib/sampleHistory";

const historyFilters: Array<{ value: SampleHistoryFilter; label: string }> = [
  { value: "all", label: "All activity" },
  { value: "notes", label: "Notes" },
  { value: "processing", label: "Processing" },
  { value: "sample", label: "Sample changes" },
];

export function SampleTimelinePage() {
  const { sampleId = "" } = useParams();
  const [sample, setSample] = useState<SampleDetail | null>(null);
  const [filter, setFilter] = useState<SampleHistoryFilter>("all");
  const [error, setError] = useState("");
  const [recordToDelete, setRecordToDelete] = useState<SampleEvent | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<SampleEvent | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      setSample(await api.getSample(sampleId));
      setError("");
    } catch (error) { setError((error as Error).message); }
  }, [sampleId]);

  useEffect(() => { void load(); }, [load]);

  const counts = useMemo(() => {
    const result = { all: sample?.events.length ?? 0, notes: 0, processing: 0, sample: 0 };
    for (const event of sample?.events ?? []) result[sampleEventCategory(event)] += 1;
    return result;
  }, [sample]);

  async function deleteRecord() {
    if (!sample || !recordToDelete) return;
    setDeleting(true); setDeleteError("");
    try {
      await api.deleteSampleRecord(sample.id, recordToDelete.id);
      setRecordToDelete(null);
      await load();
    } catch (error) { setDeleteError((error as Error).message); }
    finally { setDeleting(false); }
  }

  async function deleteAsset() {
    if (!sample || !assetToDelete) return;
    setDeleting(true); setDeleteError("");
    try {
      await api.deleteEventAsset(sample.id, assetToDelete.id);
      setAssetToDelete(null);
      await load();
    } catch (error) { setDeleteError((error as Error).message); }
    finally { setDeleting(false); }
  }

  if (!sample) return <div className="page"><p>{error || "Loading timeline…"}</p></div>;
  const visibleEvents = filterSampleHistory(sample.events, filter);

  return <div className="page sample-timeline-page">
    <Link className="back-link" to={`/samples/${sample.id}`}>← {sample.code}</Link>
    <div className="sample-header">
      <div className="sample-header-copy">
        <p className="eyebrow">Timeline · {sample.code}</p>
        <h1>{sample.title}</h1>
        <p className="lead">The complete audit history for this sample, including normal processing, confirmations, notes, and changes.</p>
      </div>
      <div className="header-actions"><StatusPill status={sample.status} /><Link className="button" to={`/samples/${sample.id}`}>Open sample</Link></div>
    </div>
    {error && <p className="error-banner">{error}</p>}

    <div className="timeline-page-toolbar">
      <div className="segmented-control timeline-filters" aria-label="Timeline filters">
        {historyFilters.map((option) => <button
          type="button"
          className={filter === option.value ? "selected" : ""}
          aria-pressed={filter === option.value}
          onClick={() => setFilter(option.value)}
          key={option.value}
        >{option.label}<span>{counts[option.value]}</span></button>)}
      </div>
      <p>{visibleEvents.length} {visibleEvents.length === 1 ? "entry" : "entries"}</p>
    </div>

    <section className="card timeline-page-card">
      <SampleTimeline
        events={visibleEvents}
        onDeleteRecord={(event) => { setDeleteError(""); setRecordToDelete(event); }}
        onDeleteAsset={(event) => { setDeleteError(""); setAssetToDelete(event); }}
      />
    </section>

    {recordToDelete && <ConfirmDeleteDialog
      title="Delete this sample note?"
      description="The note will disappear from Notes & observations, while the Timeline will retain a deletion audit entry."
      summary={recordToDelete.body?.trim() || (recordToDelete.assetKey ? "Photo observation" : "Empty note")}
      deleting={deleting}
      error={deleteError}
      eyebrow="Delete note"
      confirmLabel="Delete note"
      onCancel={() => { setRecordToDelete(null); setDeleteError(""); }}
      onConfirm={() => void deleteRecord()}
    />}
    {assetToDelete && <ConfirmDeleteDialog
      title="Delete this image attachment?"
      description="The image will be detached from its source record. The Timeline will retain a text-only audit entry."
      summary={assetToDelete.body?.trim() || "Image attachment"}
      deleting={deleting}
      error={deleteError}
      eyebrow="Delete image"
      confirmLabel="Delete image"
      onCancel={() => { setAssetToDelete(null); setDeleteError(""); }}
      onConfirm={() => void deleteAsset()}
    />}
  </div>;
}
