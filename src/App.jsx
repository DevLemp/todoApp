import React, { useState, useEffect, useRef } from "react";
import "./App.css";

export default function App() {
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem("tasks");
        return saved ? JSON.parse(saved) : [];
    });

    const [newTask, setNewTask] = useState("");
    const [newCategory, setNewCategory] = useState("General");
    const [filter, setFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editingText, setEditingText] = useState("");
    const [editingCategory, setEditingCategory] = useState("");

    const editRef = useRef(null);

    const categories = ["General", "Work", "Home", "Personal", "Errands"];
    const suggestions = [
        "Buy groceries",
        "Clean the house",
        "Go to the gym",
        "Plan the week",
        "Pay bills",
        "Review goals",
        "Read a book",
        "Work on side project",
    ];

    const [filteredSuggestions, setFilteredSuggestions] = useState([]);

    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        if (!newTask.trim()) return setFilteredSuggestions([]);
        const matches = suggestions.filter((s) =>
            s.toLowerCase().includes(newTask.toLowerCase())
        );
        setFilteredSuggestions(matches.slice(0, 5));
    }, [newTask]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                editingTaskId &&
                editRef.current &&
                !editRef.current.contains(e.target)
            ) {
                saveEditing(editingTaskId);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [editingTaskId, editingText, editingCategory]);

    const addTask = () => {
        if (!newTask.trim()) return;
        setTasks([
            ...tasks,
            {
                id: Date.now(),
                text: newTask.trim(),
                completed: false,
                category: newCategory,
            },
        ]);
        setNewTask("");
        setFilteredSuggestions([]);
    };

    const toggleTask = (id) => {
        setTasks(
            tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
        );
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter((t) => t.id !== id));
    };

    const startEditing = (id, text, category) => {
        setEditingTaskId(id);
        setEditingText(text);
        setEditingCategory(category);
    };

    const saveEditing = (id) => {
        setTasks(
            tasks.map((t) =>
                t.id === id ? { ...t, text: editingText, category: editingCategory } : t
            )
        );
        setEditingTaskId(null);
        setEditingText("");
        setEditingCategory("");
    };

    const handleKeyPress = (e, id) => {
        if (e.key === "Enter") saveEditing(id);
        if (e.key === "Escape") {
            setEditingTaskId(null);
            setEditingText("");
            setEditingCategory("");
        }
    };

    const getFilteredTasks = () => {
        let filtered = [...tasks];
        if (filter === "active") filtered = filtered.filter((t) => !t.completed);
        if (filter === "completed") filtered = filtered.filter((t) => t.completed);
        if (categoryFilter !== "all")
            filtered = filtered.filter((t) => t.category === categoryFilter);
        return filtered;
    };

    return (
        <div className="app-container">
            <h1 className="app-title">React To-Do App</h1>

            {/* Input row */}
            <div className="input-row">
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add a task..."
                />

                <select
                    className="category-select"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                >
                    {categories.map((c, idx) => (
                        <option key={idx} value={c}>
                            {c}
                        </option>
                    ))}
                </select>

                <button onClick={addTask}>Add Task</button>
            </div>

            {/* Suggestions */}
            {filteredSuggestions.length > 0 && (
                <div className="suggestions-box">
                    {filteredSuggestions.map((s, i) => (
                        <div
                            key={i}
                            className="suggestion-item"
                            onClick={() => setNewTask(s)}
                        >
                            {s}
                        </div>
                    ))}
                </div>
            )}

            {/* Status filters */}
            <div className="filter-row">
                {["all", "active", "completed"].map((f) => (
                    <button
                        key={f}
                        className={filter === f ? "filter-btn active" : "filter-btn"}
                        onClick={() => setFilter(f)}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Category filter */}
            <div className="category-filter">
                <label>Category:</label>
                <select
                    className="category-filter-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                >
                    <option value="all">All</option>
                    {categories.map((c, idx) => (
                        <option key={idx} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
            </div>

            {/* Task list */}
            <ul className="task-list">
                {getFilteredTasks().map((t) => (
                    <li
                        key={t.id}
                        className={`task-item fade-in ${
                            editingTaskId === t.id ? "editing" : ""
                        }`}
                    >
                        <div className="task-left">
                            <input
                                type="checkbox"
                                checked={t.completed}
                                onChange={() => toggleTask(t.id)}
                            />
                            {editingTaskId === t.id ? (
                                <div className="task-edit-container" ref={editRef}>
                                    <input
                                        className="task-edit-input"
                                        type="text"
                                        value={editingText}
                                        onChange={(e) => setEditingText(e.target.value)}
                                        onKeyDown={(e) => handleKeyPress(e, t.id)}
                                        autoFocus
                                    />
                                    <select
                                        className="task-edit-category"
                                        value={editingCategory}
                                        onChange={(e) => setEditingCategory(e.target.value)}
                                    >
                                        {categories.map((c, idx) => (
                                            <option key={idx} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <span
                                    className={t.completed ? "task-text done" : "task-text"}
                                    onDoubleClick={() => startEditing(t.id, t.text, t.category)}
                                >
                  {t.text}
                </span>
                            )}
                        </div>

                        {editingTaskId !== t.id && (
                            <span className={`task-category ${t.category}`}>
                {t.category}
              </span>
                        )}

                        <button className="delete-btn" onClick={() => deleteTask(t.id)}>
                            ✕
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
