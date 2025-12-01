# MongoDB Database Setup - Shrigonda News

## Connection Details
- **Database Name:** `shrigonda_news`
- **Connection URL:** `mongodb://localhost:27017`
- **Full Connection String:** `mongodb://localhost:27017/shrigonda_news`

## Collections Overview

### 1. **users** Collection
Stores user authentication and role information.

**Schema:**
```javascript
{
  _id: ObjectId,           // MongoDB auto-generated ID
  id: String,              // UUID for user (e.g., "aac885e0-bac2-4941-9aa0-2e0a0a9aea7c")
  username: String,        // Username for login
  password: String,        // Bcrypt hashed password
  role: String,           // "admin" or "editor"
  createdAt: String       // ISO timestamp
}
```

**Default Admin User:**
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** `admin`

### 2. **news** Collection
Stores all news articles.

**Schema:**
```javascript
{
  _id: ObjectId,           // MongoDB auto-generated ID
  id: String,              // UUID for article (e.g., "article-1")
  title: String,           // Article headline
  content: String,         // Full article text (with \n\n for paragraphs)
  excerpt: String,         // Short summary
  category: String,        // "local", "regional", "national", "sports", "entertainment", "business"
  image: String,           // Image URL (Unsplash URLs)
  tags: Array<String>,     // Array of tags
  author: String,          // Author username
  authorId: String,        // Author ID
  published: Boolean,      // true/false
  featured: Boolean,       // true/false (for highlighting)
  views: Number,           // View counter
  createdAt: String,       // ISO timestamp
  updatedAt: String        // ISO timestamp
}
```

### 3. **notifications** Collection (Auto-created)
Stores notifications for new articles.

**Schema:**
```javascript
{
  _id: ObjectId,
  id: String,              // UUID
  type: String,            // "new_article"
  title: String,           // Notification title
  message: String,         // Notification message
  articleId: String,       // Related article ID
  read: Boolean,           // true/false
  createdAt: String        // ISO timestamp
}
```

---

## Complete Database Data Export

### Export All Data to JSON Files

```bash
# Export users collection
mongosh mongodb://localhost:27017/shrigonda_news --quiet --eval "printjson(db.users.find().toArray())" > users_export.json

# Export news collection
mongosh mongodb://localhost:27017/shrigonda_news --quiet --eval "printjson(db.news.find().toArray())" > news_export.json

# Export all collections
mongodump --uri="mongodb://localhost:27017/shrigonda_news" --out=/tmp/mongodb_backup
```

---

## Full Database Seed Script

Save this as `seed_database.js` and run with: `mongosh mongodb://localhost:27017/shrigonda_news < seed_database.js`

```javascript
// Drop existing data (optional - uncomment to reset)
// db.users.drop();
// db.news.drop();
// db.notifications.drop();

// Insert Admin User
db.users.insertOne({
  id: 'admin-user-001',
  username: 'admin',
  password: '$2b$10$yYsWmksC7dQFDv5nMeS8x.UJeduIOkPxIs/pH9VDwboB1YBdIF9/C', // admin123
  role: 'admin',
  createdAt: new Date().toISOString()
});

// Insert Sample Articles
db.news.insertMany([
  {
    id: 'article-1',
    title: 'Shrigonda Celebrates Annual Festival with Grand Procession',
    content: 'Shrigonda witnessed a magnificent display of cultural heritage as thousands gathered for the annual festival procession. The event, which has been a tradition for over a century, showcased the rich cultural tapestry of the region.\n\nThe procession began at dawn with traditional music and dance performances. Local artisans displayed their crafts, and food stalls offered regional delicacies to the attendees. The festival committee reported record attendance this year.\n\nCommunity leaders expressed their gratitude to all participants and volunteers who made this event possible. The festival concluded with a spectacular fireworks display that lit up the night sky, symbolizing the unity and spirit of Shrigonda.',
    excerpt: 'Thousands gather for traditional annual festival featuring cultural performances, local crafts, and a grand procession through the city.',
    category: 'local',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3',
    tags: ['festival', 'tradition', 'culture'],
    author: 'admin',
    authorId: 'admin-user-001',
    published: true,
    featured: true,
    views: 1250,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'article-2',
    title: 'New Infrastructure Project to Transform City Roads',
    content: 'The municipal corporation has announced a major infrastructure development project that will transform the city\'s road network. The project, valued at ₹50 crores, is expected to significantly improve connectivity and reduce traffic congestion.\n\nThe plan includes widening of major roads, construction of new flyovers, and modernization of traffic management systems. Smart traffic lights and improved street lighting will be installed across key junctions.\n\nOfficials stated that the project will be completed in phases over the next 18 months. Local businesses and residents have welcomed the initiative, expecting it to boost economic activity and improve quality of life.',
    excerpt: '₹50 crore infrastructure project aims to modernize city roads with flyovers and smart traffic systems.',
    category: 'local',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
    tags: ['infrastructure', 'development', 'roads'],
    author: 'admin',
    authorId: 'admin-user-001',
    published: true,
    featured: false,
    views: 890,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'article-3',
    title: 'Local Students Win National Science Competition',
    content: 'Students from Shrigonda High School have brought laurels to the city by winning the prestigious National Science Competition. The team of five students competed against 200 schools from across the country.\n\nTheir project on sustainable water management impressed the judges with its innovative approach and practical applications. The students developed a cost-effective rainwater harvesting system that can be implemented in rural areas.\n\nThe school principal praised the students\' dedication and thanked the science teachers for their guidance. The municipal corporation has announced scholarships for the winning team members.',
    excerpt: 'Shrigonda High School team wins national science competition with innovative water management project.',
    category: 'local',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d',
    tags: ['education', 'students', 'achievement'],
    author: 'admin',
    authorId: 'admin-user-001',
    published: true,
    featured: false,
    views: 650,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'article-4',
    title: 'Maharashtra Announces New Agricultural Support Scheme',
    content: 'The Maharashtra government has unveiled a comprehensive agricultural support scheme aimed at helping farmers adopt modern farming techniques and improve crop yields. The scheme will provide subsidies on equipment and technical training.\n\nKey features include interest-free loans for small farmers, free soil testing services, and access to weather forecasting technology. The government has allocated ₹500 crores for the first phase of the scheme.\n\nAgricultural experts have welcomed the initiative, stating it will help farmers transition to sustainable farming practices while ensuring better income. The scheme will be rolled out across all districts starting next month.',
    excerpt: 'State government launches ₹500 crore scheme to support farmers with modern techniques and equipment subsidies.',
    category: 'regional',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449',
    tags: ['agriculture', 'government', 'farming'],
    author: 'admin',
    authorId: 'admin-user-001',
    published: true,
    featured: false,
    views: 1420,
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    updatedAt: new Date(Date.now() - 10800000).toISOString()
  },
  {
    id: 'article-5',
    title: 'India Launches New Digital Payment Initiative',
    content: 'The Government of India has launched a new digital payment initiative aimed at promoting cashless transactions in rural areas. The program will provide training and infrastructure support to enable digital payment adoption.\n\nThe initiative includes setting up digital payment kiosks in villages, training local entrepreneurs as digital payment agents, and providing incentives for merchants who adopt digital payments. The program aims to cover 100,000 villages in the first year.\n\nBanking experts believe this will significantly boost financial inclusion and reduce cash dependency. Special focus will be given to women entrepreneurs and small business owners.',
    excerpt: 'New national program aims to promote digital payments in rural India with training and infrastructure support.',
    category: 'national',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3',
    tags: ['digital', 'payments', 'technology'],
    author: 'admin',
    authorId: 'admin-user-001',
    published: true,
    featured: false,
    views: 2100,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    updatedAt: new Date(Date.now() - 14400000).toISOString()
  },
  {
    id: 'article-6',
    title: 'Local Cricket Team Wins State Championship',
    content: 'The Shrigonda Cricket Club has made history by winning the state championship after a thrilling final match. The team defeated the defending champions in a nail-biting finish.\n\nCaptain Rahul Sharma led from the front with a match-winning century. The victory marks the clubs first state championship win in 15 years.\n\nCelebrations erupted across the city as news of the victory spread. The municipal corporation has announced a grand felicitation ceremony.',
    excerpt: 'Shrigonda Cricket Club clinches state championship with thrilling victory over defending champions.',
    category: 'sports',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e',
    tags: ['cricket', 'sports', 'championship'],
    author: 'admin',
    authorId: 'admin-user-001',
    published: true,
    featured: false,
    views: 850,
    createdAt: new Date(Date.now() - 18000000).toISOString(),
    updatedAt: new Date(Date.now() - 18000000).toISOString()
  },
  {
    id: 'article-7',
    title: 'New Entertainment Complex to Open Next Month',
    content: 'A state-of-the-art entertainment complex featuring multiplex cinemas, gaming zones, and food courts is set to open in Shrigonda next month.\n\nThe complex will feature 8 cinema screens with latest technology, gaming zones with VR, and over 20 food outlets. Investment is 30 crores.\n\nThis development is expected to create over 200 jobs for local youth.',
    excerpt: 'Entertainment complex with multiplex cinemas and gaming zones to open next month.',
    category: 'entertainment',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
    tags: ['entertainment', 'cinema', 'development'],
    author: 'admin',
    authorId: 'admin-user-001',
    published: true,
    featured: false,
    views: 720,
    createdAt: new Date(Date.now() - 21600000).toISOString(),
    updatedAt: new Date(Date.now() - 21600000).toISOString()
  },
  {
    id: 'article-8',
    title: 'Local Startups Receive Government Funding',
    content: 'Three innovative startups from Shrigonda have been selected for government funding. The startups will receive grants totaling 2 crores along with mentorship.\n\nThe selected startups operate in agri-tech, fintech, and e-commerce sectors. They were chosen from 500 applications.\n\nThis recognition puts Shrigonda on the map as an emerging startup hub.',
    excerpt: 'Three Shrigonda startups receive government funding under Maharashtra Startup Program.',
    category: 'business',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd',
    tags: ['startups', 'business', 'funding'],
    author: 'admin',
    authorId: 'admin-user-001',
    published: true,
    featured: false,
    views: 680,
    createdAt: new Date(Date.now() - 25200000).toISOString(),
    updatedAt: new Date(Date.now() - 25200000).toISOString()
  },
  {
    id: 'article-9',
    title: 'Heritage Conservation Project Launched',
    content: 'The Municipal Corporation has launched heritage conservation project to preserve historical monuments. The project has a budget of 15 crores and will span three years.\n\nThe initiative will focus on restoring old temples and traditional houses. Special attention will be given to authentic architectural style.\n\nThis project will help promote Shrigonda as a heritage tourism destination.',
    excerpt: 'Heritage conservation project to preserve city monuments and architecture.',
    category: 'local',
    image: 'https://images.unsplash.com/photo-1564417947-4f54f8aec4c1',
    tags: ['heritage', 'conservation', 'tourism'],
    author: 'admin',
    authorId: 'admin-user-001',
    published: true,
    featured: false,
    views: 590,
    createdAt: new Date(Date.now() - 28800000).toISOString(),
    updatedAt: new Date(Date.now() - 28800000).toISOString()
  },
  {
    id: 'article-10',
    title: 'Record Rainfall Brings Relief to Farmers',
    content: 'The region has received record rainfall this monsoon, bringing relief to farmers after two years of drought. Reservoirs are at full capacity.\n\nAgricultural experts predict a bumper crop this year. Farmers have begun sowing with renewed enthusiasm.\n\nThe water situation has eased concerns. Water rationing will be lifted from next week.',
    excerpt: 'Record monsoon rainfall brings relief to farmers after two years of drought.',
    category: 'local',
    image: 'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31',
    tags: ['weather', 'agriculture', 'monsoon'],
    author: 'admin',
    authorId: 'admin-user-001',
    published: true,
    featured: false,
    views: 1100,
    createdAt: new Date(Date.now() - 32400000).toISOString(),
    updatedAt: new Date(Date.now() - 32400000).toISOString()
  }
]);

print('✅ Database seeded successfully!');
print('Total users: ' + db.users.countDocuments());
print('Total articles: ' + db.news.countDocuments());
```

---

## Quick MongoDB Commands

### Connect to Database
```bash
mongosh mongodb://localhost:27017/shrigonda_news
```

### View All Collections
```javascript
show collections
```

### Count Documents
```javascript
db.users.countDocuments()
db.news.countDocuments()
```

### Find All Articles
```javascript
db.news.find().pretty()
```

### Find Articles by Category
```javascript
db.news.find({ category: "local" }).pretty()
db.news.find({ category: "sports" }).pretty()
```

### Find Published Articles
```javascript
db.news.find({ published: true }).pretty()
```

### Update Article Views
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
  title: 'Your New Article Title',
  content: 'Full article content here...',
  excerpt: 'Short summary',
  category: 'local',
  image: 'https://images.unsplash.com/photo-...',
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

### Delete Article
```javascript
db.news.deleteOne({ id: "article-10" })
```

### Update Article
```javascript
db.news.updateOne(
  { id: "article-1" },
  { 
    $set: { 
      title: "Updated Title",
      updatedAt: new Date().toISOString()
    }
  }
)
```

---

## Backup and Restore

### Create Backup
```bash
mongodump --uri="mongodb://localhost:27017/shrigonda_news" --out=/tmp/mongodb_backup
```

### Restore from Backup
```bash
mongorestore --uri="mongodb://localhost:27017/shrigonda_news" /tmp/mongodb_backup/shrigonda_news
```

### Export to JSON
```bash
mongoexport --uri="mongodb://localhost:27017/shrigonda_news" --collection=news --out=news.json --pretty
mongoexport --uri="mongodb://localhost:27017/shrigonda_news" --collection=users --out=users.json --pretty
```

### Import from JSON
```bash
mongoimport --uri="mongodb://localhost:27017/shrigonda_news" --collection=news --file=news.json --jsonArray
```

---

## Environment Variables

Add these to your `.env` file:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=shrigonda_news
JWT_SECRET=your-secret-key-here
NEXT_PUBLIC_BASE_URL=https://iloveshrigonda.com
```

---

## Database Statistics

- **Total Collections:** 2 (users, news)
- **Total Users:** 1
- **Total Articles:** 10
- **Categories:** 6 (local, regional, national, sports, entertainment, business)
- **Published Articles:** 10
- **Average Views:** 915 per article

---

## Troubleshooting

### Cannot Connect to MongoDB
```bash
# Check if MongoDB is running
sudo supervisorctl status mongodb

# Restart MongoDB
sudo supervisorctl restart mongodb
```

### Reset Database
```bash
mongosh mongodb://localhost:27017/shrigonda_news --eval "db.dropDatabase()"
```

### Check Logs
```bash
tail -f /var/log/mongodb/mongod.log
```

---

**Last Updated:** October 24, 2025
