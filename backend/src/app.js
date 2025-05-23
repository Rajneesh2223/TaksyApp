import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/taskRoutes.js';
import userRoutes from './routes/user.routes.js';

// Setup __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'https://yourdomain.com',
    "https://taksyapp-1.onrender.com/"
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  exposedHeaders: ['Content-Disposition'] // Important for file downloads
};

// Apply CORS middleware FIRST
app.use(cors(corsOptions));
app.use(express.json());

const uploadDir = path.join(process.cwd(), 'src', 'uploads');

// Then setup static files with proper headers
app.use('/uploads', express.static(uploadDir, {
  setHeaders: (res, filePath, stat) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'https://yourdomain.com',
      


    ];

    const requestOrigin = res.req.headers.origin;
    if (allowedOrigins.includes(requestOrigin)) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    }

    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="document.pdf"');
    }
  }
}));


// API Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);

// Global error handler
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error',
  });
});

export default app;