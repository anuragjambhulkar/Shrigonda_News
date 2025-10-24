'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Eye, User, Tag, Share2, Facebook, Twitter, Linkedin, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export default function ArticlePage({ params }) {
  const router = useRouter();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticle();
  }, [params.id]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/news/${params.id}`);
      const data = await res.json();
      
      if (data.article) {
        setArticle(data.article);
        loadRelatedArticles(data.article.category);
      } else {
        toast.error('Article not found');
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to load article:', error);
      toast.error('Failed to load article');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedArticles = async (category) => {
    try {
      const res = await fetch(`/api/news?category=${category}&limit=3`);
      const data = await res.json();
      setRelatedArticles((data.articles || []).filter(a => a.id !== params.id).slice(0, 3));
    } catch (error) {
      console.error('Failed to load related articles:', error);
    }
  };

  const shareArticle = (platform) => {
    if (!article) return;
    
    const url = window.location.href;
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
    toast.success('Opening share dialog...');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Back Button */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          
          <div className="flex items-center gap-2">
            <img 
              src="https://customer-assets.emergentagent.com/job_754a0040-d589-4dfd-90f1-615496373220/artifacts/7inmznbe_logo.jpg" 
              alt="Shrigonda News" 
              className="h-10 w-auto"
            />
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-primary">Shrigonda News</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => shareArticle('facebook')}
              title="Share on Facebook"
            >
              <Facebook className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => shareArticle('twitter')}
              title="Share on Twitter"
            >
              <Twitter className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => shareArticle('linkedin')}
              title="Share on LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Image */}
      <section className="relative bg-black text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={article.image || 'https://images.unsplash.com/photo-1495020689067-958852a7765e'}
            alt={article.title}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black"></div>
        </div>

        <div className="container relative z-10 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            {/* Category Badge */}
            <Badge className="mb-4 bg-primary text-white border-0 text-sm">
              {article.category}
            </Badge>

            {/* Article Title */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {article.title}
            </h1>

            {/* Article Excerpt */}
            {article.excerpt && (
              <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                {article.excerpt}
              </p>
            )}

            {/* Article Metadata */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {article.author || 'Shrigonda News'}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(article.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {new Date(article.createdAt).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <span className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                {article.views} views
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Article Content */}
      <section className="container py-16">
        <div className="max-w-4xl mx-auto">
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-lg max-w-none"
          >
            {/* Article Content with proper formatting */}
            <div className="text-lg leading-relaxed text-foreground space-y-6">
              {article.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="text-justify">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Tags:</span>
                  {article.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Share Section */}
            <div className="mt-12 pt-8 border-t">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Share this article:</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => shareArticle('facebook')}
                  >
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </Button>
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => shareArticle('twitter')}
                  >
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </Button>
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => shareArticle('linkedin')}
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={copyLink}
                  >
                    Copy Link
                  </Button>
                </div>
              </div>
            </div>
          </motion.article>
        </div>
      </section>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="bg-muted/30 py-16">
          <div className="container">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-2 mb-8">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold">Related Stories</h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                {relatedArticles.map((related, idx) => (
                  <motion.div
                    key={related.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                  >
                    <Card 
                      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group h-full"
                      onClick={() => router.push(`/article/${related.id}`)}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={related.image || 'https://images.unsplash.com/photo-1498644035638-2c3357894b10'}
                          alt={related.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-primary text-white">{related.category}</Badge>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {related.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {related.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{new Date(related.createdAt).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {related.views}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Button 
                  size="lg" 
                  onClick={() => router.push('/')}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to All Stories
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <img 
              src="https://customer-assets.emergentagent.com/job_754a0040-d589-4dfd-90f1-615496373220/artifacts/7inmznbe_logo.jpg" 
              alt="Shrigonda News" 
              className="h-16 w-auto mx-auto mb-4"
            />
            <h3 className="font-bold text-lg mb-2 text-primary">Shrigonda News</h3>
            <p className="text-sm text-gray-400 mb-6">Your trusted source for local and national news</p>
            <Separator className="my-6 bg-white/20" />
            <p className="text-sm text-gray-400">© 2025 Shrigonda News. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
