import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// MongoDB connection
const mongoURI = 'mongodb+srv://handsomelee:handsomelee@cluster0.ky8lcx0.mongodb.net/?appName=Cluster0';
mongoose.connect(process.env.MONGO_URI || mongoURI);

// ====== User Schema and Model ======
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String, default: "" },
  avatarUrl: { type: String, default: "" },
  bio: { type: String, default: "" },
  birthday: { type: Date, default: null }
});
const User = mongoose.model('User', userSchema);

// ====== Todo Schema and Model ======
const todoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  text: { type: String, required: true },
  completed: { type: Boolean, required: true, default: false },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  createdAt: { type: Date, default: Date.now },
  dueDate: { type: Date, default: null },
  position: { type: Number, default: 0, required: true }
});
const Todo = mongoose.model('Todo', todoSchema);

// Middleware
app.use(cors());
app.use(express.json());

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token format is Bearer <token>' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid/Expired token' });
    req.user = user;
    next();
  });
}

// ==== Authentication Routes ====
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ error: 'Username already taken' });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashed });
    await user.save();
    res.json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// ==== User Profile Routes ====
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { displayName, avatarUrl, bio, birthday } = req.body;
    let parsedBirthday = birthday && birthday !== "" ? new Date(birthday) : null;
    const user = await User.findByIdAndUpdate(req.user.userId, { displayName, avatarUrl, bio, birthday: parsedBirthday }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/user/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// ==== Protected TODO Routes ====
app.get('/api/todos', authenticateToken, async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user.userId }).sort('position createdAt').lean();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

app.post('/api/todos', authenticateToken, async (req, res) => {
  try {
    const { text, priority, dueDate } = req.body;
    if (!text) return res.status(400).json({ error: 'Text required' });
    const lastTodo = await Todo.findOne({ userId: req.user.userId }).sort('-position');
    const newPosition = lastTodo ? (lastTodo.position || 0) + 1 : 0;
    const newTodo = new Todo({
      text,
      priority: ['High', 'Medium', 'Low'].includes(priority) ? priority : 'Medium',
      userId: req.user.userId,
      dueDate: dueDate ? new Date(dueDate) : null,
      position: newPosition
    });
    const saved = await newTodo.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

app.delete('/api/todos/:id', authenticateToken, async (req, res) => {
  try {
    await Todo.deleteOne({ _id: req.params.id, userId: req.user.userId });
    res.json({ message: 'Todo deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

app.put('/api/todos/:id', authenticateToken, async (req, res) => {
  try {
    const { text, completed, priority, dueDate, position } = req.body;
    const todo = await Todo.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!todo) return res.status(404).json({ error: 'Todo not found' });
    if (text !== undefined) todo.text = text;
    if (completed !== undefined) todo.completed = completed;
    if (priority !== undefined) todo.priority = priority;
    if (position !== undefined) todo.position = position;
    if (req.body.hasOwnProperty('dueDate')) todo.dueDate = dueDate ? new Date(dueDate) : null;
    if (Object.keys(req.body).length === 0) todo.completed = !todo.completed;
    const updated = await todo.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

app.put('/api/todos/reorder', authenticateToken, async (req, res) => {
  try {
    const updates = req.body.map(up => Todo.updateOne({ _id: up.id, userId: req.user.userId }, { $set: { position: up.position } }));
    await Promise.all(updates);
    res.json({ message: 'Reordered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reorder' });
  }
});

// ==== Gemini AI Features ====

// POST /api/todos/smart: Extract task details from prompt
app.post('/api/todos/smart', authenticateToken, async (req, res) => {
  try {
    const { prompt } = req.body;
    const aiPrompt = `Extract task details from: "${prompt}". Return ONLY strict JSON: {"text": "string", "priority": "High"|"Medium"|"Low", "dueDate": "YYYY-MM-DD"|null}. Do not wrap in markdown blocks.`;
    const result = await aiModel.generateContent(aiPrompt);

    // Sanitize AI response to strictly remove any markdown
    let rawResponse = result.response.text();
    rawResponse = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    const data = JSON.parse(rawResponse);

    const lastTodo = await Todo.findOne({ userId: req.user.userId }).sort('-position');
    const todo = new Todo({
      ...data,
      userId: req.user.userId,
      position: lastTodo ? (lastTodo.position || 0) + 1 : 0,
      dueDate: data.dueDate ? new Date(data.dueDate) : null
    });
    await todo.save();
    res.json(todo);
  } catch (err) {
    console.error("Smart Add Error:", err);
    res.status(500).json({ error: 'Smart add failed: ' + err.message });
  }
});

// POST /api/todos/:id/breakdown: Break task into sub-tasks
app.post('/api/todos/:id/breakdown', authenticateToken, async (req, res) => {
  try {
    const parent = await Todo.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!parent) return res.status(404).json({ error: 'Todo not found' });

    const aiPrompt = `Break down this task: "${parent.text}" into 3 smaller, actionable sub-tasks. Return ONLY a strict JSON array of strings: ["Subtask 1", "Subtask 2", "Subtask 3"]. No markdown formatting.`;
    const result = await aiModel.generateContent(aiPrompt);
    const subTaskTexts = JSON.parse(result.response.text());

    const lastTodo = await Todo.findOne({ userId: req.user.userId }).sort('-position');
    let startPos = lastTodo ? (lastTodo.position || 0) + 1 : 0;

    const newTodos = await Todo.insertMany(subTaskTexts.map((text, i) => ({
      text,
      userId: req.user.userId,
      dueDate: parent.dueDate,
      priority: 'Medium',
      position: startPos + i
    })));

    res.json(newTodos);
  } catch (err) {
    res.status(500).json({ error: 'Breakdown failed: ' + err.message });
  }
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));