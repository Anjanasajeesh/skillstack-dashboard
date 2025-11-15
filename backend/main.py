import sqlite3
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict
from fastapi.middleware.cors import CORSMiddleware

DB_FILE = "skillstack.db"

def init_db():
    with sqlite3.connect(DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                resource_type TEXT,
                platform TEXT,
                status TEXT,
                hours REAL,
                notes TEXT,
                difficulty INTEGER
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                skill_id INTEGER,
                date TEXT,
                hours REAL,
                FOREIGN KEY(skill_id) REFERENCES skills(id)
            )
        """)
        conn.commit()

init_db()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Skill(BaseModel):
    name: str
    resource_type: Optional[str] = ""
    platform: Optional[str] = ""
    status: str = "started"
    hours: float = 0
    notes: Optional[str] = ""
    difficulty: int = 1


def get_db():
    return sqlite3.connect(DB_FILE)

# ---------------------------
# Routes
# ---------------------------
@app.post("/skills")
def add_skill(skill: Skill):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO skills (name, resource_type, platform, status, hours, notes, difficulty)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (skill.name, skill.resource_type, skill.platform, skill.status, skill.hours, skill.notes, skill.difficulty))
        new_id = cur.lastrowid
    return {"id": new_id, **skill.dict()}

@app.get("/skills")
def get_skills():
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM skills ORDER BY id DESC")
        rows = cur.fetchall()
    skills = [
        {
            "id": r[0],
            "name": r[1],
            "resource_type": r[2],
            "platform": r[3],
            "status": r[4],
            "hours": r[5],
            "notes": r[6],
            "difficulty": r[7],
        } for r in rows
    ]
    return skills

@app.put("/skills/{skill_id}")
def update_skill(skill_id: int, skill: Skill):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id FROM skills WHERE id=?", (skill_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Skill not found")
        cur.execute("""
            UPDATE skills
            SET name=?, resource_type=?, platform=?, status=?, hours=?, notes=?, difficulty=?
            WHERE id=?
        """, (skill.name, skill.resource_type, skill.platform, skill.status, skill.hours, skill.notes, skill.difficulty, skill_id))
    return {"id": skill_id, **skill.dict()}

@app.delete("/skills/{skill_id}")
def delete_skill(skill_id: int):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM skills WHERE id=?", (skill_id,))
    return {"status": "deleted", "id": skill_id}

@app.get("/summary")
def summary():
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*), SUM(hours) FROM skills")
        total_skills, total_hours = cur.fetchone()
        total_hours = float(total_hours) if total_hours else 0
        cur.execute("SELECT status, COUNT(*) FROM skills GROUP BY status")
        rows = cur.fetchall()
    status_counts: Dict[str, int] = {r[0]: r[1] for r in rows}
    return {
        "total_skills": total_skills or 0,
        "total_hours": total_hours,
        "status_counts": status_counts
    }
