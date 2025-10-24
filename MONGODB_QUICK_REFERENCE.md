# MongoDB Quick Reference - Shrigonda News

## 🔗 Connection Info
```
Database: shrigonda_news
URL: mongodb://localhost:27017
Full: mongodb://localhost:27017/shrigonda_news
```

## 📊 Database Structure

```
shrigonda_news/
├── users (1 document)
│   └── Admin user for authentication
└── news (10 documents)
    ├── 6 Local News
    ├── 1 Regional News
    ├── 1 National News
    ├── 1 Sports
    ├── 1 Entertainment
    └── 1 Business
```

## 👤 Admin Credentials
```
Username: admin
Password: admin123
Role: admin
```

## 📰 Articles Summary

| ID | Title | Category | Views | Featured |
|----|-------|----------|-------|----------|
| article-1 | Shrigonda Celebrates Annual Festival | local | 1257 | ✅ |
| article-2 | New Infrastructure Project | local | 890 | ❌ |
| article-3 | Local Students Win Competition | local | 650 | ❌ |
| article-4 | Agricultural Support Scheme | regional | 1420 | ❌ |
| article-5 | Digital Payment Initiative | national | 2100 | ❌ |
| article-6 | Cricket Team Wins Championship | sports | 854 | ❌ |
| article-7 | Entertainment Complex Opens | entertainment | 722 | ❌ |
| article-8 | Startups Receive Funding | business | 680 | ❌ |
| article-9 | Heritage Conservation Project | local | 590 | ❌ |
| article-10 | Record Rainfall Relief | local | 1100 | ❌ |

**Total Views: 9,163 | Average: 916 per article**

## 🚀 Quick Commands

### View Data
```bash
# Connect to database
mongosh mongodb://localhost:27017/shrigonda_news

# Count articles
db.news.countDocuments()

# View all articles (summary)
db.news.find({}, {title: 1, category: 1, views: 1})

# View all users
db.users.find()
```

### Export Data
```bash
# Export everything
mongodump --uri="mongodb://localhost:27017/shrigonda_news" --out=/tmp/backup

# Export articles only
mongoexport --uri="mongodb://localhost:27017/shrigonda_news" \
  --collection=news --out=articles.json --pretty
```

### Import Data
```bash
# Restore everything
mongorestore --uri="mongodb://localhost:27017/shrigonda_news" /tmp/backup/shrigonda_news

# Import articles
mongoimport --uri="mongodb://localhost:27017/shrigonda_news" \
  --collection=news --file=articles.json
```

## 🔍 Useful Queries

### Get Articles by Category
```javascript
db.news.find({ category: "local" })
db.news.find({ category: "sports" })
```

### Get Top 5 Most Viewed
```javascript
db.news.find().sort({ views: -1 }).limit(5)
```

### Get Latest 5 Articles
```javascript
db.news.find().sort({ createdAt: -1 }).limit(5)
```

### Search by Title
```javascript
db.news.find({ title: /Festival/i })
```

### Update Views Count
```javascript
db.news.updateOne(
  { id: "article-1" },
  { $inc: { views: 1 } }
)
```

### Add New Article
```javascript
db.news.insertOne({
  id: 'article-11',
  title: 'New Article Title',
  content: 'Full content here...',
  excerpt: 'Short summary',
  category: 'local',
  image: 'https://images.unsplash.com/photo-xxx',
  tags: ['tag1', 'tag2'],
  author: 'admin',
  authorId: 'admin-user-001',
  published: true,
  featured: false,
  views: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
})
```

## 🗂️ File Locations

- **Setup Guide**: `/app/MONGODB_SETUP.md`
- **Complete Export**: `/app/DATABASE_COMPLETE_EXPORT.md`
- **Users Export**: `/app/mongodb_exports/users.json`
- **Articles Export**: `/app/mongodb_exports/news.json`

## 🔧 Troubleshooting

### MongoDB Not Running?
```bash
sudo supervisorctl status mongodb
sudo supervisorctl restart mongodb
```

### Reset Database
```bash
mongosh mongodb://localhost:27017/shrigonda_news --eval "db.dropDatabase()"
```

### Check Connection
```bash
mongosh mongodb://localhost:27017/shrigonda_news --eval "db.stats()"
```

## 📈 Statistics

- **Total Collections**: 2
- **Total Documents**: 11
- **Total Articles**: 10
- **Total Users**: 1
- **Categories**: 6
- **Total Tags**: 30
- **Database Size**: ~50KB

---

**Last Updated**: October 24, 2025
**MongoDB Version**: 6.6.0
