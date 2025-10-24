# Complete MongoDB Database Export - Shrigonda News

## Database Overview

**Database Name:** `shrigonda_news`  
**Connection:** `mongodb://localhost:27017/shrigonda_news`  
**Total Collections:** 2  
**Total Documents:** 11 (1 user + 10 articles)  
**Export Date:** October 24, 2025

---

## Collection 1: USERS

**Collection Name:** `users`  
**Document Count:** 1  
**Purpose:** Store admin and editor user accounts

### User Schema:
```json
{
  "_id": ObjectId,
  "id": "UUID",
  "username": "string",
  "password": "bcrypt_hash",
  "role": "admin|editor",
  "createdAt": "ISO_timestamp"
}
```

### Current Data:

**Admin User:**
- **Username:** `admin`
- **Password:** `admin123` (hashed: `$2b$10$yYsWmksC7dQFDv5nMeS8x.UJeduIOkPxIs/pH9VDwboB1YBdIF9/C`)
- **Role:** `admin`
- **UUID:** `aac885e0-bac2-4941-9aa0-2e0a0a9aea7c`
- **Created:** 2025-10-24T16:22:39.858Z

---

## Collection 2: NEWS (Articles)

**Collection Name:** `news`  
**Document Count:** 10  
**Purpose:** Store all news articles

### Article Schema:
```json
{
  "_id": ObjectId,
  "id": "string",
  "title": "string",
  "content": "string (multi-paragraph)",
  "excerpt": "string (summary)",
  "category": "local|regional|national|sports|entertainment|business",
  "image": "URL",
  "tags": ["array", "of", "strings"],
  "author": "string",
  "authorId": "string",
  "published": boolean,
  "featured": boolean,
  "views": number,
  "createdAt": "ISO_timestamp",
  "updatedAt": "ISO_timestamp"
}
```

### Current Articles:

#### Article 1: Festival Article (Featured)
```json
{
  "id": "article-1",
  "title": "Shrigonda Celebrates Annual Festival with Grand Procession",
  "category": "local",
  "featured": true,
  "views": 1257,
  "tags": ["festival", "tradition", "culture"],
  "image": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3"
}
```

#### Article 2: Infrastructure
```json
{
  "id": "article-2",
  "title": "New Infrastructure Project to Transform City Roads",
  "category": "local",
  "featured": false,
  "views": 890,
  "tags": ["infrastructure", "development", "roads"],
  "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab"
}
```

#### Article 3: Education
```json
{
  "id": "article-3",
  "title": "Local Students Win National Science Competition",
  "category": "local",
  "featured": false,
  "views": 650,
  "tags": ["education", "students", "achievement"],
  "image": "https://images.unsplash.com/photo-1532094349884-543bc11b234d"
}
```

#### Article 4: Agriculture
```json
{
  "id": "article-4",
  "title": "Maharashtra Announces New Agricultural Support Scheme",
  "category": "regional",
  "featured": false,
  "views": 1420,
  "tags": ["agriculture", "government", "farming"],
  "image": "https://images.unsplash.com/photo-1625246333195-78d9c38ad449"
}
```

#### Article 5: Digital Payment
```json
{
  "id": "article-5",
  "title": "India Launches New Digital Payment Initiative",
  "category": "national",
  "featured": false,
  "views": 2100,
  "tags": ["digital", "payments", "technology"],
  "image": "https://images.unsplash.com/photo-1563013544-824ae1b704d3"
}
```

#### Article 6: Sports
```json
{
  "id": "article-6",
  "title": "Local Cricket Team Wins State Championship",
  "category": "sports",
  "featured": false,
  "views": 854,
  "tags": ["cricket", "sports", "championship"],
  "image": "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e"
}
```

#### Article 7: Entertainment
```json
{
  "id": "article-7",
  "title": "New Entertainment Complex to Open Next Month",
  "category": "entertainment",
  "featured": false,
  "views": 722,
  "tags": ["entertainment", "cinema", "development"],
  "image": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba"
}
```

#### Article 8: Business
```json
{
  "id": "article-8",
  "title": "Local Startups Receive Government Funding",
  "category": "business",
  "featured": false,
  "views": 680,
  "tags": ["startups", "business", "funding"],
  "image": "https://images.unsplash.com/photo-1559136555-9303baea8ebd"
}
```

#### Article 9: Heritage
```json
{
  "id": "article-9",
  "title": "Heritage Conservation Project Launched",
  "category": "local",
  "featured": false,
  "views": 590,
  "tags": ["heritage", "conservation", "tourism"],
  "image": "https://images.unsplash.com/photo-1564417947-4f54f8aec4c1"
}
```

#### Article 10: Weather
```json
{
  "id": "article-10",
  "title": "Record Rainfall Brings Relief to Farmers",
  "category": "local",
  "featured": false,
  "views": 1100,
  "tags": ["weather", "agriculture", "monsoon"],
  "image": "https://images.unsplash.com/photo-1501630834273-4b5604d2ee31"
}
```

---

## Category Distribution

| Category | Count | Articles |
|----------|-------|----------|
| Local | 6 | Articles 1, 2, 3, 9, 10 |
| Regional | 1 | Article 4 |
| National | 1 | Article 5 |
| Sports | 1 | Article 6 |
| Entertainment | 1 | Article 7 |
| Business | 1 | Article 8 |

---

## View Statistics

**Total Views:** 9,163  
**Average Views:** 916 per article  
**Most Viewed:** Article 5 (Digital Payment) - 2,100 views  
**Least Viewed:** Article 9 (Heritage) - 590 views

---

## Import/Export Commands

### Export Current Data
```bash
# Export entire database
mongodump --uri="mongodb://localhost:27017/shrigonda_news" --out=/tmp/shrigonda_backup

# Export individual collections
mongoexport --uri="mongodb://localhost:27017/shrigonda_news" --collection=users --out=users.json --pretty
mongoexport --uri="mongodb://localhost:27017/shrigonda_news" --collection=news --out=news.json --pretty
```

### Import Data
```bash
# Restore entire database
mongorestore --uri="mongodb://localhost:27017/shrigonda_news" /tmp/shrigonda_backup/shrigonda_news

# Import individual collections
mongoimport --uri="mongodb://localhost:27017/shrigonda_news" --collection=users --file=users.json
mongoimport --uri="mongodb://localhost:27017/shrigonda_news" --collection=news --file=news.json --jsonArray
```

### Reset and Re-seed
```bash
# Drop database
mongosh mongodb://localhost:27017/shrigonda_news --eval "db.dropDatabase()"

# Re-seed using script (see MONGODB_SETUP.md)
mongosh mongodb://localhost:27017/shrigonda_news < seed_database.js
```

---

## Exported Files Location

All exported data is available at:
- **Users:** `/app/mongodb_exports/users.json`
- **Articles:** `/app/mongodb_exports/news.json`
- **Full Documentation:** `/app/MONGODB_SETUP.md`

---

## Quick Access Queries

### Get All Articles by Category
```javascript
// Local news
db.news.find({ category: "local" })

// Sports
db.news.find({ category: "sports" })
```

### Get Featured Articles
```javascript
db.news.find({ featured: true })
```

### Get Most Viewed Articles
```javascript
db.news.find().sort({ views: -1 }).limit(5)
```

### Get Recent Articles
```javascript
db.news.find().sort({ createdAt: -1 }).limit(5)
```

### Search Articles by Title
```javascript
db.news.find({ 
  title: { $regex: "Festival", $options: "i" }
})
```

### Update Article Views
```javascript
db.news.updateOne(
  { id: "article-1" },
  { $inc: { views: 1 } }
)
```

---

## Database Indexes (Recommended)

For better performance, add these indexes:

```javascript
// Index on article ID
db.news.createIndex({ id: 1 }, { unique: true })

// Index on category
db.news.createIndex({ category: 1 })

// Index on published status
db.news.createIndex({ published: 1 })

// Index on created date (for sorting)
db.news.createIndex({ createdAt: -1 })

// Text index for search
db.news.createIndex({ 
  title: "text", 
  content: "text",
  excerpt: "text"
})

// User username index
db.users.createIndex({ username: 1 }, { unique: true })
```

---

## Maintenance Scripts

### Clean Up Old Articles
```javascript
// Delete articles older than 6 months with low views
const sixMonthsAgo = new Date();
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

db.news.deleteMany({
  createdAt: { $lt: sixMonthsAgo.toISOString() },
  views: { $lt: 100 }
})
```

### Reset All View Counts
```javascript
db.news.updateMany({}, { $set: { views: 0 } })
```

### Archive Unpublished Articles
```javascript
db.news_archive.insertMany(
  db.news.find({ published: false }).toArray()
)
db.news.deleteMany({ published: false })
```

---

## Backup Schedule (Recommended)

- **Daily:** Automated mongodump at midnight
- **Weekly:** Full database export to cloud storage
- **Monthly:** Archive old articles to separate collection

---

**Generated:** October 24, 2025  
**Database Version:** MongoDB 6.6.0  
**Application:** Shrigonda News v2.0
