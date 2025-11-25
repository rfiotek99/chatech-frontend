import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { OpenAI } from 'openai';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-prod';

// Mock database (en producción usarías PostgreSQL)
const users = new Map();
const chats = new Map();

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'ChatEch Backend is running',
    timestamp: new Date().toISOString()
  });
});

// REGISTRO
app.post('/api/auth/register', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  
  if (users.has(email)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  users.set(email, { email, password });
  chats.set(email, []);
  
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });
  
  res.json({ 
    token, 
    user: { email },
    message: 'User registered successfully'
  });
});

// LOGIN
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  
  const user = users.get(email);
  
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });
  
  res.json({ 
    token, 
    user: { email },
    message: 'Login successful'
  });
});

// CHAT - Enviar mensaje y obtener respuesta
app.get('/api/chat', authenticateToken, async (req, res) => {
  try {
    const { message } = req.query;
    
    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }
    
    // Llamar a OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Eres ChatEch, un asistente IA profesional para ayudar a dueños de tiendas con estrategia, marketing y operaciones. Sé conciso, práctico y profesional. Si necesitas mostrar una lista, hazlo con números o viñetas claras.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });
    
    const botResponse = response.choices[0].message.content;
    
    // Guardar en historial
    const userEmail = req.user.email;
    if (!chats.has(userEmail)) {
      chats.set(userEmail, []);
    }
    
    const chat = {
      id: Date.now(),
      user_message: message,
      bot_response: botResponse,
      created_at: new Date().toISOString()
    };
    
    chats.get(userEmail).push(chat);
    
    res.json({
      botResponse,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// HISTORIAL DE CHATS
app.get('/api/chats/history', authenticateToken, (req, res) => {
  const userEmail = req.user.email;
  const userChats = chats.get(userEmail) || [];
  
  res.json({
    chats: userChats,
    total: userChats.length
  });
});

// Catch all
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Chat





