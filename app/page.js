'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Menu, X, TrendingUp, Clock, Eye, Share2, Facebook, Twitter, Linkedin, Radio, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const categories = [
  { id: 'local', name: 'Local News', icon: '🏘️' },
  { id: 'regional', name: 'Regional', icon: '🌆' },
  { id: 'national', name: 'National', icon: '🇮🇳' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
  { id: 'business', name: 'Business', icon: '💼' }
];

export default function HomePage() {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentBreakingIndex, setCurrentBreakingIndex] = useState(0);

  useEffect(() => {
    loadArticles();
    loadNotifications();
    
    // Poll for new notifications every 10 seconds
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterArticles();
  }, [selectedCategory, searchQuery, articles]);

  // Auto-rotate breaking news every 5 seconds
  useEffect(() => {
    if (filteredArticles.length > 1) {
      const interval = setInterval(() => {
        setCurrentBreakingIndex((prev) => (prev + 1) % Math.min(filteredArticles.length, 5));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [filteredArticles]);

  const loadArticles = async () => {
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error('Failed to load articles:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      const unreadNotifs = (data.notifications || []).filter(n => !n.read);
      setNotifications(unreadNotifs);
      
      if (unreadNotifs.length > 0 && notifications.length < unreadNotifs.length) {
        toast.success('New article published!', {
          description: unreadNotifs[0].message
        });
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const filterArticles = () => {
    let filtered = articles;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredArticles(filtered);
  };

  const navigateToArticle = (articleId) => {
    window.location.href = `/article/${articleId}`;
  };

  const shareArticle = (article, platform, e) => {
    e?.stopPropagation(); // Prevent card click when sharing
    const url = `${window.location.origin}/article/${article.id}`;
    const text = `${article.title} - Shrigonda News`;
    
    let shareUrl = '';
    switch(platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const latestArticles = filteredArticles.slice(0, 5);
  const currentBreaking = latestArticles[currentBreakingIndex];
  const trendingArticles = filteredArticles.slice(5, 8);
  const regularArticles = filteredArticles.slice(8);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="https://customer-assets.emergentagent.com/job_754a0040-d589-4dfd-90f1-615496373220/artifacts/7inmznbe_logo.jpg" 
              alt="Shrigonda News" 
              className="h-12 w-auto"
            />
            <div className="hidden md:block">
              <h1 className="text-2xl font-bold text-primary">Shrigonda News</h1>
              <p className="text-xs text-muted-foreground">Your Love for the City</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2">
              <Input 
                placeholder="Search news..." 
                className="w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button size="icon" variant="ghost">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Notifications */}
            <div className="relative">
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </Button>
              
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-80 bg-card border rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto"
                >
                  <h3 className="font-bold mb-2">Notifications</h3>
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No new notifications</p>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map(notif => (
                        <div key={notif.id} className="text-sm p-2 bg-muted rounded">
                          <p className="font-medium">{notif.title}</p>
                          <p className="text-muted-foreground">{notif.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
            
            {/* Mobile Menu */}
            <Button 
              size="icon" 
              variant="ghost" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            className="md:hidden border-t"
          >
            <div className="container py-4">
              <Input 
                placeholder="Search news..." 
                className="mb-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        )}
      </header>

      {/* Breaking News Ticker */}
      <div className="breaking-gradient text-white overflow-hidden">
        <div className="container flex items-center h-12">
          <div className="flex items-center gap-2 mr-4 animate-pulse">
            <Radio className="h-5 w-5 text-white" />
            <span className="font-bold text-sm whitespace-nowrap">BREAKING NEWS</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex animate-ticker">
              {latestArticles.map((article, idx) => (
                <span key={idx} className="inline-flex items-center mr-8 text-sm whitespace-nowrap">
                  <AlertCircle className="h-3 w-3 mr-2" />
                  {article.title}
                </span>
              ))}
              {latestArticles.map((article, idx) => (
                <span key={`dup-${idx}`} className="inline-flex items-center mr-8 text-sm whitespace-nowrap">
                  <AlertCircle className="h-3 w-3 mr-2" />
                  {article.title}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Breaking News Hero */}
      {currentBreaking && (
        <section className="relative bg-black text-white overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBreakingIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              {/* Background Image with Overlay */}
              <div className="absolute inset-0 z-0">
                <img 
                  src={currentBreaking.image || 'https://images.unsplash.com/photo-1495020689067-958852a7765e'}
                  alt={currentBreaking.title}
                  className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
              </div>

              {/* Content */}
              <div className="container relative z-10 py-20">
                <div className="max-w-3xl">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <Badge className="mb-4 bg-primary text-white border-0 animate-pulse-glow">
                      <Radio className="h-3 w-3 mr-1 animate-pulse" />
                      BREAKING NOW
                    </Badge>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-5xl md:text-6xl font-bold mb-4 leading-tight"
                  >
                    {currentBreaking.title}
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-xl text-gray-300 mb-6"
                  >
                    {currentBreaking.excerpt}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="flex items-center gap-6 text-sm text-gray-400 mb-8"
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {new Date(currentBreaking.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      {currentBreaking.views} views
                    </span>
                    <Badge variant="outline" className="border-white/20 text-white">
                      {currentBreaking.category}
                    </Badge>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="flex gap-3"
                  >
                    <Button 
                      size="lg" 
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => navigateToArticle(currentBreaking.id)}
                    >
                      Read Full Story
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="border-white/20 text-white hover:bg-white/10"
                      onClick={(e) => shareArticle(currentBreaking, 'facebook', e)}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </motion.div>
                </div>
              </div>

              {/* Progress Indicators */}
              <div className="absolute bottom-8 left-0 right-0 z-10">
                <div className="container">
                  <div className="flex gap-2 max-w-3xl">
                    {latestArticles.map((_, idx) => (
                      <motion.div
                        key={idx}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          idx === currentBreakingIndex ? 'bg-primary' : 'bg-white/30'
                        }`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: idx === currentBreakingIndex ? 1 : 0.3 }}
                        transition={{ duration: idx === currentBreakingIndex ? 5 : 0.3 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>
      )}

      {/* Categories */}
      <section className="border-b bg-muted/30">
        <div className="container py-4">
          <div className="flex gap-2 overflow-x-auto">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className="whitespace-nowrap"
            >
              All News
            </Button>
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat.id)}
                className="whitespace-nowrap"
              >
                {cat.icon} {cat.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Articles */}
      {trendingArticles.length > 0 && (
        <section className="container py-12">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Trending Now</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {trendingArticles.map((article, idx) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
              >
                <Card 
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => navigateToArticle(article.id)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={article.image || 'https://images.unsplash.com/photo-1498644035638-2c3357894b10'}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-primary text-white">{article.category}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">{article.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{article.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {article.views}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Regular Articles */}
      {regularArticles.length > 0 && (
        <section className="container py-12 bg-muted/20">
          <h2 className="text-3xl font-bold mb-8">Latest Stories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularArticles.map((article, idx) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <Card 
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full group"
                  onClick={() => navigateToArticle(article.id)}
                >
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src={article.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c'}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <Badge className="mb-2 text-xs">{article.category}</Badge>
                    <h3 className="font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">{article.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{article.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                      <div className="flex items-center gap-1 text-primary font-semibold">
                        Read →
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-black text-white mt-20">
        <div className="container py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-primary">Shrigonda News</h3>
              <p className="text-sm text-gray-400">Your trusted source for local and national news</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Categories</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {categories.map(cat => (
                  <li key={cat.id} className="hover:text-white cursor-pointer transition-colors">{cat.name}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white cursor-pointer transition-colors">About Us</li>
                <li className="hover:text-white cursor-pointer transition-colors">Contact</li>
                <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-white cursor-pointer transition-colors">Terms of Service</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Follow Us</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="bg-white/10 border-white/20 hover:bg-primary">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="bg-white/10 border-white/20 hover:bg-primary">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="bg-white/10 border-white/20 hover:bg-primary">
                  <Linkedin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <Separator className="my-8 bg-white/20" />
          <p className="text-center text-sm text-gray-400">© 2025 Shrigonda News. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}