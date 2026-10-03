import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BookOpen, LayoutDashboard, Database, Code2, Users, Plus, LogOut,
  ChevronRight, Clock, CheckCircle2, AlertCircle, Play, GraduationCap,
  ShieldCheck, X, FileQuestion, Sparkles
} from 'lucide-react';
import { enabled, signInWithGoogle } from './firebase';
import './styles.css';

const API = 'http://localhost:8080/api';
const demoStudent = { id: 1, name: 'Aarav Sharma', email: 'student@nitt.edu', role: 'STUDENT' };
const demoAdmin = { id: 2, name: 'Dr. Meera Nair', email: 'admin@nitt.edu', role: 'ADMIN' };

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [data, setData] = useState({ labs: [], questions: [], students: 0, submissions: 0 });
  const [selected, setSelected] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [sql, setSql] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  // Modals
  const [showLabModal, setShowLabModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  const fetchDashboard = () => {
    fetch(API + '/dashboard')
      .then(r => r.json())
      .then(setData)
      .catch(() => setData({ labs: [], questions: [], students: 0, submissions: 0 }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const enterDemoStudent = () => setUser(demoStudent);
  const enterDemoAdmin = () => setUser(demoAdmin);

  const toggleRole = () => {
    if (user.role === 'STUDENT') setUser(demoAdmin);
    else setUser(demoStudent);
  };

  const google = async () => {
    try {
      let r = await signInWithGoogle();
      setUser({ name: r.user.displayName, email: r.user.email, role: 'STUDENT', id: 1 });
    } catch (e) {
      alert(e.message);
    }
  };

  const openLab = async lab => {
    setSelected(lab);
    try {
      const res = await fetch(API + '/labs/' + lab.id + '/questions');
      const qList = await res.json();
      setQuestions(qList);
    } catch {
      setQuestions([]);
    }
    setResult(null);
    setSql('');
    setPage('lab');
  };

  const submit = async q => {
    if (!sql.trim()) return alert('Please enter an SQL query first.');
    setRunning(true);
    try {
      let run = await fetch(API + '/query/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sql })
      });
      let runInfo = await run.json();

      let res = await fetch(API + '/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: q.id, studentId: user.id, queryText: sql })
      });
      let subData = await res.json();
      setResult({ ...subData, runInfo });
      fetchDashboard();
    } catch (err) {
      setResult({ passed: false, message: err.message });
    } finally {
      setRunning(false);
    }
  };

  const handleCreateLab = async (newLab) => {
    try {
      const res = await fetch(API + '/labs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLab)
      });
      if (res.ok) {
        setShowLabModal(false);
        fetchDashboard();
        const created = await res.json();
        openLab(created);
      } else {
        alert('Failed to create lab');
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleCreateQuestion = async (newQ) => {
    try {
      const res = await fetch(API + '/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQ)
      });
      if (res.ok) {
        setShowQuestionModal(false);
        fetchDashboard();
        if (selected && selected.id === newQ.lab.id) {
          const qRes = await fetch(API + '/labs/' + selected.id + '/questions');
          setQuestions(await qRes.json());
        }
      } else {
        alert('Failed to add question');
      }
    } catch (e) {
      alert(e.message);
    }
  };

  if (!user) return <Login onStudent={enterDemoStudent} onAdmin={enterDemoAdmin} google={google} />;
  if (loading) return <div className="loading">Loading portal…</div>;

  return (
    <div className="shell">
      <aside>
        <div className="brand">
          <span className="brand-icon"><Database size={22} /></span>
          <div>Query<span>Lab</span><small>NIT Trichy · DBMS</small></div>
        </div>

        <nav>
          {[
            ['dashboard', LayoutDashboard, 'Overview'],
            ['labs', BookOpen, 'My Labs'],
            ['schema', Database, 'Schema Explorer'],
            ['history', Clock, user.role === 'ADMIN' ? 'All Submissions' : 'My Submissions']
          ].map(([id, Icon, label]) => (
            <button className={page === id ? 'active' : ''} onClick={() => setPage(id)} key={id}>
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
          {user.role === 'ADMIN' && (
            <button className="primary-btn" style={{ marginTop: '12px' }} onClick={() => setShowLabModal(true)}>
              <Plus size={16} />
              <span>New Lab</span>
            </button>
          )}
        </nav>

        <div className="profile">
          <div className="avatar">{user.name[0]}</div>
          <div>
            <b>{user.name}</b>
            <small>{user.role === 'ADMIN' ? 'Faculty / Admin' : 'Student'}</small>
          </div>
          <button onClick={() => setUser(null)} title="Log out"><LogOut size={17} /></button>
        </div>
      </aside>

      <main>
        <header>
          <div>
            <p className="eyebrow">DATABASE MANAGEMENT SYSTEMS</p>
            <h1>
              {page === 'dashboard' ? `Welcome, ${user.name.split(' ')[0]}` :
               page === 'labs' ? 'Lab Assignments' :
               page === 'schema' ? 'Academic Database Schema' :
               page === 'history' ? (user.role === 'ADMIN' ? 'Review Student Submissions' : 'Your Submissions') :
               selected?.title || 'SQL workspace'}
            </h1>
          </div>

          <div className="header-right">
            <span className="status"><i /> API Connected</span>
            <button className="outline active-role" onClick={toggleRole} title="Click to toggle between Student and Faculty Mode">
              {user.role === 'ADMIN' ? <ShieldCheck size={16} color="var(--green)" /> : <GraduationCap size={16} />}
              {user.role === 'ADMIN' ? 'Admin Mode (Click to switch)' : 'Student Mode (Click to switch)'}
            </button>
          </div>
        </header>

        {page === 'dashboard' && (
          <Dashboard
            data={data}
            openLab={openLab}
            user={user}
            onCreateLab={() => setShowLabModal(true)}
            onAddQuestion={() => setShowQuestionModal(true)}
          />
        )}
        {page === 'labs' && (
          <Labs
            labs={data.labs}
            openLab={openLab}
            user={user}
            onCreateLab={() => setShowLabModal(true)}
          />
        )}
        {page === 'lab' && (
          <Lab
            lab={selected}
            questions={questions}
            sql={sql}
            setSql={setSql}
            submit={submit}
            result={result}
            running={running}
            user={user}
            onAddQuestion={() => setShowQuestionModal(true)}
          />
        )}
        {page === 'schema' && <Schema />}
        {page === 'history' && <History user={user} />}
      </main>

      {showLabModal && <CreateLabModal onClose={() => setShowLabModal(false)} onSave={handleCreateLab} />}
      {showQuestionModal && (
        <CreateQuestionModal
          labs={data.labs}
          selectedLabId={selected?.id}
          onClose={() => setShowQuestionModal(false)}
          onSave={handleCreateQuestion}
        />
      )}
    </div>
  );
}

function Login({ onStudent, onAdmin, google }) {
  return (
    <div className="login">
      <section>
        <div className="login-brand"><Database /> Query<span>Lab</span></div>
        <p className="eyebrow">NATIONAL INSTITUTE OF TECHNOLOGY, TIRUCHIRAPPALLI</p>
        <h1>Learn SQL by<br /><em>doing the work.</em></h1>
        <p className="lead">A focused interactive workspace for DBMS labs, schema exploration, query execution, and evaluated SQL practice.</p>

        <div className="login-actions">
          <button className="primary" onClick={onStudent}>
            Continue as Student <ChevronRight size={18} />
          </button>
          <button className="outline" onClick={onAdmin}>
            <ShieldCheck size={18} /> Continue as Faculty / Admin
          </button>
          {enabled && (
            <button className="outline" onClick={google}>
              Sign in with Google
            </button>
          )}
        </div>
        <small>Powered by Spring Boot + MySQL evaluation engine</small>
      </section>

      <aside className="login-card">
        <Code2 size={32} />
        <code>
          SELECT department,<br />
          &nbsp;&nbsp;&nbsp;COUNT(*)<br />
          FROM students<br />
          GROUP BY department;
        </code>
        <div>
          <CheckCircle2 size={18} />
          <span>Query accepted · 10/10 Score</span>
        </div>
      </aside>
    </div>
  );
}

function Dashboard({ data, openLab, user, onCreateLab, onAddQuestion }) {
  let labs = data.labs || [];
  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">DBMS PRACTICE & EVALUATION PORTAL</p>
          <h2>Ready for your next query?</h2>
          <p>Practice relational queries, joins, grouping, and schema design in real time with MySQL.</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="primary" onClick={() => labs[0] && openLab(labs[0])}>
              Open current lab <ChevronRight size={18} />
            </button>
            {user.role === 'ADMIN' && (
              <button className="outline" style={{ background: '#fff' }} onClick={onCreateLab}>
                <Plus size={16} /> Create Lab
              </button>
            )}
          </div>
        </div>
        <div className="hero-mark"><Database size={90} /><span>DBMS</span></div>
      </section>

      <section className="stats">
        <Stat value={labs.length} label="Active Labs" icon={BookOpen} />
        <Stat value={data.questions?.length || 0} label="SQL Problems" icon={Code2} />
        <Stat value={data.students || 0} label="Enrolled Students" icon={Users} />
        <Stat value={data.submissions || 0} label="Total Submissions" icon={CheckCircle2} />
      </section>

      <div className="section-heading">
        <div>
          <h2>Available Labs</h2>
          <p>Select any lab below to open the interactive SQL editor.</p>
        </div>
        {user.role === 'ADMIN' && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="primary-btn" onClick={onCreateLab}><Plus size={16} /> New Lab</button>
            <button className="outline" onClick={onAddQuestion}><Plus size={16} /> Add Problem</button>
          </div>
        )}
      </div>

      <div className="lab-grid">
        {labs.length === 0 ? (
          <div className="empty" style={{ gridColumn: '1/-1' }}>No labs available yet. Click "New Lab" to create one.</div>
        ) : (
          labs.map(l => <LabCard lab={l} openLab={openLab} key={l.id} />)
        )}
      </div>
    </>
  );
}

function Stat({ value, label, icon: Icon }) {
  return (
    <div className="stat">
      <span><Icon size={20} /></span>
      <div><b>{value}</b><small>{label}</small></div>
    </div>
  );
}

function Labs({ labs, openLab, user, onCreateLab }) {
  return (
    <>
      <div className="section-heading">
        <div>
          <h2>All Lab Assignments</h2>
          <p>Practice SQL using the pre-seeded academic database schemas.</p>
        </div>
        {user.role === 'ADMIN' && (
          <button className="primary-btn" onClick={onCreateLab}><Plus size={16} /> Create Lab</button>
        )}
      </div>
      <div className="lab-grid">
        {labs.map(l => <LabCard lab={l} openLab={openLab} key={l.id} />)}
      </div>
    </>
  );
}

function LabCard({ lab, openLab }) {
  return (
    <article className="lab-card">
      <div className="lab-top">
        <span className="tag">{lab.topic}</span>
        <span className="due"><Clock size={14} /> Due {lab.dueDate || 'Soon'}</span>
      </div>
      <h3>{lab.title}</h3>
      <p>{lab.description}</p>
      <footer>
        <span>{lab.totalQuestions || 0} questions</span>
        <button onClick={() => openLab(lab)}>Start lab <ChevronRight size={16} /></button>
      </footer>
    </article>
  );
}

function Lab({ lab, questions, sql, setSql, submit, result, running, user, onAddQuestion }) {
  let [active, setActive] = useState(0);
  let q = questions[active];

  if (!q) {
    return (
      <div className="empty">
        <p>No questions have been added to this lab yet.</p>
        {user.role === 'ADMIN' && (
          <button className="primary-btn" style={{ marginTop: '12px' }} onClick={onAddQuestion}>
            <Plus size={16} /> Add First Problem
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="workspace">
      <section className="problem">
        <div className="crumb">LABS <ChevronRight size={14} /> {lab.topic}</div>
        <div className="question-tabs">
          {questions.map((x, i) => (
            <button
              className={active === i ? 'selected' : ''}
              onClick={() => { setActive(i); setSql(''); }}
              key={x.id}
            >
              Q{i + 1}
            </button>
          ))}
          {user.role === 'ADMIN' && (
            <button className="add-q" onClick={onAddQuestion} title="Add another question to this lab">
              <Plus size={14} /> Add Q
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className={'tag ' + (q.difficulty === 'Hard' ? 'danger' : q.difficulty === 'Medium' ? 'warning' : '')}>
            {q.difficulty}
          </span>
          <span className="tag">{q.points} Points</span>
        </div>

        <h2>{q.title}</h2>
        <p>{q.prompt}</p>

        <h4>Schema Reference</h4>
        <pre>{q.schemaHint}</pre>

        {user.role === 'ADMIN' && (
          <>
            <h4>Expected Query (Admin Only)</h4>
            <pre style={{ background: '#fdf6b2', color: '#723b10' }}>{q.expectedQuery}</pre>
          </>
        )}
      </section>

      <section className="editor">
        <div className="editor-head">
          <span><Code2 size={17} /> query.sql</span>
          <button className="run" onClick={() => submit(q)} disabled={running}>
            <Play size={15} fill="currentColor" /> {running ? 'Running...' : 'Run & submit'}
          </button>
        </div>

        <textarea
          spellCheck="false"
          value={sql}
          onChange={e => setSql(e.target.value)}
          placeholder="-- Write your SQL query here&#10;-- Example: SELECT name, building FROM departments;"
        />

        <div className={'result ' + (result?.passed ? 'success' : '')}>
          {!result ? (
            <><AlertCircle size={18} /> Write your query above and click "Run & submit" to evaluate.</>
          ) : result.passed ? (
            <><CheckCircle2 size={18} /> <b>Correct Query!</b> Your query matches the expected output. Score: {result.score}/{q.points}</>
          ) : (
            <><AlertCircle size={18} /> <b>Not quite matching.</b> Check your joins, grouping, and selected columns.</>
          )}
        </div>

        {result?.runInfo && (
          <div className="query-output">
            {result.runInfo.message ? (
              <span style={{ color: '#ff8585' }}>{result.runInfo.message}</span>
            ) : (
              <>
                <b style={{ color: '#72d09a' }}>{result.runInfo.count} rows returned from MySQL:</b>
                <table>
                  <thead>
                    <tr>{result.runInfo.columns?.map(c => <th key={c}>{c}</th>)}</tr>
                  </thead>
                  <tbody>
                    {result.runInfo.rows?.slice(0, 8).map((row, i) => (
                      <tr key={i}>
                        {result.runInfo.columns.map(c => <td key={c}>{String(row[c] ?? 'NULL')}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function Schema() {
  const tables = [
    ['departments', 'id (BIGINT PK) · name (VARCHAR) · building (VARCHAR)'],
    ['students', 'id (BIGINT PK) · name (VARCHAR) · department_id (FK -> departments.id)'],
    ['courses', 'id (BIGINT PK) · title (VARCHAR) · credits (INT) · department_id (FK -> departments.id)'],
    ['employees', 'id (BIGINT PK) · name (VARCHAR) · department_id (FK -> departments.id)']
  ];

  return (
    <div className="schema">
      <p className="eyebrow">ACADEMIC PRACTICE DATABASE</p>
      <h2>Available Schema Tables</h2>
      <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
        These tables are pre-populated in your MySQL server for all lab questions.
      </p>

      <div className="schema-grid">
        {tables.map(([tableName, cols]) => (
          <article key={tableName}>
            <Database size={22} />
            <h3>{tableName}</h3>
            <code>{cols}</code>
            <small>Query directly: <code>SELECT * FROM {tableName};</code></small>
          </article>
        ))}
      </div>
    </div>
  );
}

function History({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = user.role === 'ADMIN' ? `${API}/submissions` : `${API}/submissions/${user.id}`;
    fetch(url)
      .then(r => r.json())
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <section className="history">
      <p className="eyebrow">{user.role === 'ADMIN' ? 'ALL STUDENTS' : 'YOUR ACCOUNT'}</p>
      <h2>{user.role === 'ADMIN' ? 'Global Submissions Log' : 'Your Submission History'}</h2>
      <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>
        {user.role === 'ADMIN' ? 'All student attempts recorded by the evaluation engine.' : 'Your recent query submissions and awarded points.'}
      </p>

      {loading ? (
        <div>Loading history...</div>
      ) : items.length ? (
        <div className="history-list">
          {items.map(s => (
            <div className="history-item" key={s.id}>
              <span className={s.passed ? 'pass' : 'fail'}>
                {s.passed ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              </span>
              <div>
                <b>{s.question?.title || `Question #${s.question?.id}`}</b>
                <br />
                <code>{s.queryText}</code>
              </div>
              <small>{new Date(s.submittedAt).toLocaleString()}</small>
              <strong>{s.score} pts</strong>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty">No submissions recorded yet.</div>
      )}
    </section>
  );
}

function CreateLabModal({ onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !topic) return alert('Please fill in title and topic');
    onSave({
      title,
      topic,
      description,
      dueDate,
      totalQuestions: 0,
      published: true
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-head">
          <h2>Create New Lab Assignment</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Lab Title</label>
            <input
              placeholder="e.g. Lab 05: Subqueries & Views"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Topic / Category</label>
            <input
              placeholder="e.g. Subqueries"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Brief instructions or goals for students..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn">Create Lab</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateQuestionModal({ labs, selectedLabId, onClose, onSave }) {
  const [labId, setLabId] = useState(selectedLabId || labs[0]?.id || '');
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [schemaHint, setSchemaHint] = useState('departments(id, name)\nstudents(id, name, department_id)');
  const [expectedQuery, setExpectedQuery] = useState('');
  const [points, setPoints] = useState(10);
  const [difficulty, setDifficulty] = useState('Medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !prompt || !expectedQuery) return alert('Please complete all required fields.');
    onSave({
      lab: { id: Number(labId) },
      title,
      prompt,
      schemaHint,
      expectedQuery,
      points: Number(points),
      difficulty
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-head">
          <h2>Add SQL Problem to Lab</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Target Lab</label>
            <select value={labId} onChange={e => setLabId(e.target.value)} required>
              {labs.map(l => (
                <option value={l.id} key={l.id}>{l.title} ({l.topic})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Problem Title</label>
            <input
              placeholder="e.g. Highest Earning Faculty"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Difficulty</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            <div className="form-group">
              <label>Points</label>
              <input
                type="number"
                value={points}
                onChange={e => setPoints(e.target.value)}
                min="1"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Problem Prompt / Question Text</label>
            <textarea
              placeholder="Write the exact problem instructions for the student..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Schema Reference Hint</label>
            <textarea
              placeholder="e.g. students(id, name, department_id)"
              value={schemaHint}
              onChange={e => setSchemaHint(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Expected SQL Query (Evaluation Target)</label>
            <textarea
              placeholder="e.g. SELECT name FROM students WHERE department_id = 1"
              value={expectedQuery}
              onChange={e => setExpectedQuery(e.target.value)}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn">Save Problem</button>
          </div>
        </form>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
