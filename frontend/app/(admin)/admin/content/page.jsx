"use client";

import { useState } from "react";

const INITIAL_SECTIONS = [
  {
    id: "hero",
    title: "Homepage Hero",
    description: "Headline, tagline and hero image",
    updated: "Updated Apr 20, 2025",
    content: "Discover the Joy of Music — Master vocals, instruments, and rhythm with world-class faculty.",
  },
  {
    id: "about",
    title: "About Us",
    description: "Story, mission and achievements",
    updated: "Updated Apr 12, 2025",
    content: "Harmony Music School has been nurturing musical passion across classical and contemporary genres since 2012.",
  },
  {
    id: "classes",
    title: "Classes & Fees",
    description: "Course list, durations and pricing",
    updated: "Updated Apr 18, 2025",
    content: "Structured courses for Guitar, Piano, Tabla, Vocals, Violin, and Drums with flexible batches.",
  },
  {
    id: "teachers",
    title: "Teachers",
    description: "Instructor profiles and photos",
    updated: "Updated Mar 30, 2025",
    content: "Learn from accomplished performing artists with 10+ years of stage and academic experience.",
  },
  {
    id: "gallery",
    title: "Gallery",
    description: "Photos from classes and events",
    updated: "Updated Apr 22, 2025",
    content: "Annual concerts, studio jam sessions, student recitals, and workshop memories.",
  },
  {
    id: "contact",
    title: "Contact Info",
    description: "Phone, email, address and map",
    updated: "Updated Feb 14, 2025",
    content: "+91 98765 43210 | info@harmonymusicschool.com | 12 Kala Mandir Road, Pune",
  },
];

export default function ContentPage() {
  const [sections, setSections] = useState(INITIAL_SECTIONS);
  const [editingSection, setEditingSection] = useState(null);
  const [viewingSection, setViewingSection] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formContent, setFormContent] = useState("");

  const [addForm, setAddForm] = useState({
    title: "",
    description: "",
    content: "",
  });

  function handleOpenEdit(sec) {
    setEditingSection(sec);
    setFormTitle(sec.title);
    setFormDescription(sec.description);
    setFormContent(sec.content);
  }

  function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingSection) return;

    const todayStr = new Date().toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" });
    const updated = sections.map((s) =>
      s.id === editingSection.id
        ? { ...s, title: formTitle, description: formDescription, content: formContent, updated: `Updated ${todayStr}` }
        : s
    );

    setSections(updated);
    setEditingSection(null);
  }

  function handleAddSection(e) {
    e.preventDefault();
    const todayStr = new Date().toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" });
    const newSec = {
      id: `sec-${Date.now()}`,
      title: addForm.title,
      description: addForm.description,
      content: addForm.content,
      updated: `Updated ${todayStr}`,
    };

    // Prepend new section to the top!
    setSections([newSec, ...sections]);
    setShowAddModal(false);
    setAddForm({ title: "", description: "", content: "" });
  }

  function handleDeleteSection(id, title) {
    if (!confirm(`Are you sure you want to delete the "${title}" section?`)) return;
    setSections((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Website Content
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Edit content shown on the public website
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center rounded-xl bg-[#E11D48] px-5 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-[#BE123C] transition-colors cursor-pointer self-start sm:self-auto"
        >
          Add Section
        </button>
      </div>

      {/* Content Cards Stack */}
      <div className="space-y-4">
        {sections.map((sec) => (
          <div
            key={sec.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#F3E2EC] bg-white p-5 sm:px-6 shadow-xs hover:shadow-sm transition-shadow"
          >
            {/* Left: Section Icon & Text */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-[#FDEEF5] text-[#E11D48] flex items-center justify-center border border-[#F9EBF2]">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="font-serif text-base font-bold text-gray-900 leading-tight">
                  {sec.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {sec.description}
                </p>
              </div>
            </div>

            {/* Right: Updated Date & Actions Toolbar */}
            <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
              <span className="text-xs text-gray-400 font-medium">
                {sec.updated}
              </span>

              <div className="inline-flex items-center gap-1">
                {/* 1. View / Preview Icon */}
                <button
                  onClick={() => setViewingSection(sec)}
                  title="Preview Section"
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#E11D48] hover:bg-[#FDEEF5] transition-colors cursor-pointer"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>

                {/* 2. Edit Icon */}
                <button
                  onClick={() => handleOpenEdit(sec)}
                  title="Edit Section"
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#E11D48] hover:bg-[#FDEEF5] transition-colors cursor-pointer"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>

                {/* 3. Delete Icon */}
                <button
                  onClick={() => handleDeleteSection(sec.id, sec.title)}
                  title="Delete Section"
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#E11D48] hover:bg-[#FFE4E6] transition-colors cursor-pointer"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Content Modal */}
      {editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC]">
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-1">
              Edit Section: {editingSection.title}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Update text copy and information for the public website.
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Section Headline / Title
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description / Purpose
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Content / Copy
                </label>
                <textarea
                  rows={4}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#E11D48] px-4 py-2 text-sm font-medium text-white hover:bg-[#BE123C] cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Section Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC]">
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-1">
              Add New Website Section
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Add custom section blocks or announcements to the website.
            </p>

            <form onSubmit={handleAddSection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Section Title
                </label>
                <input
                  required
                  type="text"
                  value={addForm.title}
                  onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                  placeholder="e.g. Summer Camp 2025"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Short Description
                </label>
                <input
                  required
                  type="text"
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  placeholder="e.g. Special workshops and masterclasses"
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Content / Copy
                </label>
                <textarea
                  required
                  rows={4}
                  value={addForm.content}
                  onChange={(e) => setAddForm({ ...addForm, content: e.target.value })}
                  placeholder="Details, schedule, dates, and faculty..."
                  className="w-full rounded-xl border border-[#F3E2EC] px-3.5 py-2 text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#E11D48] px-4 py-2 text-sm font-medium text-white hover:bg-[#BE123C] cursor-pointer"
                >
                  Create Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Section Modal */}
      {viewingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-[#F3E2EC]">
            <div className="flex items-center justify-between border-b border-[#F3E2EC] pb-4 mb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-900">
                  {viewingSection.title}
                </h3>
                <p className="text-xs text-gray-500">{viewingSection.description}</p>
              </div>
              <span className="text-xs text-gray-400 font-mono">{viewingSection.updated}</span>
            </div>

            <div className="bg-[#FFF7FB] rounded-xl p-4 border border-[#F9EBF2] mb-5">
              <span className="text-xs text-gray-400 block mb-1 font-semibold uppercase tracking-wider">Preview Content</span>
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {viewingSection.content}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  handleOpenEdit(viewingSection);
                  setViewingSection(null);
                }}
                className="rounded-xl border border-[#F3E2EC] px-4 py-2 text-xs font-semibold text-gray-700 hover:text-[#E11D48] hover:bg-[#FFF7FB] cursor-pointer"
              >
                Edit Section
              </button>
              <button
                onClick={() => setViewingSection(null)}
                className="rounded-xl bg-[#18181B] px-4 py-2 text-xs font-semibold text-white hover:bg-black cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
