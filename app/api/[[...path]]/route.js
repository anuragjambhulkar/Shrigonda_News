// app/api/[[...path]]/route.js
import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  extractToken
} from '@/lib/auth';
import { ObjectId } from 'mongodb';  // ✅ FIX: added missing import
import { v4 as uuidv4 } from 'uuid';

/* ---------------------------- Helper: CORS ---------------------------- */
function handleCORS(response) {
  const origin = process.env.CORS_ORIGINS || '*';
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

export async function OPTIONS() {
  const res = new NextResponse(null, { status: 200 });
  return handleCORS(res);
}

/* ---------------------- Auth + Admin Initialization ---------------------- */
async function requireAuth(request, requiredRole = null) {
  try {
    const token = extractToken(request);
    if (!token) return { error: 'Unauthorized', status: 401 };

    const decoded = await Promise.resolve(verifyToken(token));
    if (!decoded) return { error: 'Invalid token', status: 401 };

    const role = decoded.role || decoded.roles || null;
    if (requiredRole && !(role === 'admin' || role === requiredRole)) {
      return { error: 'Forbidden', status: 403 };
    }
    return { user: decoded };
  } catch {
    return { error: 'Invalid token', status: 401 };
  }
}

async function initializeAdmin() {
  try {
    const users = await getCollection('users');
    const adminExists = await users.findOne({
      $or: [{ username: 'admin' }, { email: 'admin@shrigondanews.com' }]
    });

    if (!adminExists) {
      const passwordHash = await Promise.resolve(hashPassword('admin123'));
      await users.insertOne({
        id: uuidv4(),
        username: 'admin',
        name: 'Admin User',
        email: 'admin@shrigondanews.com',
        password: passwordHash,
        role: 'admin',
        createdAt: new Date().toISOString()
      });
      console.log('✅ Default admin user created: admin / admin123');
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
}

/* ----------------------------- Auth Routes ----------------------------- */
async function handleLogin(request) {
  try {
    const body = await request.json();
    const username = body.username?.trim() || null;
    const email = body.email?.trim() || null;
    const password = body.password || '';

    const users = await getCollection('users');
    const user = await users.findOne({
      $or: [username ? { username } : null, email ? { email } : null].filter(Boolean)
    });

    if (!user) return handleCORS(NextResponse.json({ error: 'Invalid credentials' }, { status: 401 }));

    const valid = await Promise.resolve(comparePassword(password, user.password));
    if (!valid) return handleCORS(NextResponse.json({ error: 'Invalid credentials' }, { status: 401 }));

    const token = await Promise.resolve(generateToken({
      id: user.id || user._id,
      username: user.username,
      role: user.role || 'editor'
    }));

    const res = NextResponse.json({
      token,
      user: { id: user.id || user._id, username: user.username, role: user.role }
    });
    return handleCORS(res);
  } catch (error) {
    console.error('Login error:', error);
    return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }));
  }
}

async function handleVerify(request) {
  const authResult = await requireAuth(request);
  if (authResult.error)
    return handleCORS(NextResponse.json({ error: authResult.error }, { status: authResult.status }));

  return handleCORS(NextResponse.json({ user: authResult.user }));
}

/* ------------------------- Users (Admin Only) -------------------------- */
async function handleCreateUser(request) {
  const authResult = await requireAuth(request, 'admin');
  if (authResult.error)
    return handleCORS(NextResponse.json({ error: authResult.error }, { status: authResult.status }));

  try {
    const body = await request.json();
    const username = body.username?.trim();
    const email = body.email?.trim();
    const password = body.password;
    const role = body.role || 'editor';

    if (!username || !password)
      return handleCORS(NextResponse.json({ error: 'username and password required' }, { status: 400 }));

    const users = await getCollection('users');
    const exists = await users.findOne({ $or: [{ username }, { email }] });
    if (exists)
      return handleCORS(NextResponse.json({ error: 'Username or email already exists' }, { status: 400 }));

    const passwordHash = await Promise.resolve(hashPassword(password));
    const newUser = {
      id: uuidv4(),
      username,
      email,
      password: passwordHash,
      role,
      createdAt: new Date().toISOString()
    };
    await users.insertOne(newUser);

    return handleCORS(NextResponse.json({
      message: 'User created',
      user: { id: newUser.id, username: newUser.username, role: newUser.role }
    }));
  } catch (error) {
    console.error('Create user error:', error);
    return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }));
  }
}

/* ---------------------------- News: Public ----------------------------- */
async function handleGetNews(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const news = await getCollection('news');

    const query = category ? { category, status: 'published' } : { status: 'published' };
    const articles = await news.find(query).sort({ createdAt: -1 }).limit(limit).toArray();
    return handleCORS(NextResponse.json({ articles }));
  } catch (error) {
    console.error('Error fetching news:', error);
    return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }));
  }
}

/* ---------------------- News: Single Article ----------------------- */
async function handleGetArticle(articleId) {
  try {
    const news = await getCollection('news');

    let article = null;
    if (ObjectId.isValid(articleId))
      article = await news.findOne({ _id: new ObjectId(articleId), status: 'published' });
    if (!article)
      article = await news.findOne({ id: articleId, status: 'published' });

    if (!article)
      return handleCORS(NextResponse.json({ error: 'Article not found' }, { status: 404 }));

    await news.updateOne({ _id: article._id }, { $inc: { views: 1 } });
    return handleCORS(NextResponse.json({ article }));
  } catch (error) {
    console.error('Get article error:', error);
    return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }));
  }
}

/* ---------------------------- News: Admin ---------------------------- */
async function handleCreateArticle(request) {
  const authResult = await requireAuth(request, 'editor');
  if (authResult.error)
    return handleCORS(NextResponse.json({ error: authResult.error }, { status: authResult.status }));

  try {
    const data = await request.json();
    const { title, content, category, image, excerpt, tags } = data;
    const user = authResult.user;

    const article = {
      id: uuidv4(),
      title,
      content,
      excerpt: excerpt || content?.substring(0, 200),
      category,
      image: image || '',
      tags: tags || [],
      author: user.username || user.email,
      authorId: user.id,
      status: 'published',
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const news = await getCollection('news');
    await news.insertOne(article);

    // Create notification
    try {
      const notifications = await getCollection('notifications');
      await notifications.insertOne({
        id: uuidv4(),
        title: 'New Article Published',
        message: `New article "${title}" has been published in ${category}.`,
        articleId: article.id,
        read: false,
        createdAt: new Date().toISOString()
      });
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
      // Don't fail the request if notification fails
    }

    return handleCORS(NextResponse.json({ message: 'Article created', article }));
  } catch (error) {
    console.error('Create article error:', error);
    return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }));
  }
}

/* ----------------------- Update/Delete Articles ----------------------- */
async function handleUpdateArticle(request, articleId) {
  const authResult = await requireAuth(request, 'editor');
  if (authResult.error)
    return handleCORS(NextResponse.json({ error: authResult.error }, { status: authResult.status }));

  try {
    const updates = await request.json();
    updates.updatedAt = new Date().toISOString();

    const news = await getCollection('news');
    const result = await news.updateOne({ id: articleId }, { $set: updates });

    if (result.matchedCount === 0)
      return handleCORS(NextResponse.json({ error: 'Article not found' }, { status: 404 }));

    return handleCORS(NextResponse.json({ message: 'Article updated' }));
  } catch (error) {
    console.error('Update article error:', error);
    return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }));
  }
}

async function handleDeleteArticle(request, articleId) {
  const authResult = await requireAuth(request, 'admin');
  if (authResult.error)
    return handleCORS(NextResponse.json({ error: authResult.error }, { status: authResult.status }));

  try {
    const news = await getCollection('news');
    const result = await news.deleteOne({ id: articleId });

    if (result.deletedCount === 0)
      return handleCORS(NextResponse.json({ error: 'Article not found' }, { status: 404 }));

    return handleCORS(NextResponse.json({ message: 'Article deleted' }));
  } catch (error) {
    console.error('Delete article error:', error);
    return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }));
  }
}

/* -------------------------- Misc Routes -------------------------- */
async function handleGetNotifications() {
  try {
    const notifications = await getCollection('notifications');
    const items = await notifications.find({}).sort({ createdAt: -1 }).limit(20).toArray();
    return handleCORS(NextResponse.json({ notifications: items }));
  } catch (error) {
    console.error('Get notifications error:', error);
    return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }));
  }
}

function handleGetCategories() {
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

/* ----------------------- Admin: All Articles ---------------------- */
async function handleAdminGetArticles(request) {
  const authResult = await requireAuth(request, 'editor');
  if (authResult.error)
    return handleCORS(NextResponse.json({ error: authResult.error }, { status: authResult.status }));

  try {
    const news = await getCollection('news');
    const articles = await news.find({}).sort({ createdAt: -1 }).toArray();
    return handleCORS(NextResponse.json({ articles }));
  } catch (error) {
    console.error('Admin get articles error:', error);
    return handleCORS(NextResponse.json({ error: error.message }, { status: 500 }));
  }
}

/* ------------------------- Main Route Handler ------------------------- */
async function handleRoute(request, { params }) {
  await initializeAdmin();

  const { path = [] } = params || {};
  const route = `/${path.join('/')}`;
  const method = request.method?.toUpperCase();

  try {
    if (route === '/' && method === 'GET')
      return handleCORS(NextResponse.json({ message: 'I Love Shrigonda News API' }));

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

    if (route === '/categories' && method === 'GET') return handleGetCategories();
    if (route === '/notifications' && method === 'GET') return handleGetNotifications();
    if (route === '/auth/login' && method === 'POST') return handleLogin(request);
    if (route === '/auth/verify' && method === 'GET') return handleVerify(request);
    if (route === '/users' && method === 'POST') return handleCreateUser(request);
    if (route === '/admin/articles' && method === 'GET') return handleAdminGetArticles(request);

    return handleCORS(NextResponse.json({ error: `Route ${route} not found` }, { status: 404 }));
  } catch (error) {
    console.error('API Error:', error);
    return handleCORS(NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 }));
  }
}

// Export methods for Next.js App Router
export const GET = handleRoute;
export const POST = handleRoute;
export const PUT = handleRoute;
export const DELETE = handleRoute;
export const PATCH = handleRoute;
