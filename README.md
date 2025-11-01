# I Love Shrigonda News - Modern News Website

A complete, full-featured news website with admin CMS, role-based authentication, and real-time notifications.

## 🚀 Quick Start

### Access the Application:
- **Public Website:** https://event-debug.preview.emergentagent.com
- **Admin Portal:** https://event-debug.preview.emergentagent.com/admin/login
- **Credentials:** `admin` / `admin123`

### Local Development:
```bash
# Start development server
yarn dev

# Restart services
sudo supervisorctl restart nextjs
```

## ✨ Features

### Public Website:
- ✅ Dynamic breaking news carousel (auto-rotates every 5s)
- ✅ Breaking news ticker with continuous scroll
- ✅ Category filtering (6 categories)
- ✅ Search functionality
- ✅ **Individual article pages with full content**
- ✅ **Clickable article cards**
- ✅ Social sharing (Facebook, Twitter, LinkedIn)
- ✅ Real-time notifications
- ✅ Related articles recommendation
- ✅ View counter
- ✅ Responsive design

### Admin Dashboard:
- ✅ Create, edit, delete articles
- ✅ Category management
- ✅ Tag system
- ✅ View statistics
- ✅ Role-based permissions (Admin/Editor)

## 📁 Project Structure

```
/app/
├── app/
│   ├── page.js                      # Homepage
│   ├── article/[id]/page.js         # Article detail page (NEW)
│   ├── api/[[...path]]/route.js     # Backend API
│   └── globals.css                  # Theme & styles
├── lib/
│   ├── mongodb.js                   # Database connection
│   └── auth.js                      # JWT authentication
├── .env                             # Environment variables
└── package.json                     # Dependencies
```

## 🎨 Theme
- **Primary:** Red (#DC2626)
- **Backgrounds:** Black and White
- **Animations:** Framer Motion throughout

## 🔧 Configuration

### Environment Variables (`.env`):
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=shrigonda_news
NEXT_PUBLIC_BASE_URL=https://event-debug.preview.emergentagent.com
JWT_SECRET=your-secret-key
```

### Database:
- **Database:** shrigonda_news
- **Collections:** users, news, notifications

## 🎯 How It Works

### Reading Articles:
1. Visit homepage → Browse breaking news and article grid
2. Click any article card → Opens `/article/[id]` with full content
3. Read complete article with proper formatting
4. Share on social media or view related articles
5. Click "Back to Home" to return

### Creating Content (Admin):
1. Login at `/admin/login`
2. Click "Create New Article"
3. Fill in details (title, content, category, image, tags)
4. Submit → Article appears on homepage
5. Notification created automatically

## 📊 API Endpoints

### Public (No Auth):
- `GET /api/news` - Get all published articles
- `GET /api/news/:id` - Get single article (increments view count)
- `GET /api/categories` - Get all categories
- `GET /api/notifications` - Get recent notifications

### Protected (Require JWT):
- `POST /api/auth/login` - User login
- `POST /api/news` - Create article (Editor+)
- `PUT /api/news/:id` - Update article (Editor+)
- `DELETE /api/news/:id` - Delete article (Admin only)

## 🧪 Testing

### Test Articles:
5 sample articles are pre-loaded in the database covering all categories.

### Test Navigation:
```bash
# Get all articles
curl http://localhost:3000/api/news

# Get specific article
curl http://localhost:3000/api/news/article-1

# Test view counter (increments on each call)
curl http://localhost:3000/api/news/article-2
```

## 🐛 Troubleshooting

### Articles not showing?
```bash
# Check database
mongosh mongodb://localhost:27017/shrigonda_news --eval 'db.news.find().count()'

# Verify .env has correct DB_NAME
cat /app/.env | grep DB_NAME

# Should be: DB_NAME=shrigonda_news
```

### Server issues?
```bash
# Check status
sudo supervisorctl status

# Restart service
sudo supervisorctl restart nextjs

# Check logs
tail -n 100 /var/log/supervisor/nextjs*.log
```

## 📖 Documentation

- **`CHECKPOINT.md`** - Complete project documentation
- **`HANDOFF_PROMPT.md`** - Agent handoff guide

## 🎓 Tech Stack

- **Frontend:** Next.js 14, React 18, Tailwind CSS
- **UI:** Shadcn UI, Framer Motion
- **Backend:** Next.js API Routes
- **Database:** MongoDB
- **Auth:** JWT with bcrypt

## ✅ Status

**All features implemented and working:**
- ✅ Article navigation functional
- ✅ Full article pages display correctly
- ✅ Social sharing working
- ✅ View counter increments
- ✅ Admin CMS functional
- ✅ Real-time notifications working
- ✅ Responsive on all devices

## 🚀 Recent Updates

### Latest (v2.0):
- Created individual article detail pages at `/article/[id]`
- Made all article cards clickable
- Added full content display with proper formatting
- Implemented related articles feature
- Added "Back to Home" navigation
- Fixed database connection issue (DB_NAME configuration)
- Pre-loaded 5 sample articles

---

**Version:** 2.0  
**Last Updated:** January 2025  
**Status:** ✅ Production Ready
