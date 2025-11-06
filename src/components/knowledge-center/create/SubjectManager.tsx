'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { Subject } from '@/api/knowledge';

interface SubjectManagerProps {
  subjects: Subject[];
  onSubjectAdd: (subject: { name: string; description?: string }) => void;
  onSubjectUpdate: (id: string, subject: { name?: string; description?: string }) => void;
  onSubjectDelete: (id: string) => void;
  isAdding?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export default function SubjectManager({
  subjects,
  onSubjectAdd,
  onSubjectUpdate,
  onSubjectDelete,
  isAdding = false,
  isUpdating = false,
  isDeleting = false,
}: SubjectManagerProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState({ name: '', description: '' });
  const [editingSubject, setEditingSubject] = useState({ name: '', description: '' });

  const handleAddSubject = () => {
    if (newSubject.name.trim()) {
      onSubjectAdd(newSubject);
      setNewSubject({ name: '', description: '' });
      setIsAddingNew(false);
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingId(subject.id);
    setEditingSubject({ name: subject.name, description: subject.description || '' });
  };

  const handleUpdateSubject = () => {
    if (editingId && editingSubject.name.trim()) {
      onSubjectUpdate(editingId, editingSubject);
      setEditingId(null);
      setEditingSubject({ name: '', description: '' });
    }
  };

  const handleDeleteSubject = (id: string) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      onSubjectDelete(id);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingSubject({ name: '', description: '' });
  };

  const cancelAdd = () => {
    setIsAddingNew(false);
    setNewSubject({ name: '', description: '' });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Manage Subjects</h3>
        <button
          onClick={() => setIsAddingNew(true)}
          disabled={isAddingNew}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add Subject
        </button>
      </div>

      {/* Add new subject form */}
      {isAddingNew && (
        <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Subject Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newSubject.name}
              onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter subject name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              autoFocus
            />
          </div>  
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddSubject}
              disabled={!newSubject.name.trim() || isAdding}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {isAdding ? 'Adding...' : 'Add'}
            </button>
            <button
              onClick={cancelAdd}
              disabled={isAdding}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Subjects list */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className={`p-3 border rounded-lg transition-all ${
              editingId === subject.id
                ? 'border-blue-300 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            {editingId === subject.id ? (
              // Edit mode
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Subject Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingSubject.name}
                    onChange={(e) => setEditingSubject(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    autoFocus
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleUpdateSubject}
                    disabled={!editingSubject.name.trim() || isUpdating}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    {isUpdating ? 'Updating...' : 'Update'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={isUpdating}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View mode
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {subject.name}
                  </h4>
                </div>
                <div className="flex items-center gap-1 ml-3">
                  <button
                    onClick={() => handleEditSubject(subject)}
                    disabled={isUpdating}
                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                    title="Edit subject"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSubject(subject.id)}
                    disabled={isDeleting}
                    className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete subject"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {subjects.length === 0 && !isAddingNew && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No subjects available</p>
          <p className="text-xs mt-1">Add your first subject to get started</p>
        </div>
      )}
    </div>
  );
}