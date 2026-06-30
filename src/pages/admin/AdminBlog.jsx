import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Upload, Eye } from "lucide-react";
import { base44 } from "@/api/base44Client";

const categories = ["announcement", "devotional", "news", "event_recap", "testimony"];

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", content: "", excerpt: "", image_url: "", author: "", category: "announcement", status: "draft", published_date: "" });

  const load = () => {
    base44.entities.BlogPost.list("-created_date", 50).then(setPosts).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSave = async () => {
    if (editing) { await base44.entities.BlogPost.update(editing, form); }
    else { await base44.entities.BlogPost.create(form); }
    setShowForm(false); setEditing(null);
    setForm({ title: "", content: "", excerpt: "", image_url: "", author: "", category: "announcement", status: "draft", published_date: "" });
    load();
  };

  const handleDelete = async (id) => { if (confirm("Delete?")) { await base44.entities.BlogPost.delete(id); load(); } };

  const openEdit = (p) => {
    setForm({ title: p.title || "", content: p.content || "", excerpt: p.excerpt || "", image_url: p.image_url || "", author: p.author || "", category: p.category || "announcement", status: p.status || "draft", published_date: p.published_date || "" });
    setEditing(p.id); setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm({ ...form, image_url: file_url });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-heading text-xl font-bold">Blog & Announcements</h2>
        <button onClick={() => { setShowForm(true); setEditing(null); }} className="flex items-center gap-2 px-4 py-2 bg-gold text-navy font-semibold rounded-xl text-sm hover:bg-gold-light">
          <Plus size={16} /> New Post
        </button>
      </div>

      {loading ? (
        <div className="text-white/30 text-center py-12">Loading...</div>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <div key={p.id} className="bg-white/5 rounded-xl p-4 flex items-center gap-4 border border-white/5">
              {p.image_url && <img src={p.image_url} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm">{p.title}</h3>
                <div className="text-white/40 text-xs">{p.author} · {p.category}</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${p.status === "published" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>{p.status}</span>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(p)} className="p-2 text-white/40 hover:text-gold rounded-lg hover:bg-white/5"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(p.id)} className="p-2 text-white/40 hover:text-red-400 rounded-lg hover:bg-white/5"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {posts.length === 0 && <div className="text-white/30 text-center py-12">No blog posts yet.</div>}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-heading font-bold text-lg">{editing ? "Edit Post" : "New Post"}</h3>
              <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <input placeholder="Post Title *" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-gold text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Author" value={form.author} onChange={(e) => setForm({...form, author: e.target.value})} className="px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-gold text-sm" />
                <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white outline-none focus:border-gold text-sm">
                  {categories.map(c => <option key={c} value={c} className="bg-[#1E293B]">{c}</option>)}
                </select>
              </div>
              <textarea placeholder="Excerpt (short summary)" rows={2} value={form.excerpt} onChange={(e) => setForm({...form, excerpt: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-gold text-sm" />
              <textarea placeholder="Content *" rows={8} value={form.content} onChange={(e) => setForm({...form, content: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-gold text-sm" />
              <div>
                <label className="text-white/60 text-xs mb-2 block">Cover Image</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-white/60 text-sm cursor-pointer hover:bg-white/20">
                    <Upload size={14} /> Upload
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {form.image_url && <img src={form.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white outline-none focus:border-gold text-sm">
                  <option value="draft" className="bg-[#1E293B]">Draft</option>
                  <option value="published" className="bg-[#1E293B]">Published</option>
                </select>
                <input type="date" value={form.published_date} onChange={(e) => setForm({...form, published_date: e.target.value})} className="px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white outline-none focus:border-gold text-sm" />
              </div>
              <button onClick={handleSave} disabled={!form.title || !form.content} className="w-full py-3 bg-gold text-navy font-bold rounded-xl hover:bg-gold-light disabled:opacity-50">
                {editing ? "Update Post" : "Create Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}