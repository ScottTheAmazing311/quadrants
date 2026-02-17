'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface QuestionSuggestion {
  id: string;
  prompt: string;
  label_left: string;
  label_right: string;
  submitted_by: string | null;
  times_used: number;
  created_at: string;
}

export default function AdminPage() {
  const [questions, setQuestions] = useState<QuestionSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    prompt: '',
    label_left: '',
    label_right: '',
    submitted_by: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    prompt: '',
    label_left: '',
    label_right: '',
    submitted_by: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('question_bank')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading questions:', error);
    } else if (data) {
      setQuestions(data as QuestionSuggestion[]);
    }
    setLoading(false);
  };

  const handleEdit = (question: QuestionSuggestion) => {
    setEditingId(question.id);
    setEditForm({
      prompt: question.prompt,
      label_left: question.label_left,
      label_right: question.label_right,
      submitted_by: question.submitted_by || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    const { error } = await supabase
      .from('question_bank')
      .update({
        prompt: editForm.prompt,
        label_left: editForm.label_left,
        label_right: editForm.label_right,
        submitted_by: editForm.submitted_by || null
      })
      .eq('id', editingId);

    if (error) {
      console.error('Error updating question:', error);
      alert('Failed to update question');
    } else {
      setEditingId(null);
      loadQuestions();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    const { error } = await supabase
      .from('question_bank')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question');
    } else {
      loadQuestions();
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedIds.size} question(s)?`)) return;

    const { error } = await supabase
      .from('question_bank')
      .delete()
      .in('id', Array.from(selectedIds));

    if (error) {
      console.error('Error deleting questions:', error);
      alert('Failed to delete questions');
    } else {
      setSelectedIds(new Set());
      loadQuestions();
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredQuestions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredQuestions.map(q => q.id)));
    }
  };

  const handleAdd = async () => {
    if (!addForm.prompt || !addForm.label_left || !addForm.label_right) {
      alert('Please fill in all required fields');
      return;
    }

    const { error } = await supabase
      .from('question_bank')
      .insert({
        prompt: addForm.prompt,
        label_left: addForm.label_left,
        label_right: addForm.label_right,
        submitted_by: addForm.submitted_by || null
      });

    if (error) {
      console.error('Error adding question:', error);
      alert('Failed to add question');
    } else {
      setShowAddForm(false);
      setAddForm({ prompt: '', label_left: '', label_right: '', submitted_by: '' });
      loadQuestions();
    }
  };

  const filteredQuestions = questions.filter(q =>
    q.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.label_left.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.label_right.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen industrial-base relative flex items-center justify-center">
        <div className="text-xl text-rust-primary font-bold uppercase tracking-wider">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen industrial-base relative py-16">
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="text-rust-primary hover:text-amber-secondary flex items-center gap-2 transition-colors mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
            <h1 className="text-5xl font-black text-white uppercase tracking-wider mb-2">
              Question Bank Admin
            </h1>
            <div className="h-1 w-32 bg-rust-primary mb-4"></div>
            <p className="text-[#b8b8d1]">
              Manage all questions in the suggestion bank
            </p>
          </div>
          <div className="flex gap-3">
            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-6 py-3 bg-amber-secondary texture-brushed text-black rounded-none font-bold uppercase text-sm tracking-wider hover:scale-105 transition-all"
                style={{
                  boxShadow: 'inset 0 1px 2px rgba(255, 152, 0, 0.2), inset 0 -1px 2px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.3)',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
                }}
              >
                Delete Selected ({selectedIds.size})
              </button>
            )}
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-burnt-orange texture-brushed text-black rounded-none font-bold uppercase text-sm tracking-wider hover:scale-105 transition-all"
              style={{
                boxShadow: 'inset 0 1px 2px rgba(255, 111, 60, 0.2), inset 0 -1px 2px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.3)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
              }}
            >
              + Add New Question
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions..."
            className="w-full px-4 py-3 bg-bg-warm-2 border-2 border-rust-primary/30 text-white rounded-none focus:border-rust-primary focus:outline-none transition-colors"
          />
        </div>

        {/* Stats and Select All */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="px-6 py-3 bg-bg-warm-2 border-2 border-rust-primary/30 rounded-none texture-concrete">
              <div className="text-2xl font-black text-rust-primary">{questions.length}</div>
              <div className="text-xs text-[#7a7a9e] uppercase tracking-wider">Total Questions</div>
            </div>
            <div className="px-6 py-3 bg-bg-warm-2 border-2 border-rust-primary/30 rounded-none texture-concrete">
              <div className="text-2xl font-black text-amber-secondary">{filteredQuestions.length}</div>
              <div className="text-xs text-[#7a7a9e] uppercase tracking-wider">Filtered Results</div>
            </div>
            {selectedIds.size > 0 && (
              <div className="px-6 py-3 bg-bg-warm-2 border-2 border-burnt-orange/50 rounded-none texture-concrete">
                <div className="text-2xl font-black text-burnt-orange">{selectedIds.size}</div>
                <div className="text-xs text-[#7a7a9e] uppercase tracking-wider">Selected</div>
              </div>
            )}
          </div>

          {filteredQuestions.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className="px-6 py-3 border-2 border-rust-primary text-rust-primary rounded-none font-bold uppercase text-xs tracking-wider hover:bg-rust-primary hover:text-black transition-all"
            >
              {selectedIds.size === filteredQuestions.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {/* Add Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="premium-card rounded-none p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-black text-white uppercase mb-6">Add New Question</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-[#7a7a9e] uppercase tracking-wider mb-2">
                    Question Prompt *
                  </label>
                  <textarea
                    value={addForm.prompt}
                    onChange={(e) => setAddForm({ ...addForm, prompt: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-bg-warm-1 border-2 border-rust-primary/30 text-white rounded-none focus:border-rust-primary focus:outline-none resize-none"
                    placeholder="e.g., How do you prefer to spend your weekend?"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#7a7a9e] uppercase tracking-wider mb-2">
                      Left Label (1-5) *
                    </label>
                    <input
                      type="text"
                      value={addForm.label_left}
                      onChange={(e) => setAddForm({ ...addForm, label_left: e.target.value })}
                      className="w-full px-4 py-3 bg-bg-warm-1 border-2 border-rust-primary/30 text-white rounded-none focus:border-rust-primary focus:outline-none"
                      placeholder="e.g., Out with friends"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#7a7a9e] uppercase tracking-wider mb-2">
                      Right Label (6-10) *
                    </label>
                    <input
                      type="text"
                      value={addForm.label_right}
                      onChange={(e) => setAddForm({ ...addForm, label_right: e.target.value })}
                      className="w-full px-4 py-3 bg-bg-warm-1 border-2 border-amber-secondary/30 text-white rounded-none focus:border-amber-secondary focus:outline-none"
                      placeholder="e.g., Alone at home"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7a7a9e] uppercase tracking-wider mb-2">
                    Submitted By
                  </label>
                  <input
                    type="text"
                    value={addForm.submitted_by}
                    onChange={(e) => setAddForm({ ...addForm, submitted_by: e.target.value })}
                    className="w-full px-4 py-3 bg-bg-warm-1 border-2 border-rust-primary/30 text-white rounded-none focus:border-rust-primary focus:outline-none"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAdd}
                  className="flex-1 py-3 bg-rust-primary texture-brushed text-black rounded-none font-bold uppercase text-sm tracking-wider hover:scale-105 transition-all"
                  style={{
                    boxShadow: 'inset 0 1px 2px rgba(255, 147, 65, 0.2), inset 0 -1px 2px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.3)',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  Add Question
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 border-2 border-steel-gray text-[#b8b8d1] rounded-none font-bold uppercase text-sm tracking-wider hover:border-rust-primary hover:text-rust-primary transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-20 premium-card rounded-none">
              <p className="text-[#b8b8d1] text-lg">No questions found</p>
            </div>
          ) : (
            filteredQuestions.map((question) => (
              <div key={question.id} className="premium-card rounded-none p-6">
                {editingId === question.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#7a7a9e] uppercase tracking-wider mb-2">
                        Question Prompt
                      </label>
                      <textarea
                        value={editForm.prompt}
                        onChange={(e) => setEditForm({ ...editForm, prompt: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-3 bg-bg-warm-1 border-2 border-rust-primary/30 text-white rounded-none focus:border-rust-primary focus:outline-none resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#7a7a9e] uppercase tracking-wider mb-2">
                          Left Label (1-5)
                        </label>
                        <input
                          type="text"
                          value={editForm.label_left}
                          onChange={(e) => setEditForm({ ...editForm, label_left: e.target.value })}
                          className="w-full px-4 py-3 bg-bg-warm-1 border-2 border-rust-primary/30 text-white rounded-none focus:border-rust-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#7a7a9e] uppercase tracking-wider mb-2">
                          Right Label (6-10)
                        </label>
                        <input
                          type="text"
                          value={editForm.label_right}
                          onChange={(e) => setEditForm({ ...editForm, label_right: e.target.value })}
                          className="w-full px-4 py-3 bg-bg-warm-1 border-2 border-amber-secondary/30 text-white rounded-none focus:border-amber-secondary focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#7a7a9e] uppercase tracking-wider mb-2">
                        Submitted By
                      </label>
                      <input
                        type="text"
                        value={editForm.submitted_by}
                        onChange={(e) => setEditForm({ ...editForm, submitted_by: e.target.value })}
                        className="w-full px-4 py-3 bg-bg-warm-1 border-2 border-rust-primary/30 text-white rounded-none focus:border-rust-primary focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleSaveEdit}
                        className="px-6 py-2 bg-rust-primary texture-brushed text-black rounded-none font-bold uppercase text-xs tracking-wider hover:scale-105 transition-all"
                        style={{
                          boxShadow: 'inset 0 1px 2px rgba(255, 147, 65, 0.2), inset 0 -1px 2px rgba(0, 0, 0, 0.3)',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-6 py-2 border-2 border-steel-gray text-[#b8b8d1] rounded-none font-bold uppercase text-xs tracking-wider hover:border-rust-primary hover:text-rust-primary transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedIds.has(question.id)}
                          onChange={() => toggleSelect(question.id)}
                          className="mt-1 w-5 h-5 text-rust-primary bg-bg-warm-1 border-2 border-rust-primary/30 rounded-none cursor-pointer"
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">
                            {question.prompt}
                          </h3>
                          <div className="flex gap-6 text-sm">
                            <div>
                              <span className="text-[#7a7a9e] uppercase tracking-wider text-xs">Left (1-5): </span>
                              <span className="text-rust-primary font-bold">{question.label_left}</span>
                            </div>
                            <div>
                              <span className="text-[#7a7a9e] uppercase tracking-wider text-xs">Right (6-10): </span>
                              <span className="text-amber-secondary font-bold">{question.label_right}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(question)}
                          className="px-4 py-2 border-2 border-rust-primary text-rust-primary rounded-none font-bold uppercase text-xs tracking-wider hover:bg-rust-primary hover:text-black transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(question.id)}
                          className="px-4 py-2 border-2 border-amber-secondary text-amber-secondary rounded-none font-bold uppercase text-xs tracking-wider hover:bg-amber-secondary hover:text-black transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#7a7a9e] pt-3 border-t border-rust-primary/20">
                      {question.submitted_by && (
                        <div>
                          <span className="uppercase tracking-wider">Submitted by: </span>
                          <span className="text-white">{question.submitted_by}</span>
                        </div>
                      )}
                      <div>
                        <span className="uppercase tracking-wider">Times Used: </span>
                        <span className="text-burnt-orange font-bold">{question.times_used || 0}</span>
                      </div>
                      <div>
                        <span className="uppercase tracking-wider">Added: </span>
                        <span className="text-white">{new Date(question.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
