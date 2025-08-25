// App.js
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver'; // Make sure to run: npm install file-saver
import ReactMarkdown from 'react-markdown'; // Make sure to run: npm install react-markdown

// --- Styling ---
const styles = {
    appContainer: {
        minHeight: '100vh',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
        backgroundColor: '#f3f4f6',
        color: '#374151',
    },
    mainContent: { padding: '2rem' },
    container: {
        maxWidth: '1200px',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: '1rem',
        paddingRight: '1rem',
    },
    loadingContainer: { padding: '2rem', textAlign: 'center', fontSize: '1.25rem' },
    fontSemibold: { fontWeight: 600 },
    fontBold: { fontWeight: 700 },
    flexGrow: { flexGrow: 1 },
    mb4: { marginBottom: '1rem' },
    mt2: { marginTop: '0.5rem' },
    btn: {
        display: 'inline-block',
        fontWeight: 700,
        padding: '0.65rem 1rem',
        border: 'none',
        borderRadius: '0.375rem',
        cursor: 'pointer',
        transition: 'opacity 0.3s ease',
        textAlign: 'center',
        color: 'white',
    },
    btnPrimary: { backgroundColor: '#3b82f6' },
    btnDanger: { backgroundColor: '#ef4444' },
    btnSuccess: { backgroundColor: '#22c55e' },
    btnSecondary: { backgroundColor: '#8b5cf6' },
    btnWarning: { backgroundColor: '#f59e0b', color: '#1f2937' },
    btnDark: { backgroundColor: '#374151' },
    btnTeal: { backgroundColor: '#14b8a6' },
    btnMuted: { backgroundColor: '#6b7280' },
    btnAccent: { backgroundColor: '#4f46e5' },
    btnSm: { padding: '0.25rem 0.75rem', fontSize: '0.875rem' },
    btnXs: { padding: '0.25rem 0.5rem', fontSize: '0.75rem' },
    fullWidth: { width: '100%' },
    header: {
        backgroundColor: 'white',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    },
    headerContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '0.75rem',
        paddingBottom: '0.75rem',
    },
    headerTitle: { fontSize: '1.5rem', fontWeight: 700, cursor: 'pointer' },
    userInfo: { display: 'flex', alignItems: 'center', gap: '1rem' },
    loginPage: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#e5e7eb',
    },
    loginBox: {
        width: '100%',
        maxWidth: '28rem',
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    loginTitle: { fontSize: '1.875rem', fontWeight: 700, textAlign: 'center', marginBottom: '1.5rem' },
    formGroup: { marginBottom: '1.25rem' },
    formGroupLabel: { display: 'block', fontWeight: 700, marginBottom: '0.5rem' },
    formInput: {
        boxSizing: 'border-box',
        width: '100%',
        padding: '0.5rem 0.75rem',
        border: '1px solid #d1d5db',
        borderRadius: '0.375rem',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    },
    errorMessage: {
        backgroundColor: '#fee2e2',
        color: '#b91c1c',
        padding: '0.75rem',
        borderRadius: '0.375rem',
        marginBottom: '1rem',
    },
    dashboardTitle: { fontSize: '1.875rem', fontWeight: 600, marginBottom: '1.5rem' },
    dashboardGrid: { display: 'grid', gap: '1.5rem' },
    card: {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    cardTitle: { fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' },
    createTaskCard: { gridColumn: '1 / -1' },
    createTaskForm: { display: 'flex', gap: '1rem' },
    createTaskMessage: { marginBottom: '1rem', color: '#166534' },
    emptyQueueMessage: { color: '#6b7280' },
    taskList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' },
    taskListItem: {
        padding: '0.75rem',
        backgroundColor: '#f9fafb',
        borderRadius: '0.375rem',
        border: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    taskTitle: { fontWeight: 500 },
    taskActions: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
    editorTitle: { fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' },
    editorStatus: { fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem', textTransform: 'capitalize' },
    reworkComments: {
        backgroundColor: '#fef3c7',
        borderLeft: '4px solid #f59e0b',
        color: '#92400e',
        padding: '1rem',
        marginBottom: '1.5rem',
    },
    cellsContainer: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    cell: { padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.375rem', backgroundColor: 'white' },
    cellHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
    cellType: { fontWeight: 600, textTransform: 'capitalize' },
    cellControls: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
    removeCellBtn: { color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' },
    cellTextarea: {
        boxSizing: 'border-box',
        width: '100%',
        minHeight: '6rem',
        padding: '0.5rem',
        border: '1px solid #d1d5db',
        borderRadius: '0.25rem',
        fontFamily: 'monospace',
        fontSize: '0.875rem',
    },
    editorActions: { marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' },
    trainerActions: { display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' },
    reviewerActionsFormGroup: { marginBottom: '1rem' },
    buttonGroup: { display: 'flex', gap: '1rem' },
    tabs: {
        display: 'flex',
        borderBottom: '1px solid #d1d5db',
        marginBottom: '1.5rem',
    },
    tab: {
        padding: '0.75rem 1.25rem',
        cursor: 'pointer',
        border: 'none',
        backgroundColor: 'transparent',
        fontSize: '1rem',
        fontWeight: 500,
        color: '#6b7280',
        borderBottom: '2px solid transparent',
    },
    activeTab: {
        color: '#3b82f6',
        borderBottom: '2px solid #3b82f6',
    },
    adminTable: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    adminTh: {
        borderBottom: '1px solid #e5e7eb',
        padding: '0.75rem',
        textAlign: 'left',
        fontWeight: 600,
    },
    adminTd: {
        borderBottom: '1px solid #e5e7eb',
        padding: '0.75rem',
    },
    toolEditorContainer: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    toolCard: { border: '1px solid #d1d5db', borderRadius: '0.5rem', padding: '1rem' },
    toolHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
    toolTitle: { fontWeight: 600, fontSize: '1.1rem' },
    jsonError: { color: '#b91c1c', fontSize: '0.875rem', marginTop: '0.5rem', whiteSpace: 'pre-wrap' },
    schemaDisplay: { backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.25rem', marginTop: '1rem', fontFamily: 'monospace', fontSize: '0.875rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' },
    requiredField: { color: '#ef4444', fontWeight: 'bold' },
    toolCallContainer: { marginTop: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' },
    toolCallCreator: { border: '1px dashed #d1d5db', borderRadius: '0.5rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
    toolCallDisplay: { border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', marginTop: '1rem' },
    toolCallDisplayHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    markdownContainer: {
        prose: {
            h1: { fontSize: '2em', fontWeight: 'bold' },
            h2: { fontSize: '1.5em', fontWeight: 'bold' },
            strong: { fontWeight: 'bold' },
        }
    },
    conversationDivider: {
        textAlign: 'center',
        margin: '2rem 0',
        color: '#6b7280',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    dividerLine: {
        flexGrow: 1,
        height: '1px',
        backgroundColor: '#d1d5db',
    },
    bottomActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem',
    },
    jsonCell: {
        backgroundColor: '#f3f4f6', // A light gray background
        border: '1px solid #d1d5db',
    },
    addCellContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0.5rem 0',
        gap: '0.5rem',
    },
};

// --- Configuration ---
const API_URL = 'http://127.0.0.1:5004';
axios.defaults.withCredentials = true;

// --- Authentication Context ---
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkCurrentUser = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/current_user`);
                setUser(response.data);
            } catch (error) {
                console.log("Not logged in");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkCurrentUser();
    }, []);

    const login = async (username, password) => {
        const response = await axios.post(`${API_URL}/api/login`, { username, password });
        setUser(response.data.user);
    };

    const logout = async () => {
        await axios.post(`${API_URL}/api/logout`);
        setUser(null);
    };

    const authContextValue = { user, login, logout, loading };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);

// --- Main App Component ---
function App() {
    return (
        <AuthProvider>
            <Main />
        </AuthProvider>
    );
}

function Main() {
    const { user, loading } = useAuth();
    const [currentView, setCurrentView] = useState({ type: 'dashboard', taskId: null });

    if (loading) {
        return <div style={styles.loadingContainer}>Loading...</div>;
    }

    const navigateTo = (type, taskId = null) => {
        setCurrentView({ type, taskId });
    };

    return (
        <div style={styles.appContainer}>
            {!user ? (
                <LoginPage />
            ) : (
                <div>
                    <Header navigateTo={navigateTo} />
                    <main style={styles.mainContent}>
                        {currentView.type === 'dashboard' && (
                            <Dashboard navigateToEditor={(taskId) => navigateTo('editor', taskId)} />
                        )}
                        {currentView.type === 'editor' && (
                            <TaskEditor taskId={currentView.taskId} navigateToDashboard={() => navigateTo('dashboard')} />
                        )}
                        {currentView.type === 'admin' && (
                            <AdminPage />
                        )}
                    </main>
                </div>
            )}
        </div>
    );
}

// --- Components ---

const Header = ({ navigateTo }) => {
    const { user, logout } = useAuth();
    return (
        <header style={styles.header}>
            <div style={{...styles.container, ...styles.headerContent}}>
                <h1 style={styles.headerTitle} onClick={() => navigateTo('dashboard')}>Task Management</h1>
                <div style={styles.userInfo}>
                    <span>Welcome, <span style={styles.fontSemibold}>{user.username}</span> ({user.role})</span>
                    {user.role === 'owner' && (
                        <button onClick={() => navigateTo('admin')} style={{...styles.btn, ...styles.btnSecondary}}>
                            Admin
                        </button>
                    )}
                    <button onClick={logout} style={{...styles.btn, ...styles.btnDanger}}>
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(username, password);
        } catch (err) {
            setError('Invalid username or password.');
        }
    };

    return (
        <div style={styles.loginPage}>
            <div style={styles.loginBox}>
                <h2 style={styles.loginTitle}>Login</h2>
                <form onSubmit={handleSubmit}>
                    {error && <p style={styles.errorMessage}>{error}</p>}
                    <div style={styles.formGroup}>
                        <label htmlFor="username" style={styles.formGroupLabel}>Username</label>
                        <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} style={styles.formInput} required />
                    </div>
                    <div style={styles.formGroup}>
                        <label htmlFor="password" style={styles.formGroupLabel}>Password</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.formInput} required />
                    </div>
                    <button type="submit" style={{...styles.btn, ...styles.btnPrimary, ...styles.fullWidth}}>
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

const Dashboard = ({ navigateToEditor }) => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState({
        unclaimed: [],
        review: [],
        my_tasks: [],
        approved: [],
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('unclaimed');
    const isReviewer = user.role === 'owner' || user.role === 'reviewer';
    const isTrainer = user.role === 'trainer';

    const fetchAllTasks = useCallback(async () => {
        setLoading(true);
        try {
            const [unclaimedRes, reviewRes, myTasksRes, approvedRes] = await Promise.all([
                axios.get(`${API_URL}/api/tasks/queue/unclaimed`),
                isReviewer ? axios.get(`${API_URL}/api/tasks/queue/review`) : Promise.resolve({ data: [] }),
                isTrainer ? axios.get(`${API_URL}/api/tasks/queue/my_tasks`) : Promise.resolve({ data: [] }),
                isReviewer ? axios.get(`${API_URL}/api/tasks/queue/approved`) : Promise.resolve({ data: [] }),
            ]);
            setTasks({
                unclaimed: unclaimedRes.data,
                review: reviewRes.data,
                my_tasks: myTasksRes.data,
                approved: approvedRes.data,
            });
        } catch (error) {
            console.error("Error fetching tasks:", error);
        } finally {
            setLoading(false);
        }
    }, [isReviewer, isTrainer]);

    useEffect(() => {
        fetchAllTasks();
    }, [fetchAllTasks]);

    useEffect(() => {
        if (isTrainer) {
            setActiveTab('my_tasks');
        } else {
            setActiveTab('unclaimed');
        }
    }, [isTrainer]);

    return (
        <div style={styles.container}>
            <h2 style={styles.dashboardTitle}>Dashboard</h2>
            {isReviewer && <CreateTask onTaskCreated={fetchAllTasks} />}
            <div style={styles.tabs}>
                <button
                    style={activeTab === 'unclaimed' ? {...styles.tab, ...styles.activeTab} : styles.tab}
                    onClick={() => setActiveTab('unclaimed')}>
                    Unclaimed Tasks
                </button>
                {isTrainer && (
                    <button
                        style={activeTab === 'my_tasks' ? {...styles.tab, ...styles.activeTab} : styles.tab}
                        onClick={() => setActiveTab('my_tasks')}>
                        My Active Tasks
                    </button>
                )}
                {isReviewer && (
                    <>
                        <button
                            style={activeTab === 'review' ? {...styles.tab, ...styles.activeTab} : styles.tab}
                            onClick={() => setActiveTab('review')}>
                            Review Queue
                        </button>
                        <button
                            style={activeTab === 'approved' ? {...styles.tab, ...styles.activeTab} : styles.tab}
                            onClick={() => setActiveTab('approved')}>
                            Approved
                        </button>
                    </>
                )}
            </div>

            <div>
                {activeTab === 'unclaimed' && <TaskQueue tasks={tasks.unclaimed} loading={loading} title="Unclaimed Tasks" queueName="unclaimed" navigateToEditor={navigateToEditor} onTaskAction={fetchAllTasks} />}
                {activeTab === 'my_tasks' && isTrainer && <TaskQueue tasks={tasks.my_tasks} loading={loading} title="My Active Tasks" queueName="my_tasks" navigateToEditor={navigateToEditor} onTaskAction={fetchAllTasks} />}
                {activeTab === 'review' && isReviewer && <TaskQueue tasks={tasks.review} loading={loading} title="Review Queue" queueName="review" navigateToEditor={navigateToEditor} onTaskAction={fetchAllTasks} />}
                {activeTab === 'approved' && isReviewer && <TaskQueue tasks={tasks.approved} loading={loading} title="Approved Tasks (Delivery Batch)" queueName="approved" navigateToEditor={navigateToEditor} onTaskAction={fetchAllTasks} />}
            </div>
        </div>
    );
};


const CreateTask = ({ onTaskCreated }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const { user } = useAuth();

    const handleCreateTask = async () => {
        if (!title) {
            setMessage('Task ID is required.');
            return;
        }
        if (user.role !== 'owner' && user.role !== 'reviewer') {
            setMessage('Permission denied. You must be an owner or reviewer to create tasks.');
            return;
        }
        try {
            await axios.post(`${API_URL}/api/tasks`, { title });
            setMessage(`Task "${title}" created successfully!`);
            setTitle('');
            onTaskCreated();
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setMessage(`Error: ${error.response.data.message}`);
            } else if (error.response && error.response.status === 403) {
                 setMessage('Error: Permission denied by server. Please try logging out and back in.');
            } else {
                 setMessage('An error occurred while creating the task.');
            }
            console.error(error);
        }
    };

    return (
        <div style={{...styles.card, ...styles.createTaskCard, ...styles.mb4}}>
            <h3 style={styles.cardTitle}>Create New Task</h3>
            {message && <p style={{...styles.createTaskMessage, color: message.startsWith('Error') ? 'red' : 'green'}}>{message}</p>}
            <div style={styles.createTaskForm}>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter new task ID or title"
                    style={{...styles.formInput, ...styles.flexGrow}}
                />
                <button onClick={handleCreateTask} style={{...styles.btn, ...styles.btnSuccess}}>
                    Create Task
                </button>
            </div>
        </div>
    );
};

const ApprovedQueueActions = ({ onBatchDownload }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const response = await axios.post(`${API_URL}/api/tasks/download/batch`, {}, {
                responseType: 'blob', // Important for file downloads
            });
            saveAs(response.data, 'approved_tasks.zip');
            onBatchDownload(); // Refresh the task list after download
        } catch (error) {
            console.error("Error downloading batch:", error);
            alert("Could not download batch. There may be no approved tasks.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div style={{...styles.card, ...styles.mb4}}>
            <h3 style={styles.cardTitle}>Batch Actions</h3>
            <p style={{...styles.emptyQueueMessage, marginBottom: '1rem'}}>Download all approved tasks as a single ZIP file. This action will finalize the batch and remove the tasks from this list.</p>
            <button onClick={handleDownload} disabled={isDownloading} style={{...styles.btn, ...styles.btnAccent}}>
                {isDownloading ? 'Downloading...' : 'Bulk Download & Finalize Batch'}
            </button>
        </div>
    );
};

const TaskQueue = ({ title, tasks, loading, queueName, navigateToEditor, onTaskAction }) => {
    const { user } = useAuth();

    const handleClaimTask = async (taskId) => {
        try {
            await axios.post(`${API_URL}/api/tasks/${taskId}/claim`);
            onTaskAction();
        } catch (error) {
            console.error("Error claiming task:", error);
            alert("Could not claim task.");
        }
    };

    const handleDownloadTask = (taskId, taskTitle) => {
        window.open(`${API_URL}/api/tasks/${taskId}/download`, '_blank');
    };

    return (
        <>
            {queueName === 'approved' && <ApprovedQueueActions onBatchDownload={onTaskAction} />}
            <div style={styles.card}>
                <h3 style={styles.cardTitle}>{title}</h3>
                {loading ? (
                    <p>Loading tasks...</p>
                ) : tasks.length === 0 ? (
                    <p style={styles.emptyQueueMessage}>No tasks in this queue.</p>
                ) : (
                    <ul style={styles.taskList}>
                        {tasks.map(task => (
                            <li key={task.id} style={styles.taskListItem}>
                                <span style={styles.taskTitle}>{task.title}</span>
                                <div style={styles.taskActions}>
                                    <button onClick={() => navigateToEditor(task.id)} style={{...styles.btn, ...styles.btnSm, ...styles.btnPrimary}}>
                                        View
                                    </button>
                                    {queueName === 'unclaimed' && user.role === 'trainer' && (
                                        <button onClick={() => handleClaimTask(task.id)} style={{...styles.btn, ...styles.btnSm, ...styles.btnSecondary}}>
                                            Claim
                                        </button>
                                    )}
                                    {queueName === 'approved' && (
                                         <button onClick={() => handleDownloadTask(task.id, task.title)} style={{...styles.btn, ...styles.btnSm, ...styles.btnSuccess}}>
                                            Download .ipynb
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
};

// --- Tool Schema Display Component ---
const JsonSchemaDisplay = ({ schema, requiredFields = [] }) => {
    const renderValue = (key, value, isRequired) => {
        const keyStyle = isRequired ? styles.requiredField : {};
        if (typeof value === 'object' && value !== null) {
            return (
                <div key={key} style={{ paddingLeft: '1rem' }}>
                    <strong style={keyStyle}>{key}:</strong>
                    {Array.isArray(value)
                        ? <span> [ ... ]</span>
                        : <div style={{ paddingLeft: '1rem' }}>{renderObject(value, value.required)}</div>
                    }
                </div>
            );
        }
        return (
            <div key={key}>
                <strong style={keyStyle}>{key}:</strong> {String(value)}
            </div>
        );
    };

    const renderObject = (obj, required = []) => {
        return Object.entries(obj).map(([key, value]) => renderValue(key, value, required.includes(key)));
    };

    return <div style={styles.schemaDisplay}>{renderObject(schema, requiredFields)}</div>;
};


// --- Tool Editor Component ---
const ToolEditor = ({ content, onContentChange }) => {
    const [tools, setTools] = useState(() => {
        try {
            return JSON.parse(content) || [];
        } catch {
            return [];
        }
    });
    const [newToolJson, setNewToolJson] = useState('');
    const [jsonError, setJsonError] = useState('');

    const handleAddTool = () => {
        try {
            const newTool = JSON.parse(newToolJson);
            if (!newTool.name || !newTool.description || !newTool.parameters) {
                throw new Error("Tool must have a 'name', 'description', and 'parameters' object.");
            }
            const updatedTools = [...tools, newTool];
            setTools(updatedTools);
            onContentChange(JSON.stringify(updatedTools, null, 2));
            setNewToolJson('');
            setJsonError('');
        } catch (e) {
            setJsonError(`Invalid JSON or schema: ${e.message}`);
        }
    };

    const handleRemoveTool = (index) => {
        const updatedTools = tools.filter((_, i) => i !== index);
        setTools(updatedTools);
        onContentChange(JSON.stringify(updatedTools, null, 2));
    };

    return (
        <div style={styles.toolEditorContainer}>
            {tools.map((tool, index) => (
                <div key={index} style={styles.toolCard}>
                    <div style={styles.toolHeader}>
                        <span style={styles.toolTitle}>{tool.name}</span>
                        <button onClick={() => handleRemoveTool(index)} style={{...styles.btn, ...styles.btnSm, ...styles.btnDanger}}>Delete Tool</button>
                    </div>
                    <JsonSchemaDisplay schema={tool} requiredFields={tool.parameters?.required} />
                </div>
            ))}
            <div style={styles.toolCard}>
                <h3 style={styles.cardTitle}>Add New Tool</h3>
                <p style={{...styles.emptyQueueMessage, marginBottom: '1rem'}}>
                    Define your tool schema here, including a `returns` object to enable auto-generation of tool output placeholders.
                </p>
                <textarea
                    value={newToolJson}
                    onChange={(e) => setNewToolJson(e.target.value)}
                    style={styles.cellTextarea}
                    placeholder='Paste your tool schema JSON here...'
                />
                {jsonError && <p style={styles.jsonError}>{jsonError}</p>}
                <button onClick={handleAddTool} style={{...styles.btn, ...styles.btnSuccess, ...styles.mt2}}>Add Tool</button>
            </div>
        </div>
    );
};

// --- Tool Call Component ---
const ToolCallCreator = ({ availableTools, onAddToolCall }) => {
    const [selectedToolName, setSelectedToolName] = useState('');
    const [args, setArgs] = useState({});
    const [errors, setErrors] = useState({});

    const selectedTool = availableTools.find(t => t.name === selectedToolName);

    const handleArgChange = (paramName, value) => {
        setArgs(prev => ({ ...prev, [paramName]: value }));
        // Clear error on change
        if (errors[paramName]) {
            setErrors(prev => {
                const newErrors = {...prev};
                delete newErrors[paramName];
                return newErrors;
            });
        }
    };

    const validateAndAdd = () => {
        if (!selectedTool) return;
        const newErrors = {};
        const requiredParams = selectedTool.parameters.required || [];

        requiredParams.forEach(paramName => {
            if (!args[paramName] || args[paramName].trim() === '') {
                newErrors[paramName] = 'This field is required.';
            }
        });

        Object.entries(selectedTool.parameters.properties).forEach(([paramName, paramSchema]) => {
            const value = args[paramName];
            if (value) {
                if (paramSchema.type === 'number' && isNaN(Number(value))) {
                    newErrors[paramName] = 'Must be a valid number.';
                }
                // Add more type checks as needed (e.g., boolean, integer)
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const toolCall = {
            function_name: selectedTool.name,
            arguments: args
        };
        onAddToolCall(toolCall);
        setSelectedToolName('');
        setArgs({});
        setErrors({});
    };

    return (
        <div style={styles.toolCallCreator}>
            <select
                value={selectedToolName}
                onChange={(e) => {
                    setSelectedToolName(e.target.value);
                    setArgs({});
                    setErrors({});
                }}
                style={styles.formInput}
            >
                <option value="">-- Select a tool to call --</option>
                {availableTools.map(tool => <option key={tool.name} value={tool.name}>{tool.name}</option>)}
            </select>

            {selectedTool && (
                <div>
                    <p style={styles.fontSemibold}>{selectedTool.description}</p>
                    {Object.entries(selectedTool.parameters.properties).map(([paramName, paramSchema]) => (
                        <div key={paramName} style={styles.formGroup}>
                            <label style={styles.formGroupLabel}>
                                {paramName}
                                {selectedTool.parameters.required?.includes(paramName) && <span style={styles.requiredField}> *</span>}
                            </label>
                            <input
                                type="text"
                                value={args[paramName] || ''}
                                onChange={(e) => handleArgChange(paramName, e.target.value)}
                                style={styles.formInput}
                                placeholder={paramSchema.description}
                            />
                            {errors[paramName] && <p style={styles.jsonError}>{errors[paramName]}</p>}
                        </div>
                    ))}
                </div>
            )}
            <button onClick={validateAndAdd} disabled={!selectedToolName} style={{...styles.btn, ...styles.btnPrimary}}>Save Tool Call</button>
        </div>
    );
};


// --- Main Editor Cell Component ---
const EditableCell = ({ cell, index, onContentChange, onRemove, isTrainer, availableTools }) => {
    const [isEditing, setIsEditing] = useState(true);
    const isComplexAssistant = cell.cell_type === 'assistant';
    let initialContent;
    try {
        if (isComplexAssistant) {
            initialContent = JSON.parse(cell.content);
        } else {
            initialContent = cell.content;
        }
    } catch {
        initialContent = isComplexAssistant ? { text: cell.content || '', tool_calls: [] } : (cell.content || '');
    }

    const [content, setContent] = useState(initialContent);
    const [showToolCreator, setShowToolCreator] = useState(false);

    useEffect(() => {
        try {
            const newContent = isComplexAssistant ? JSON.parse(cell.content) : cell.content;
            setContent(newContent);
        } catch {
             setContent(isComplexAssistant ? { text: cell.content || '', tool_calls: [] } : (cell.content || ''));
        }
    }, [cell.content, isComplexAssistant]);


    const handleTextChange = (e) => {
        if (isComplexAssistant) {
            const updatedContent = { ...content, text: e.target.value };
            setContent(updatedContent);
            onContentChange(index, JSON.stringify(updatedContent, null, 2));
        } else {
            setContent(e.target.value);
            onContentChange(index, e.target.value);
        }
    };

    const handleJsonTextChange = (e) => {
        const newText = e.target.value;
        setContent(newText);
        onContentChange(index, newText);
    };

    const handleToolContentChange = (newToolJsonString) => {
        setContent(newToolJsonString);
        onContentChange(index, newToolJsonString);
    };

    const handleAddToolCall = (toolCall) => {
        const updatedContent = {
            ...content,
            tool_calls: [...(content.tool_calls || []), toolCall]
        };
        setContent(updatedContent);
        onContentChange(index, JSON.stringify(updatedContent, null, 2));
        setShowToolCreator(false);
    };

    const handleRemoveToolCall = (toolCallIndex) => {
        const updatedToolCalls = content.tool_calls.filter((_, i) => i !== toolCallIndex);
        const updatedContent = { ...content, tool_calls: updatedToolCalls };
        setContent(updatedContent);
        onContentChange(index, JSON.stringify(updatedContent, null, 2));
    };

    const renderEditableContent = () => {
        const cellStyle = (cell.cell_type === 'tool_definition' || cell.cell_type === 'tool_output') ? {...styles.cell, ...styles.jsonCell} : styles.cell;

        return (
            <div style={cellStyle}>
                <div style={styles.cellHeader}>
                    <span style={styles.cellType}>{cell.cell_type.replace('_', ' ')}</span>
                     <div style={styles.cellControls}>
                        {isTrainer && <button onClick={() => setIsEditing(!isEditing)} style={{...styles.btn, ...styles.btnXs, ...styles.btnMuted}}>{isEditing ? 'View' : 'Edit'}</button>}
                        {isTrainer && <button onClick={() => onRemove(index)} style={styles.removeCellBtn}>Remove</button>}
                    </div>
                </div>
                {(() => {
                    switch (cell.cell_type) {
                        case 'tool_definition':
                            return <ToolEditor content={content} onContentChange={handleToolContentChange} />;
                        case 'tool_output':
                             return (
                                <textarea
                                    value={content}
                                    onChange={handleJsonTextChange}
                                    style={styles.cellTextarea}
                                    placeholder={`Enter JSON output for the tool calls...`}
                                />
                            );
                        case 'assistant':
                            return (
                                <div>
                                    <textarea
                                        value={content.text || ''}
                                        onChange={handleTextChange}
                                        style={styles.cellTextarea}
                                        placeholder="Enter assistant response..."
                                    />
                                    {content.tool_calls?.map((tc, i) => (
                                         <div key={i} style={styles.toolCallDisplay}>
                                            <div style={styles.toolCallDisplayHeader}>
                                                <strong>Tool Call: {tc.function_name}</strong>
                                                <button onClick={() => handleRemoveToolCall(i)} style={{...styles.btn, ...styles.btnXs, ...styles.btnDanger}}>Remove</button>
                                            </div>
                                            <pre style={styles.schemaDisplay}>{JSON.stringify(tc.arguments, null, 2)}</pre>
                                        </div>
                                    ))}
                                    <div style={styles.toolCallContainer}>
                                        {showToolCreator ? (
                                            <>
                                              <ToolCallCreator availableTools={availableTools} onAddToolCall={handleAddToolCall} />
                                              <button onClick={() => setShowToolCreator(false)} style={{...styles.btn, ...styles.btnMuted, ...styles.mt2}}>Cancel</button>
                                            </>
                                        ) : (
                                            <button onClick={() => setShowToolCreator(true)} style={{...styles.btn, ...styles.btnSecondary}}>Add Tool Call</button>
                                        )}
                                    </div>
                                </div>
                            );
                        default: // Handles user, system_prompt, thought, thinking
                            return (
                                <textarea
                                    value={content}
                                    onChange={handleTextChange}
                                    style={styles.cellTextarea}
                                    placeholder={`Enter content for ${cell.cell_type}...`}
                                />
                            );
                    }
                })()}
            </div>
        );
    };

    const renderReadOnlyContent = () => {
        const simpleTextCells = ['user', 'system_prompt', 'thought', 'thinking'];
        const cellStyle = (cell.cell_type === 'tool_definition' || cell.cell_type === 'tool_output') ? {...styles.cell, ...styles.jsonCell} : styles.cell;

        return (
             <div style={cellStyle}>
                <div style={styles.cellHeader}>
                    <span style={styles.cellType}>{cell.cell_type.replace('_', ' ')}</span>
                     <div style={styles.cellControls}>
                        {isTrainer && <button onClick={() => setIsEditing(!isEditing)} style={{...styles.btn, ...styles.btnXs, ...styles.btnMuted}}>{isEditing ? 'View' : 'Edit'}</button>}
                    </div>
                </div>
                {(() => {
                    if (cell.cell_type === 'tool_definition') {
                        const tools = JSON.parse(content || '[]');
                        return (
                            <div>
                                {tools.map((tool, i) => <JsonSchemaDisplay key={i} schema={tool} requiredFields={tool.parameters?.required} />)}
                            </div>
                        );
                    }
                     if (isComplexAssistant) {
                        return (
                            <div>
                                <div style={styles.markdownContainer}><ReactMarkdown>{content.text || ''}</ReactMarkdown></div>
                                {content.tool_calls?.map((tc, i) => (
                                    <div key={i} style={styles.toolCallDisplay}>
                                        <strong>Tool Call: {tc.function_name}</strong>
                                        <pre style={styles.schemaDisplay}>{JSON.stringify(tc.arguments, null, 2)}</pre>
                                    </div>
                                ))}
                            </div>
                        );
                    }
                     if (simpleTextCells.includes(cell.cell_type)) {
                         return <div style={styles.markdownContainer}><ReactMarkdown>{content}</ReactMarkdown></div>;
                     }
                    return <pre style={{whiteSpace: 'pre-wrap', fontFamily: 'monospace'}}>{content}</pre>;
                })()}
            </div>
        );
    };

    return isTrainer && isEditing ? renderEditableContent() : renderReadOnlyContent();
};

// --- Helper to generate placeholder from schema ---
const generatePlaceholderFromSchema = (schema) => {
    if (!schema || typeof schema !== 'object' || !schema.properties) {
        return {};
    }
    const placeholder = {};
    for (const key in schema.properties) {
        placeholder[key] = '...'; // User will fill this value
    }
    return placeholder;
};

const AddCellButtons = ({ onAdd, isVisible }) => {
    if (!isVisible) return null;
    return (
        <div style={styles.addCellContainer}>
            <button onClick={() => onAdd('user')} style={{...styles.btn, ...styles.btnXs, ...styles.btnPrimary}}>+ User</button>
            <button onClick={() => onAdd('assistant')} style={{...styles.btn, ...styles.btnXs, ...styles.btnSuccess}}>+ Assistant</button>
            <button onClick={() => onAdd('thought')} style={{...styles.btn, ...styles.btnXs, ...styles.btnSecondary}}>+ Thought</button>
            <button onClick={() => onAdd('thinking')} style={{...styles.btn, ...styles.btnXs, ...styles.btnSecondary, backgroundColor: '#d946ef'}}>+ Thinking</button>
            <button onClick={() => onAdd('tool_output')} style={{...styles.btn, ...styles.btnXs, ...styles.btnWarning}}>+ Tool Output</button>
        </div>
    );
};


const TaskEditor = ({ taskId, navigateToDashboard }) => {
    const [taskData, setTaskData] = useState(null);
    const [cells, setCells] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reviewComments, setReviewComments] = useState('');
    const { user } = useAuth();
    const isTrainer = user.role === 'trainer';

    const toolDefinitionCell = cells.find(c => c.cell_type === 'tool_definition');
    let availableTools = [];
    if (toolDefinitionCell && toolDefinitionCell.content) {
        try {
            availableTools = JSON.parse(toolDefinitionCell.content);
        } catch {
            console.error("Could not parse tool definitions");
        }
    }

    useEffect(() => {
        const fetchTaskContent = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/api/tasks/${taskId}/content`);
                setTaskData(response.data);
                setCells(response.data.cells || []);
            } catch (err) {
                setError('Failed to load task content.');
            } finally {
                setLoading(false);
            }
        };
        fetchTaskContent();
    }, [taskId]);

    const handleCellChange = (index, newContent) => {
        const updatedCells = [...cells];
        updatedCells[index].content = newContent;

        if (updatedCells[index].cell_type === 'assistant') {
            try {
                const assistantContent = JSON.parse(newContent);
                const toolCalls = assistantContent.tool_calls || [];
                const nextCell = updatedCells[index + 1];

                if (toolCalls.length > 0) {
                    const placeholderOutputs = toolCalls.map(call => {
                        const toolDef = availableTools.find(t => t.name === call.function_name);
                        if (toolDef && toolDef.returns) {
                            return generatePlaceholderFromSchema(toolDef.returns);
                        }
                        return {};
                    });
                    const placeholderOutputString = JSON.stringify(placeholderOutputs, null, 2);

                    if (!nextCell || nextCell.cell_type !== 'tool_output') {
                        updatedCells.splice(index + 1, 0, { cell_type: 'tool_output', content: placeholderOutputString });
                    } else {
                         nextCell.content = placeholderOutputString;
                    }
                } else {
                    if (nextCell && nextCell.cell_type === 'tool_output') {
                        updatedCells.splice(index + 1, 1);
                    }
                }
            } catch (e) {
                console.error("Error processing assistant cell:", e);
            }
        }
        setCells(updatedCells);
    };

    const addCell = (type, afterIndex = -1) => {
        let newContent = '';
        if (type === 'tool_definition') newContent = '[]';
        if (type === 'assistant') newContent = JSON.stringify({ text: '', tool_calls: [] });
        if (type === 'tool_output') newContent = '[]';

        const newCell = { cell_type: type, content: newContent };
        const updatedCells = [...cells];

        if (type === 'system_prompt' || type === 'tool_definition') {
            const sysPromptIndex = updatedCells.findIndex(c => c.cell_type === 'system_prompt');
            if (type === 'tool_definition' && sysPromptIndex > -1) {
                updatedCells.splice(sysPromptIndex + 1, 0, newCell);
            } else {
                updatedCells.unshift(newCell);
            }
        } else {
             updatedCells.splice(afterIndex + 1, 0, newCell);
        }
        setCells(updatedCells);
    };

    const removeCell = (index) => {
        let updatedCells = cells.filter((_, i) => i !== index);
        const removedCell = cells[index];
        const nextCell = cells[index + 1];
        if (removedCell.cell_type === 'assistant' && nextCell && nextCell.cell_type === 'tool_output') {
             updatedCells = updatedCells.filter((_, i) => i !== index);
        }
        setCells(updatedCells);
    };

    const handleSave = async () => {
        try {
            await axios.post(`${API_URL}/api/tasks/${taskId}/content`, { cells });
            alert('Progress saved!');
        } catch (err) {
            alert('Failed to save progress.');
        }
    };

    const handleSubmitForReview = async () => {
        await handleSave();
        if(window.confirm("Are you sure you want to submit for review?")) {
            try {
                await axios.post(`${API_URL}/api/tasks/${taskId}/submit`);
                alert('Task submitted for review!');
                navigateToDashboard();
            } catch (err) {
                alert('Failed to submit task.');
            }
        }
    };

    const handleReviewAction = async (action) => {
        if (action === 'rework' && !reviewComments) {
            alert('Please provide comments for rework.');
            return;
        }
        try {
            await axios.post(`${API_URL}/api/tasks/${taskId}/action`, { action, comments: reviewComments });
            alert(`Task has been ${action}ed.`);
            navigateToDashboard();
        } catch (err) {
            alert('Failed to perform review action.');
        }
    };

    if (loading) return <div style={styles.loadingContainer}>Loading Editor...</div>;
    if (error) return <div style={{...styles.loadingContainer, ...styles.errorMessage}}>{error}</div>;

    const systemPromptCell = cells.find(c => c.cell_type === 'system_prompt');
    const conversationCells = cells.filter(c => c.cell_type !== 'system_prompt' && c.cell_type !== 'tool_definition');

    return (
        <div style={{...styles.container, ...styles.card}}>
            <button onClick={navigateToDashboard} style={{...styles.btn, ...styles.btnMuted, ...styles.mb4}}>
                &larr; Back to Dashboard
            </button>
            <h2 style={styles.editorTitle}>{taskData.title}</h2>
            <p style={styles.editorStatus}>Status: <span style={styles.fontSemibold}>{taskData.status.replace('_', ' ')}</span></p>

            {taskData.status === 'rework' && taskData.review_comments && (
                 <div style={styles.reworkComments}>
                    <p style={styles.fontBold}>Reviewer Comments</p>
                    <p>{taskData.review_comments}</p>
                </div>
            )}

            <div style={{...styles.cellsContainer, gap: '0.5rem'}}>
                {systemPromptCell ? (
                    <EditableCell
                        key={`cell-${cells.findIndex(c => c === systemPromptCell)}`}
                        cell={systemPromptCell}
                        index={cells.findIndex(c => c === systemPromptCell)}
                        onContentChange={handleCellChange}
                        onRemove={removeCell}
                        isTrainer={isTrainer}
                        availableTools={availableTools}
                    />
                ) : (
                    isTrainer && (
                        <button onClick={() => addCell('system_prompt')} style={{...styles.btn, ...styles.btnPrimary, ...styles.mb4}}>
                            Add System Prompt
                        </button>
                    )
                )}

                {toolDefinitionCell ? (
                    <EditableCell
                        key={`cell-${cells.findIndex(c => c === toolDefinitionCell)}`}
                        cell={toolDefinitionCell}
                        index={cells.findIndex(c => c === toolDefinitionCell)}
                        onContentChange={handleCellChange}
                        onRemove={removeCell}
                        isTrainer={isTrainer}
                        availableTools={availableTools}
                    />
                ) : (
                    isTrainer && (
                        <button onClick={() => addCell('tool_definition')} style={{...styles.btn, ...styles.btnTeal, ...styles.mb4}}>
                            Add Tools
                        </button>
                    )
                )}
            </div>

            <div style={styles.conversationDivider}>
                <div style={styles.dividerLine}></div>
                <span>Conversation</span>
                <div style={styles.dividerLine}></div>
            </div>

            <AddCellButtons onAdd={(type) => addCell(type, cells.length - 1)} isVisible={isTrainer && conversationCells.length === 0} />

            <div style={styles.cellsContainer}>
                {conversationCells.map((cell, convIndex) => {
                     const originalIndex = cells.findIndex(c => c === cell);
                     const showAddButtons = isTrainer && !(cell.cell_type === 'assistant' && conversationCells[convIndex + 1]?.cell_type === 'tool_output');
                     return (
                        <React.Fragment key={`fragment-${originalIndex}`}>
                            <EditableCell
                                cell={cell}
                                index={originalIndex}
                                onContentChange={handleCellChange}
                                onRemove={removeCell}
                                isTrainer={isTrainer}
                                availableTools={availableTools}
                            />
                            <AddCellButtons onAdd={(type) => addCell(type, originalIndex)} isVisible={showAddButtons} />
                        </React.Fragment>
                     );
                })}
            </div>

            {isTrainer && (
                <div style={{...styles.editorActions, ...styles.bottomActions}}>
                    <button onClick={handleSave} style={{...styles.btn, ...styles.btnDark}}>Save Progress</button>
                    <button onClick={handleSubmitForReview} style={{...styles.btn, ...styles.btnAccent}}>Submit for Review</button>
                </div>
            )}

            {!isTrainer && taskData.status === 'in_review' && (
                <div style={styles.editorActions}>
                     <h3 style={styles.cardTitle}>Reviewer Actions</h3>
                     <div style={styles.reviewerActionsFormGroup}>
                        <label htmlFor="reviewComments" style={styles.formGroupLabel}>Comments (for rework):</label>
                        <textarea
                            id="reviewComments"
                            value={reviewComments}
                            onChange={(e) => setReviewComments(e.target.value)}
                            style={styles.formInput}
                            placeholder="Provide feedback for the trainer..."
                        />
                     </div>
                     <div style={styles.buttonGroup}>
                        <button onClick={() => handleReviewAction('approve')} style={{...styles.btn, ...styles.btnSuccess}}>Approve</button>
                        <button onClick={() => handleReviewAction('rework')} style={{...styles.btn, ...styles.btnWarning}}>Send for Rework</button>
                     </div>
                </div>
            )}
        </div>
    );
};

const AdminPage = ({ ...props }) => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('trainer');
    const [message, setMessage] = useState('');

    const fetchUsers = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/api/users`);
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await axios.put(`${API_URL}/api/users/${userId}`, { role: newRole });
            fetchUsers();
        } catch (error) {
            console.error("Error updating user role:", error);
        }
    };

    const handleRemoveUser = async (userId, username) => {
        if (window.confirm(`Are you sure you want to remove access for ${username}? This action cannot be undone.`)) {
            try {
                await axios.delete(`${API_URL}/api/users/${userId}`);
                setMessage(`User "${username}" has been removed.`);
                fetchUsers();
            } catch (error) {
                console.error("Error removing user:", error);
                setMessage(`Error: ${error.response?.data?.message || 'Could not remove user.'}`);
            }
        }
    };

    const handleGiveAccess = async (e) => {
        e.preventDefault();
        setMessage('');
        if (!newUsername || !newPassword) {
            setMessage('Username and password are required.');
            return;
        }
        try {
            await axios.post(`${API_URL}/api/register`, {
                username: newUsername,
                password: newPassword,
                role: newRole
            });
            setMessage(`User "${newUsername}" created successfully!`);
            setNewUsername('');
            setNewPassword('');
            setNewRole('trainer');
            fetchUsers();
        } catch (error) {
            console.error("Error creating user:", error);
            setMessage('Error creating user. They may already exist.');
        }
    };

    if (loading) {
        return <div style={styles.loadingContainer}>Loading users...</div>;
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.dashboardTitle}>Admin - User Management</h2>
            <div style={styles.card}>
                <h3 style={styles.cardTitle}>Give Access</h3>
                {message && <p style={{...styles.createTaskMessage, color: message.startsWith('Error') ? 'red' : 'green'}}>{message}</p>}
                <form onSubmit={handleGiveAccess} style={{...styles.createTaskForm, flexDirection: 'column', alignItems: 'stretch'}}>
                    <div style={styles.formGroup}>
                        <label htmlFor="newUsername" style={styles.formGroupLabel}>Username</label>
                        <input id="newUsername" type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} style={styles.formInput} required />
                    </div>
                    <div style={styles.formGroup}>
                        <label htmlFor="newPassword" style={styles.formGroupLabel}>Password</label>
                        <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={styles.formInput} required />
                    </div>
                    <div style={styles.formGroup}>
                        <label htmlFor="newRole" style={styles.formGroupLabel}>Role</label>
                        <select id="newRole" value={newRole} onChange={(e) => setNewRole(e.target.value)} style={styles.formInput}>
                            <option value="trainer">Trainer</option>
                            <option value="reviewer">Reviewer</option>
                            <option value="owner">Owner</option>
                        </select>
                    </div>
                    <button type="submit" style={{...styles.btn, ...styles.btnSuccess}}>Give Access</button>
                </form>

                <hr style={{margin: '2rem 0'}} />

                <h3 style={styles.cardTitle}>Existing Users</h3>
                <table style={styles.adminTable}>
                    <thead>
                        <tr>
                            <th style={styles.adminTh}>Username</th>
                            <th style={styles.adminTh}>Role</th>
                            <th style={styles.adminTh}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td style={styles.adminTd}>{user.username}</td>
                                <td style={styles.adminTd}>
                                     <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        style={styles.formInput}
                                        disabled={user.id === currentUser.id} // Disable for self
                                    >
                                        <option value="owner">Owner</option>
                                        <option value="reviewer">Reviewer</option>
                                        <option value="trainer">Trainer</option>
                                    </select>
                                </td>
                                <td style={styles.adminTd}>
                                    {user.id !== currentUser.id && (
                                        <button
                                            onClick={() => handleRemoveUser(user.id, user.username)}
                                            style={{...styles.btn, ...styles.btnSm, ...styles.btnDanger}}
                                        >
                                            Remove Access
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default App;
