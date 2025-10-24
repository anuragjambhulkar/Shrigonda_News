import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { hashPassword, comparePassword, generateToken, verifyToken, extractToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }));
}

// Middleware to verify authentication
async function requireAuth(request, requiredRole = null) {
  const token = extractToken(request);
  if (!token) {
    return { error: 'Unauthorized', status: 401 };
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return { error: 'Invalid token', status: 401 };
  }

  if (requiredRole && !['admin', requiredRole].includes(decoded.role)) {
    return { error: 'Forbidden', status: 403 };
  }

  return { user: decoded };
}

// Initialize default admin user
async function initializeAdmin() {
  try {
    const users = await getCollection('users');
    const adminExists = await users.findOne({ username: 'admin' });
    
    if (!adminExists) {
      await users.insertOne({
        id: uuidv4(),
        username: 'admin',
        password: hashPassword('admin123'),
        role: 'admin',
        createdAt: new Date().toISOString()
      });
      console.log('Default admin user created: admin/admin123');
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
}

// POST /api/auth/login
async function handleLogin(request) {
  try {
    const { username, password } = await request.json();
    
    const users = await getCollection('users');
    const user = await users.findOne({ username });
    
    if (!user || !comparePassword(password, user.password)) {
      return handleCORS(NextResponse.json({ error: 'Invalid credentials' }, { status: 401 }));
    }
    
    const token = generateToken(user);
    
    return handleCORS(NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    }));
  } catch (error) {
    return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }));
  }
}

// GET /api/auth/verify
async function handleVerify(request) {
  const authResult = await requireAuth(request);
  if (authResult.error) {
    return handleCORS(NextResponse.json({ error: authResult.error }, { status: authResult.status }));
  }
  
  return handleCORS(NextResponse.json({ user: authResult.user }));
}

// POST /api/users (Admin only - create new user)
async function handleCreateUser(request) {
  const authResult = await requireAuth(request, 'admin');
  if (authResult.error) {
    return handleCORS(NextResponse.json({ error: authResult.error }, { status: authResult.status }));
  }
  
  try {
    const { username, password, role } = await request.json();
    
    const users = await getCollection('users');
    const exists = await users.findOne({ username });
    
    if (exists) {
      return handleCORS(NextResponse.json({ error: 'Username already exists' }, { status: 400 }));
    }
    
    const newUser = {
      id: uuidv4(),
      username,
      password: hashPassword(password),
      role: role || 'editor',
      createdAt: new Date().toISOString()
    };
    
    await users.insertOne(newUser);
    
    return handleCORS(NextResponse.json({ 
      message: 'User created',
      user: { id: newUser.id, username: newUser.username, role: newUser.role }
    }));
  } catch (error) {
    return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }));
  }
}

// GET /api/news (Public - get all news)
async function handleGetNews(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const news = await getCollection('news');
    const query = category ? { category, published: true } : { published: true };
    
    const articles = await news
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    
    return handleCORS(NextResponse.json({ articles }));
  } catch (error) {
    return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }));
  }
}

// GET /api/news/:id (Public - get single article)
async function handleGetArticle(articleId) {
  try {
    const news = await getCollection('news');
    const article = await news.findOne({ id: articleId, published: true });
    
    if (!article) {
      return handleCORS(NextResponse.json({ error: 'Article not found' }, { status: 404 }));
    }
    
    // Increment views
    await news.updateOne({ id: articleId }, { $inc: { views: 1 } });
    
    return handleCORS(NextResponse.json({ article }));
  } catch (error) {
    return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }));
  }
}

// POST /api/news (Admin/Editor - create article)
async function handleCreateArticle(request) {
  const authResult = await requireAuth(request, 'editor');
  if (authResult.error) {
    return handleCORS(NextResponse.json({ error: authResult.error }, { status: authResult.status }));
  }
  
  try {
    const data = await request.json();
    const { title, content, category, image, excerpt, tags } = data;
    
    const article = {
      id: uuidv4(),
      title,
      content,
      excerpt: excerpt || content.substring(0, 200),
      category,
      image: image || '',
      tags: tags || [],
      author: authResult.user.username,
      authorId: authResult.user.userId,
      published: true,
      featured: false,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const news = await getCollection('news');
    await news.insertOne(article);
    
    // Create notification
    const notifications = await getCollection('notifications');
    await notifications.insertOne({
      id: uuidv4(),
      type: 'new_article',
      title: 'New Article Published',
      message: `${title}`,
      articleId: article.id,
      read: false,
      createdAt: new Date().toISOString()
    });
    
    return handleCORS(NextResponse.json({ message: 'Article created', article }));
  } catch (error) {
    return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }));
  }
}

// PUT /api/news/:id (Admin/Editor - update article)
async function handleUpdateArticle(request, articleId) {
  const authResult = await requireAuth(request, 'editor');
  if (authResult.error) {
    return handleCORS(NextResponse.json({ error: authResult.error }, { status: authResult.status }));
  }
  
  try {
    const updates = await request.json();
    updates.updatedAt = new Date().toISOString();
    
    const news = await getCollection('news');
    const result = await news.updateOne(
      { id: articleId },
      { $set: updates }
    );
    
    if (result.matchedCount === 0) {
      return handleCORS(NextResponse.json({ error: 'Article not found' }, { status: 404 }));
    }
    
    return handleCORS(NextResponse.json({ message: 'Article updated' }));
  } catch (error) {
    return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }));
  }
}

// DELETE /api/news/:id (Admin only)
async function handleDeleteArticle(request, articleId) {
  const authResult = await requireAuth(request, 'admin');
  if (authResult.error) {
    return handleCORS(NextResponse.json({ error: authResult.error }, { status: authResult.status }));
  }
  
  try {
    const news = await getCollection('news');
    const result = await news.deleteOne({ id: articleId });
    
    if (result.deletedCount === 0) {
      return handleCORS(NextResponse.json({ error: 'Article not found' }, { status: 404 }));
    }
    
    return handleCORS(NextResponse.json({ message: 'Article deleted' }));
  } catch (error) {
    return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }));
  }
}

// GET /api/notifications (Public - get recent notifications)
async function handleGetNotifications(request) {
  try {
    const notifications = await getCollection('notifications');
    const items = await notifications
      .find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();
    
    return handleCORS(NextResponse.json({ notifications: items }));
  } catch (error) {
    return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }));
  }
}

// GET /api/categories (Public - get all categories)
async function handleGetCategories() {
  const categories = [
    { id: 'local', name: 'Local News', icon: '🏘️' },
    { id: 'regional', name: 'Regional', icon: '🌆' },
    { id: 'national', name: 'National', icon: '🇮🇳' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
    { id: 'business', name: 'Business', icon: '💼' }
  ];
  
  return handleCORS(NextResponse.json({ categories }));
}

// GET /api/admin/articles (Admin/Editor - get all articles including unpublished)
async function handleAdminGetArticles(request) {
  const authResult = await requireAuth(request, 'editor');
  if (authResult.error) {
    return handleCORS(NextResponse.json({ error: authResult.error }, { status: authResult.status }));
  }
  
  try {
    const news = await getCollection('news');
    const articles = await news.find({}).sort({ createdAt: -1 }).toArray();
    
    return handleCORS(NextResponse.json({ articles }));
  } catch (error) {
    return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }));
  }
}

// Route handler function
async function handleRoute(request, { params }) {
  await initializeAdmin();
  
  const { path = [] } = params;
  const route = `/${path.join('/')}`;
  const method = request.method;
  
  try {
    // Root endpoint
    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ message: "Shrigonda News API" }));
    }
    
    // Public routes
    if (route === '/news' || route === '/news/') {
      if (method === 'GET') return handleGetNews(request);
      if (method === 'POST') return handleCreateArticle(request);
    }
    
    if (route.startsWith('/news/') && route.split('/').filter(Boolean).length === 2) {
      const articleId = route.split('/').filter(Boolean)[1];
      if (method === 'GET') return handleGetArticle(articleId);
      if (method === 'PUT') return handleUpdateArticle(request, articleId);
      if (method === 'DELETE') return handleDeleteArticle(request, articleId);
    }
    
    if (route === '/categories' && method === 'GET') {
      return handleGetCategories();
    }
    
    if (route === '/notifications' && method === 'GET') {
      return handleGetNotifications(request);
    }
    
    // Auth routes
    if (route === '/auth/login' && method === 'POST') {
      return handleLogin(request);
    }
    
    if (route === '/auth/verify' && method === 'GET') {
      return handleVerify(request);
    }
    
    // Admin routes
    if (route === '/users' && method === 'POST') {
      return handleCreateUser(request);
    }
    
    if (route === '/admin/articles' && method === 'GET') {
      return handleAdminGetArticles(request);
    }
    
    // Route not found
    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` }, 
      { status: 404 }
    ));
  } catch (error) {
    console.error('API Error:', error);
    return handleCORS(NextResponse.json(
      { error: "Internal server error", message: error.message }, 
      { status: 500 }
    ));
  }
}

// Export all HTTP methods
export const GET = handleRoute;
export const POST = handleRoute;
export const PUT = handleRoute;
export const DELETE = handleRoute;
export const PATCH = handleRoute;