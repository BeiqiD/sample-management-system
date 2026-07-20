import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { SampleDetail } from "../../shared/types";
import { StatusPill } from "../components/StatusPill";
import { RunChecklist } from "../components/RunChecklist";
import { api, type TemplateRecord } from "../lib/api";
import { exportSample } from "../lib/exportSample";
import { compressCommentImage } from "../lib/images";

export function SamplePage() {
  const { sampleId = "" } = useParams();
  const [sample, setSample] = useState<SampleDetail | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [templateVersionId, setTemplateVersionId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const load = useCallback(() => api.getSample(sampleId).then(setSample).catch((error: Error) => setError(error.message)), [sampleId]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { api.listTemplates().then(({ templates }) => setTemplates(templates)).catch((error: Error) => setError(error.message)); }, []);

  async function assignTemplate() {
    if (!templateVersionId) return;
    setAssigning(true); setError("");
    try { await api.assignTemplate(sampleId, templateVersionId); setTemplateVersionId(""); await load(); }
    catch (error) { setError((error as Error).message); }
    finally { setAssigning(false); }
  }

  async function addComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const body = String(data.get("body") || "").trim();
    const image = fileRef.current?.files?.[0];
    if (!body && !image) return;
    setSaving(true);
    try {
      let assetKey: string | undefined;
      let thumbnailKey: string | undefined;
      if (image) {
        const compressed = await compressCommentImage(image);
        [assetKey, thumbnailKey] = await Promise.all([
          api.uploadAsset(compressed.main, compressed.main.name).then((result) => result.key),
          api.uploadAsset(compressed.thumbnail, compressed.thumbnail.name).then((result) => result.key),
        ]);
      }
      await api.createEvent(sampleId, { kind: image ? "image" : "comment", body, assetKey, metadata: thumbnailKey ? { thumbnailKey } : {} });
      form.reset();
      await load();
    } catch (error) { setError((error as Error).message); }
    finally { setSaving(false); }
  }

  if (!sample) return <div className="page"><p>{error || "Loading sample…"}</p></div>;
  return <div className="page sample-page">
    <Link className="back-link" to="/">← Samples</Link>
    <div className="sample-header">
      <div><p className="eyebrow">{sample.code}</p><h1>{sample.title}</h1><p className="lead">{sample.description || "No description"}</p></div>
      <div className="header-actions"><StatusPill status={sample.status} /><button className="button" disabled={exporting} onClick={() => {
        setExporting(true);
        void exportSample(sample).catch((error: Error) => setError(error.message)).finally(() => setExporting(false));
      }}>{exporting ? "Exporting…" : "Export ZIP"}</button></div>
    </div>
    <div className="detail-grid">
      <aside className="card facts">
        <h2>Details</h2>
        <dl><dt>Location</dt><dd>{sample.location || "—"}</dd><dt>Parent</dt><dd>{sample.parent ? <Link to={`/samples/${sample.parent.id}`}>{sample.parent.code}</Link> : "—"}</dd><dt>Children</dt><dd>{sample.children.length ? sample.children.map((child) => <Link key={child.id} to={`/samples/${child.id}`}>{child.code}</Link>) : "—"}</dd><dt>Created</dt><dd>{new Date(sample.createdAt).toLocaleString()}</dd></dl>
      </aside>
      <section>
        <div className="card assign-template"><div><strong>Assign a template</strong><small>Creates an independent run-step checklist.</small></div><select value={templateVersionId} onChange={(event) => setTemplateVersionId(event.target.value)}><option value="">Choose process, module, or recipe…</option>{templates.map((template) => <option key={template.id} value={template.id}>{template.name} · {template.templateType} v{template.version} · {template.stepCount} steps</option>)}</select><button className="button" disabled={!templateVersionId || assigning} onClick={() => void assignTemplate()}>{assigning ? "Assigning…" : "Assign"}</button></div>
        {sample.runs.length > 0 && <section className="runs-section"><h2>Runs</h2>{sample.runs.map((run) => <RunChecklist key={run.id} sampleId={sampleId} run={run} onSaved={load} />)}</section>}
        <form className="card composer" onSubmit={addComment}>
          <label>Add a record<textarea name="body" rows={3} placeholder="Comment, observation, or step note…" /></label>
          <div className="composer-actions"><input ref={fileRef} name="image" type="file" accept="image/*" capture="environment" /><button className="button primary" disabled={saving}>{saving ? "Saving…" : "Add to timeline"}</button></div>
        </form>
        {error && <p className="error-banner">{error}</p>}
        <div className="timeline">
          {sample.events.map((event) => <article className="event" key={event.id}>
            <div className="event-dot" />
            <div className="event-content"><div className="event-meta"><span>{event.kind}</span><time>{new Date(event.createdAt).toLocaleString()}</time></div>{event.body && <p>{event.body}</p>}{event.assetKey && <a href={`/api/assets/${event.assetKey}`} target="_blank" rel="noreferrer"><img src={`/api/assets/${typeof event.metadata.thumbnailKey === "string" ? event.metadata.thumbnailKey : event.assetKey}`} alt={event.body || "Sample record"} loading="lazy" /></a>}</div>
          </article>)}
        </div>
      </section>
    </div>
  </div>;
}
