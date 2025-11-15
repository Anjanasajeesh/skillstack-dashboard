import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./app.css";

const API = "http://127.0.0.1:8000";

function SkillForm({ onSaved, existing }) {
  const [form, setForm] = useState(
    existing || {
      name: "",
      resource_type: "",
      platform: "",
      status: "started",
      hours: 0,
      notes: "",
      difficulty: 1,
    }
  );

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(
      existing || {
        name: "",
        resource_type: "",
        platform: "",
        status: "started",
        hours: 0,
        notes: "",
        difficulty: 1,
      }
    );
    setErrors({});
  }, [existing]);

  function change(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" })); 
  }

  function validate() {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Skill Name is required";
    if (!form.resource_type.trim()) newErrors.resource_type = "Resource Type is required";
    if (!form.platform.trim()) newErrors.platform = "Platform is required";
    if (!form.status.trim()) newErrors.status = "Status is required";
    if (form.hours < 0) newErrors.hours = "Hours cannot be negative";
    if (form.difficulty < 1 || form.difficulty > 5) newErrors.difficulty = "Difficulty must be 1–5";
    if (!form.notes.trim()) newErrors.notes = "Notes cannot be empty";
    return newErrors;
  }

  async function submit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; 
    }

    const url = existing ? `${API}/skills/${existing.id}` : `${API}/skills`;
    const method = existing ? "PUT" : "POST";
    const body = { ...form, hours: Number(form.hours), difficulty: Number(form.difficulty) };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      onSaved(data);

      if (!existing) {
        setForm({ name: "", resource_type: "", platform: "", status: "started", hours: 0, notes: "", difficulty: 1 });
      }
    } catch (err) {
      console.error("Failed to save skill:", err);
      alert("Error saving skill. Check backend server.");
    }
  }

  return (
    <form onSubmit={submit} className="skill-form">
      <div className="row g-3">
        <div className="col-12">
          <label className="form-label fw-bold">Skill Name</label>
          <input
            name="name"
            value={form.name}
            onChange={change}
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
          />
          {errors.name && <div className="text-danger mt-1">{errors.name}</div>}
        </div>

        <div className="col-md-6 col-12">
          <label className="form-label fw-bold">Resource Type</label>
          <input
            name="resource_type"
            value={form.resource_type}
            onChange={change}
            className={`form-control ${errors.resource_type ? "is-invalid" : ""}`}
          />
          {errors.resource_type && <div className="text-danger mt-1">{errors.resource_type}</div>}
        </div>

        <div className="col-md-6 col-12">
          <label className="form-label fw-bold">Platform</label>
          <input
            name="platform"
            value={form.platform}
            onChange={change}
            className={`form-control ${errors.platform ? "is-invalid" : ""}`}
          />
          {errors.platform && <div className="text-danger mt-1">{errors.platform}</div>}
        </div>

        <div className="col-md-6 col-12">
          <label className="form-label fw-bold">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={change}
            className={`form-select ${errors.status ? "is-invalid" : ""}`}
          >
            <option>started</option>
            <option>in-progress</option>
            <option>completed</option>
          </select>
          {errors.status && <div className="text-danger mt-1">{errors.status}</div>}
        </div>

        <div className="col-md-6 col-12">
          <label className="form-label fw-bold">Difficulty (1–5)</label>
          <input
            name="difficulty"
            type="number"
            min="1"
            max="5"
            value={form.difficulty}
            onChange={change}
            className={`form-control ${errors.difficulty ? "is-invalid" : ""}`}
          />
          {errors.difficulty && <div className="text-danger mt-1">{errors.difficulty}</div>}
        </div>

        <div className="col-md-6 col-12">
          <label className="form-label fw-bold">Hours</label>
          <input
            name="hours"
            type="number"
            step="0.5"
            value={form.hours}
            onChange={change}
            className={`form-control ${errors.hours ? "is-invalid" : ""}`}
          />
          {errors.hours && <div className="text-danger mt-1">{errors.hours}</div>}
        </div>

        <div className="col-12">
          <label className="form-label fw-bold">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={change}
            className={`form-control ${errors.notes ? "is-invalid" : ""}`}
            rows="3"
          ></textarea>
          {errors.notes && <div className="text-danger mt-1">{errors.notes}</div>}
        </div>

        <div className="col-12">
          <button type="submit" className="btn btn-primary w-100">
            {existing ? "Update Skill" : "Add Skill"}
          </button>
        </div>
      </div>
    </form>
  );
}

export default function App() {
  const [skills, setSkills] = useState([]);
  const [editing, setEditing] = useState(null);
  const [summary, setSummary] = useState(null);

  async function load() {
    const s = await fetch(`${API}/skills`).then(r => r.json());
    setSkills(s);
    const sum = await fetch(`${API}/summary`).then(r => r.json());
    setSummary(sum);
  }

  useEffect(() => { load(); }, []);

  async function remove(id) {
    await fetch(`${API}/skills/${id}`, { method: "DELETE" });
    load();
  }

  function saved(skill) {
    setEditing(null);
    load();
  }

  return (
    <div className="container py-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <h1 className="mb-4 fw-bold text-dark">SkillStack Dashboard</h1>

      <div className="row g-4">
        <div className="col-md-6 col-12">
          <div className="card shadow-sm p-3 h-100">
            <SkillForm existing={editing} onSaved={saved} />
          </div>
        </div>

        <div className="col-md-6 col-12">
          <div className="card shadow-sm p-3 h-100">
            <h4 className="mb-3 fw-bold text-dark">Summary</h4>
            <ul className="list-group list-group-flush">
              <li className="list-group-item d-flex justify-content-between align-items-center">
                Total Skills: <span className="fw-bold">{summary?.total_skills ?? 0}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                Total Hours: <span className="fw-bold">{summary?.total_hours ?? 0}</span>
              </li>
              <li className="list-group-item">
                <h6 className="fw-bold mb-2">Status</h6>
                {summary?.status_counts
                  ? Object.entries(summary.status_counts).map(([k, v]) => (
                      <span key={k} className={`badge me-2 ${
                        k === "completed" ? "bg-success" :
                        k === "in-progress" ? "bg-warning text-dark" :
                        "bg-secondary"
                      }`}>{k}: {v}</span>
                    ))
                  : <span>No data</span>}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <h4 className="mt-4 mb-3 fw-bold text-dark">All Skills</h4>
      <div className="row g-3">
        {skills.map(s => (
          <div key={s.id} className="col-md-6 col-12">
            <div className="card p-3 shadow-sm h-100">
              <h5 className="fw-bold text-dark">{s.name}</h5>
              <p className="text-muted mb-1">{s.resource_type} — {s.platform}</p>
              <span className={`badge mb-2 ${
                s.status === "completed" ? "bg-success" :
                s.status === "in-progress" ? "bg-warning text-dark" :
                "bg-secondary"
              }`}>{s.status}</span>
              <p className="mb-1">Hours: {s.hours} | Difficulty: {s.difficulty}</p>
              <p className="text-muted">{s.notes}</p>
              <div className="d-flex gap-2 mt-2">
                <button className="btn btn-sm btn-outline-primary" onClick={() => setEditing(s)}>Edit</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => remove(s.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
