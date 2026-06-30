import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, User, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.BlogPost.filter({ status: "published" }, "-published_date", 20)
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="navy-gradient pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-gold text-xs font-bold tracking-[0.3em] uppercase">Blog</span>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mt-4 mb-4">News & Announcements</h1>
            <p className="text-white/60 text-lg max-w-xl">Stay updated with church news, devotionals, and upcoming announcements.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">No blog posts yet. Add posts from the admin dashboard.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, i) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group"
                >
                  {post.image_url && (
                    <div className="h-48 overflow-hidden">
                      <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  )}
                  <div className="p-6">
                    {post.category && (
                      <span className="text-xs font-bold text-gold uppercase tracking-wider">{post.category}</span>
                    )}
                    <h2 className="font-heading text-xl font-bold text-navy mt-2 mb-3 group-hover:text-gold transition-colors">{post.title}</h2>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">{post.excerpt || post.content?.substring(0, 150)}</p>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center gap-3">
                        {post.author && <span className="flex items-center gap-1"><User size={13} />{post.author}</span>}
                        {post.published_date && <span className="flex items-center gap-1"><Calendar size={13} />{format(new Date(post.published_date), "MMM d, yyyy")}</span>}
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}