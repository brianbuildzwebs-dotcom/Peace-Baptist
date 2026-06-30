import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, X, GripVertical, Download } from "lucide-react";
import { base44 } from "@/api/base44Client";

const fieldTypes = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Phone" },
  { value: "number", label: "Number" },
  { value: "textarea", label: "Text Area" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
  { value: "date", label: "Date" },
  { value: "signature", label: "Signature Pad" },
];

const formTypes = ["event_registration", "membership", "volunteer", "baptism", "general", "ministry_signup"];

export default function AdminForms() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formType, setFormType] = useState("general");
  const [fields, setFields] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [viewingSubs, setViewingSubs] = useState(null);

  const loadForms = () => {
    base44.entities.CustomForm.list("-created_date", 50)
      .then(setForms)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(loadForms, []);

  const addField = () => {
    setFields([...fields, { label: "", type: "text", required: false, options: [], placeholder: "" }]);
  };

  const updateField = (i, key, val) => {
    const updated = [...fields];
    updated[i] = { ...updated[i], [key]: val };
    setFields(updated);
  };

  const removeField = (i) => setFields(fields.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    const data = { title, description, fields, form_type: formType, status: "active" };
    if (editing) {
      await base44.entities.CustomForm.update(editing, data);
    } else {
      await base44.entities.CustomForm.create(data);
    }
    setShowBuilder(false);
    setEditing(null);
    resetBuilder();
    loadForms();
  };

  const resetBuilder = () => { setTitle(""); setDescription(""); setFormType("general"); setFields([]); };

  const openEdit = (form) => {
    setTitle(form.title); setDescription(form.description || ""); setFormType(form.form_type || "general");
    setFields(form.fields || []);
    setEditing(form.id);
    setShowBuilder(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this form?")) {
      await base44.entities.CustomForm.delete(id);
      loadForms();
    }
  };

  const viewSubmissions = async (form) => {
    const subs = await base44.entities.FormSubmission.filter({ form_id: form.id }, "-created_date", 50);
    setSubmissions(subs);
    setViewingSubs(form);
  };

  const exportCSV = () => {
    if (submissions.length === 0) return;
    const allKeys = new Set();
    submissions.forEach(s => { if (s.data) Object.keys(s.data).forEach(k => allKeys.add(k)); });
    const keys = ["submitter_name", "submitter_email", ...allKeys, "created_date"];
    const header = keys.join(",");
    const rows = submissions.map(s => keys.map(k => {
      let val = k === "submitter_name" ? s.submitter_name : k === "submitter_email" ? s.submitter_email : k === "created_date" ? s.created_date : s.data?.[k];
      return `"${String(val || "").replace(/"/g, '""')}"`;
    }).join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${viewingSubs.title}-submissions.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-heading text-xl font-bold">Custom Forms Builder</h2>
        <button onClick={() => { setShowBuilder(true); setEditing(null); resetBuilder(); }} className="flex items-center gap-2 px-4 py-2 bg-gold text-navy font-semibold rounded-xl text-sm hover:bg-gold-light transition-colors">
          <Plus size={16} /> Create Form
        </button>
      </div>

      {loading ? (
        <div className="text-white/30 text-center py-12">Loading...</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {forms.map((form) => (
            <div key={form.id} className="bg-white/5 rounded-xl p-5 border border-white/5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold">{form.title}</h3>
                  <span className="text-xs text-gold capitalize">{form.form_type?.replace(/_/g, " ")}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${form.status === "active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                  {form.status}
                </span>
              </div>
              <p className="text-white/40 text-sm mb-3">{form.fields?.length || 0} fields</p>
              <div className="flex items-center gap-2">
                <button onClick={() => viewSubmissions(form)} className="flex items-center gap-1 px-3 py-1.5 text-xs text-white/40 hover:text-blue-400 bg-white/5 rounded-lg hover:bg-white/10"><Eye size={13} /> Submissions</button>
                <button onClick={() => openEdit(form)} className="flex items-center gap-1 px-3 py-1.5 text-xs text-white/40 hover:text-gold bg-white/5 rounded-lg hover:bg-white/10"><Edit2 size={13} /> Edit</button>
                <button onClick={() => handleDelete(form.id)} className="flex items-center gap-1 px-3 py-1.5 text-xs text-white/40 hover:text-red-400 bg-white/5 rounded-lg hover:bg-white/10"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
          {forms.length === 0 && <div className="col-span-2 text-white/30 text-center py-12">No forms yet. Create your first form!</div>}
        </div>
      )}

      {/* Form Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-heading font-bold text-lg">{editing ? "Edit Form" : "New Form"}</h3>
              <button onClick={() => setShowBuilder(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <input placeholder="Form Title *" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-gold text-sm" />
              <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-gold text-sm" />
              <select value={formType} onChange={(e) => setFormType(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white outline-none focus:border-gold text-sm">
                {formTypes.map((t) => <option key={t} value={t} className="bg-[#1E293B]">{t.replace(/_/g, " ")}</option>)}
              </select>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium text-sm">Form Fields</h4>
                  <button onClick={addField} className="flex items-center gap-1 px-3 py-1.5 bg-gold/20 text-gold rounded-lg text-xs font-medium hover:bg-gold/30">
                    <Plus size={13} /> Add Field
                  </button>
                </div>
                <div className="space-y-3">
                  {fields.map((field, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <div className="flex items-center gap-3 mb-3">
                        <GripVertical size={14} className="text-white/20" />
                        <input placeholder="Field Label" value={field.label} onChange={(e) => updateField(i, "label", e.target.value)} className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-sm outline-none focus:border-gold placeholder:text-white/30" />
                        <select value={field.type} onChange={(e) => updateField(i, "type", e.target.value)} className="px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-sm outline-none focus:border-gold">
                          {fieldTypes.map((t) => <option key={t.value} value={t.value} className="bg-[#1E293B]">{t.label}</option>)}
                        </select>
                        <button onClick={() => removeField(i)} className="text-white/30 hover:text-red-400"><Trash2 size={14} /></button>
                      </div>
                      <div className="flex items-center gap-4 ml-7">
                        <label className="flex items-center gap-1 text-white/40 text-xs cursor-pointer">
                          <input type="checkbox" checked={field.required} onChange={(e) => updateField(i, "required", e.target.checked)} className="rounded border-white/20 text-gold focus:ring-gold bg-white/10" />
                          Required
                        </label>
                        {field.type === "select" && (
                          <input placeholder="Options (comma-separated)" value={(field.options || []).join(", ")} onChange={(e) => updateField(i, "options", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} className="flex-1 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-white text-xs outline-none focus:border-gold placeholder:text-white/30" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={handleSave} disabled={!title} className="w-full py-3 bg-gold text-navy font-bold rounded-xl hover:bg-gold-light transition-colors disabled:opacity-50">
                {editing ? "Update Form" : "Create Form"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submissions Modal */}
      {viewingSubs && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-heading font-bold text-lg">Submissions: {viewingSubs.title}</h3>
              <div className="flex items-center gap-2">
                <button onClick={exportCSV} className="flex items-center gap-1 px-3 py-1.5 bg-gold/20 text-gold rounded-lg text-xs font-medium hover:bg-gold/30">
                  <Download size={13} /> Export CSV
                </button>
                <button onClick={() => setViewingSubs(null)} className="text-white/40 hover:text-white"><X size={20} /></button>
              </div>
            </div>
            {submissions.length === 0 ? (
              <p className="text-white/30 text-center py-8">No submissions yet.</p>
            ) : (
              <div className="space-y-3">
                {submissions.map((s) => (
                  <div key={s.id} className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white font-medium text-sm">{s.submitter_name || "Anonymous"}</div>
                      <div className="text-white/30 text-xs">{s.created_date && new Date(s.created_date).toLocaleDateString()}</div>
                    </div>
                    <div className="text-white/40 text-xs mb-2">{s.submitter_email}</div>
                    {s.data && Object.entries(s.data).filter(([k]) => k !== 'name' && k !== 'email').map(([k, v]) => (
                      <div key={k} className="text-white/50 text-xs py-0.5"><span className="text-white/30">{k}:</span> {String(v)}</div>
                    ))}
                    {s.signature_url && <img src={s.signature_url} alt="Signature" className="h-12 mt-2 rounded border border-white/10" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}