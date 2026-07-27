import React, { useState } from "react";
import { ListTodo, CheckCircle2, Plus, Trash2, BookOpen } from "lucide-react";
import { StorageEngine } from "../../lib/storage";
import { Task, Note } from "../../types";
import { CharacterArtImage } from "../GeneratedArt";

interface TasksAndNotesViewProps {
  onXpChange: (delta: number) => void;
}

export const TasksAndNotesView: React.FC<TasksAndNotesViewProps> = ({ onXpChange }) => {
  const [activeTab, setActiveTab] = useState<"tasks" | "notes">("tasks");
  const [tasks, setTasks] = useState<Task[]>(StorageEngine.getTasks());
  const [notes, setNotes] = useState<Note[]>(StorageEngine.getNotes());

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskCat] = useState("Academic");

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  const toggleTask = (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    setTasks(updated);
    StorageEngine.setTasks(updated);
    onXpChange(10);
  };

  const handleDeleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this task? This cannot be undone.")) return;
    setTasks(StorageEngine.deleteTask(id));
  };

  const handleDeleteNote = (id: string) => {
    if (!confirm("Delete this note? This cannot be undone.")) return;
    setNotes(StorageEngine.deleteNote(id));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;
    const newTask: Task = {
      id: "t_" + Date.now(),
      title: taskTitle,
      category: taskCat,
      completed: false,
      priority: "Medium",
      dueDate: new Date().toISOString().split("T")[0],
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    StorageEngine.setTasks(updated);
    setShowTaskModal(false);
    setTaskTitle("");
    onXpChange(10);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle) return;
    const newNote: Note = {
      id: "n_" + Date.now(),
      title: noteTitle,
      content: noteContent,
      category: "General",
      folder: "Personal",
      tags: ["QuickNote"],
      updatedAt: new Date().toISOString().split("T")[0],
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    StorageEngine.setNotes(updated);
    setShowNoteModal(false);
    setNoteTitle("");
    setNoteContent("");
    onXpChange(10);
  };

  return (
    <div className="space-y-6 pb-12 text-[#2D2D2A]">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 bg-white p-5 sm:p-7 rounded-[32px] border border-[#EBE9E1] shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
          <div className="w-14 h-14 sm:w-20 sm:h-20 shrink-0 rounded-2xl bg-[#F1EFEC] border border-[#EBE9E1] p-1 flex items-center justify-center overflow-hidden shadow-xs">
            <CharacterArtImage type="tasks" className="w-full h-full" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-2xl font-serif italic text-[#2D2D2A] leading-tight">
              Tasks & Markdown Notes Engine
            </h2>
            <p className="text-xs text-[#6B6A65] mt-1 leading-normal">
              Organize daily to-dos, recurring checklists, folders, tags, and voice note memos.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-[#F1EFEC] p-1 rounded-2xl border border-[#EBE9E1] text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab("tasks")}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "tasks" ? "bg-[#5A6A5A] text-white shadow-xs" : "text-[#6B6A65] hover:text-[#2D2D2A]"
            }`}
          >
            Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "notes" ? "bg-[#5A6A5A] text-white shadow-xs" : "text-[#6B6A65] hover:text-[#2D2D2A]"
            }`}
          >
            Notes ({notes.length})
          </button>
        </div>
      </div>

      {/* TASKS VIEW */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-serif italic font-bold text-[#2D2D2A]">Tasks Checklist</h3>
            <button
              onClick={() => setShowTaskModal(true)}
              className="px-4 py-2 rounded-2xl bg-[#5A6A5A] hover:bg-[#4f5f4f] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>

          {tasks.length === 0 ? (
            <div className="p-8 text-center bg-white border border-[#EBE9E1] rounded-[28px] space-y-3">
              <CheckCircle2 className="w-8 h-8 mx-auto text-[#5A6A5A]/50" />
              <div className="text-sm font-serif italic font-bold text-[#2D2D2A]">All Tasks Completed!</div>
              <p className="text-xs text-[#6B6A65]">Add your daily priority tasks and action items to stay on top of your schedule.</p>
              <button
                onClick={() => setShowTaskModal(true)}
                className="px-4 py-2 rounded-2xl bg-[#5A6A5A] hover:bg-[#4f5f4f] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Task</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => toggleTask(t.id)}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    t.completed
                      ? "bg-[#F1EFEC] border-[#EBE9E1] text-[#6B6A65] line-through"
                      : "bg-white border-[#EBE9E1] text-[#2D2D2A] hover:border-[#5A6A5A]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className={`w-4 h-4 ${t.completed ? "text-[#5A6A5A]" : "text-[#EBE9E1]"}`} />
                    <div>
                      <div className="text-xs font-semibold">{t.title}</div>
                      <div className="text-[10px] text-[#6B6A65]">Due: {t.dueDate}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#F1EFEC] text-[#5A6A5A] font-semibold">
                      {t.category}
                    </span>
                    <button
                      onClick={(e) => handleDeleteTask(t.id, e)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* NOTES VIEW */}
      {activeTab === "notes" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-serif italic font-bold text-[#2D2D2A]">Markdown Vault Notes</h3>
            <button
              onClick={() => setShowNoteModal(true)}
              className="px-4 py-2 rounded-2xl bg-[#5A6A5A] hover:bg-[#4f5f4f] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Note</span>
            </button>
          </div>

          {notes.length === 0 ? (
            <div className="p-8 text-center bg-white border border-[#EBE9E1] rounded-[28px] space-y-3">
              <BookOpen className="w-8 h-8 mx-auto text-[#B07D62]/60" />
              <div className="text-sm font-serif italic font-bold text-[#2D2D2A]">No Vault Notes</div>
              <p className="text-xs text-[#6B6A65]">Write markdown notes, personal thoughts, and structured knowledge docs.</p>
              <button
                onClick={() => setShowNoteModal(true)}
                className="px-4 py-2 rounded-2xl bg-[#5A6A5A] hover:bg-[#4f5f4f] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First Note</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes.map((n) => (
              <div key={n.id} className="p-6 rounded-[28px] bg-white border border-[#EBE9E1] space-y-2 shadow-xs relative">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-serif italic font-bold text-[#2D2D2A]">{n.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#B07D62]/10 text-[#B07D62] font-semibold border border-[#B07D62]/20 uppercase tracking-wider">
                      {n.folder}
                    </span>
                    <button
                      onClick={() => handleDeleteNote(n.id)}
                      className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-[#6B6A65] leading-relaxed whitespace-pre-line">{n.content}</p>
                <div className="flex items-center justify-between text-[10px] text-[#6B6A65] pt-2 border-t border-[#EBE9E1]">
                  <span>Updated: {n.updatedAt}</span>
                  <span className="text-[#5A6A5A] font-semibold">#{n.tags.join(" #")}</span>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-[32px] bg-white border border-[#EBE9E1] space-y-4 shadow-xl">
            <h3 className="text-xl font-serif italic font-bold text-[#2D2D2A]">Add Task</h3>
            <form onSubmit={handleAddTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#6B6A65] font-semibold mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete System Design Assignment"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-[#F1EFEC] border border-[#EBE9E1] rounded-2xl px-3 py-2 text-[#2D2D2A]"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="w-1/2 py-2.5 rounded-2xl bg-[#F1EFEC] text-[#2D2D2A] hover:bg-[#EBE9E1] font-semibold border border-[#EBE9E1]"
                >
                  Cancel
                </button>
                <button type="submit" className="w-1/2 py-2.5 rounded-2xl bg-[#5A6A5A] hover:bg-[#4f5f4f] text-white font-semibold shadow-xs">
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-[32px] bg-white border border-[#EBE9E1] space-y-4 shadow-xl">
            <h3 className="text-xl font-serif italic font-bold text-[#2D2D2A]">Create Markdown Note</h3>
            <form onSubmit={handleAddNote} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#6B6A65] font-semibold mb-1">Note Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Life OS Architecture Strategy"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full bg-[#F1EFEC] border border-[#EBE9E1] rounded-2xl px-3 py-2 text-[#2D2D2A]"
                />
              </div>
              <div>
                <label className="block text-[#6B6A65] font-semibold mb-1">Markdown Content</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write note details..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full bg-[#F1EFEC] border border-[#EBE9E1] rounded-2xl px-3 py-2 text-[#2D2D2A]"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="w-1/2 py-2.5 rounded-2xl bg-[#F1EFEC] text-[#2D2D2A] hover:bg-[#EBE9E1] font-semibold border border-[#EBE9E1]"
                >
                  Cancel
                </button>
                <button type="submit" className="w-1/2 py-2.5 rounded-2xl bg-[#5A6A5A] hover:bg-[#4f5f4f] text-white font-semibold shadow-xs">
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
