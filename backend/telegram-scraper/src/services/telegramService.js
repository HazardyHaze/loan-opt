const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const logger = require('../utils/logger');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

class TelegramService {
    constructor() {
        this.apiId = parseInt(process.env.TELEGRAM_API_ID);
        this.apiHash = process.env.TELEGRAM_API_HASH;
        
        // Handle session string
        let sessionString = process.env.TELEGRAM_SESSION || "";
        sessionString = sessionString.trim().replace(/['"]/g, '');
        
        this.session = new StringSession(sessionString);
        this.client = null;
        this.browser = null;
        this.isConnected = false;

        // Bind methods to preserve 'this' context
        this.parseMessage = this.parseMessage.bind(this);
        this.extractLinks = this.extractLinks.bind(this);
        this.scrapeLinksFromPost = this.scrapeLinksFromPost.bind(this);
        this.scrapeUrlContent = this.scrapeUrlContent.bind(this);
        this.scrapeWithPuppeteer = this.scrapeWithPuppeteer.bind(this);
        this.ensureConnected = this.ensureConnected.bind(this);
        this.testConnection = this.testConnection.bind(this);
        this.close = this.close.bind(this);
    }

    async initialize() {
        try {
            logger.info('Initializing Telegram client...');
            
            this.client = new TelegramClient(
                this.session,
                this.apiId,
                this.apiHash,
                {
                    connectionRetries: 5,
                    useWSS: false,
                    autoReconnect: true,
                    timeout: 60000
                }
            );

            // Initialize Puppeteer
            this.browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            logger.info('Puppeteer initialized, now connecting to Telegram...');
            
            // Connect to Telegram
            await this.client.connect();
            logger.info('Telegram client connected');
            
            // Check if we need to authenticate
            if (!await this.client.checkAuthorization()) {
                console.log('\n📱 TELEGRAM AUTHENTICATION REQUIRED');
                console.log('===================================');
                
                await this.authenticate();
                
            } else {
                console.log('✅ Using saved session');
                this.isConnected = true;
            }
            
            logger.info('Telegram client and scraper initialized successfully');
            
        } catch (error) {
            logger.error('Failed to initialize Telegram client:', error);
            
            // Try to disconnect if connection failed
            try {
                if (this.client) {
                    await this.client.disconnect();
                }
            } catch (e) {
                // Ignore disconnect errors
            }
            
            throw error;
        }
    }

    async authenticate() {
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const askQuestion = (question) => {
            return new Promise((resolve) => {
                rl.question(question, (answer) => {
                    resolve(answer.trim());
                });
            });
        };

        try {
            await this.client.start({
                phoneNumber: async () => {
                    const phone = process.env.TELEGRAM_PHONE;
                    if (phone) {
                        console.log(`Using phone: ${phone}`);
                        return phone;
                    }
                    return await askQuestion("Enter phone (+1234567890): ");
                },
                phoneCode: async () => {
                    console.log('\n📲 Code sent to Telegram app.');
                    return await askQuestion("Enter code: ");
                },
                password: async () => {
                    console.log('\n🔒 2FA (press Enter if none)');
                    return await askQuestion("Enter password: ");
                },
                onError: (err) => {
                    console.error('Auth error:', err);
                    throw err;
                }
            });

            // Save session
            const newSession = this.client.session.save();
            console.log('\n🎉 AUTHENTICATION SUCCESSFUL!');
            console.log('\n📝 SAVE THIS in .env:');
            console.log('TELEGRAM_SESSION=' + newSession);
            
            this.isConnected = true;
            
        } catch (error) {
            console.error('Authentication failed:', error);
            throw error;
        } finally {
            rl.close();
        }
    }

    async ensureConnected() {
        if (!this.isConnected) {
            console.log('🔄 Reconnecting to Telegram...');
            try {
                await this.client.connect();
                
                // Check authorization after reconnection
                if (!await this.client.checkAuthorization()) {
                    console.log('⚠️  Session expired, re-authentication required');
                    await this.authenticate();
                }
                
                this.isConnected = true;
                console.log('✅ Reconnected successfully');
            } catch (error) {
                console.error('❌ Failed to reconnect:', error.message);
                throw error;
            }
        }
    }

    async getChannelPosts(channel, limit = 100) {
        try {
            // Ensure we're connected before making requests
            await this.ensureConnected();
            
            logger.info(`Fetching posts from ${channel} (limit: ${limit})`);
            
            const channelName = channel.replace('@', '');
            console.log(`🔍 Looking for channel: ${channelName}`);
            
            try {
                // Get channel entity
                const channelEntity = await this.client.getEntity(channelName);
                console.log(`✅ Found channel: ${channelEntity.title}`);
                
                // Get messages
                const messages = await this.client.getMessages(channelEntity, {
                    limit: limit
                });
                
                console.log(`📨 Raw messages received: ${messages.length}`);
                
                // Process posts
                const posts = [];
                for (const [index, msg] of messages.entries()) {
                    if (msg.text) {
                        console.log(`\n📝 Processing message ${index + 1}/${messages.length} (ID: ${msg.id})`);
                        
                        // Use arrow function or bind to preserve context
                        const post = this.parseMessage(msg, channel);
                        
                        // Extract and scrape links from this post
                        if (post.links && post.links.length > 0) {
                            console.log(`🔗 Found ${post.links.length} links in post ${post.telegram_id}`);
                            try {
                                post.scraped_contents = await this.scrapeLinksFromPost(post);
                                console.log(`✅ Scraped ${post.scraped_contents.length} links`);
                            } catch (scrapeError) {
                                console.error(`❌ Link scraping failed:`, scrapeError.message);
                                post.scraped_contents = [];
                            }
                        } else {
                            console.log('📭 No links found in this post');
                            post.scraped_contents = [];
                        }
                        
                        posts.push(post);
                        
                        // Small delay to avoid rate limiting
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                }
                
                logger.info(`Fetched ${posts.length} posts with link content from ${channel}`);
                
                if (posts.length > 0) {
                    console.log(`\n📄 Sample post: "${posts[0].message_text.substring(0, 100)}..."`);
                }
                
                return posts;
                
            } catch (resolveError) {
                console.error(`❌ Error accessing @${channelName}:`, resolveError.message);
                
                // Check if we need to join the channel
                if (resolveError.message.includes('CHANNEL_PRIVATE') || 
                    resolveError.message.includes('CHANNEL_INVALID') ||
                    resolveError.message.includes('USERNAME_INVALID')) {
                    console.log(`\n💡 You may need to join @${channelName} first!`);
                    console.log('1. Open Telegram app');
                    console.log(`2. Search for @${channelName}`);
                    console.log('3. Join the channel');
                    console.log('4. Try again');
                }
                
                throw resolveError;
            }
            
        } catch (error) {
            logger.error(`Error fetching posts from ${channel}:`, error);
            this.isConnected = false;
            throw error;
        }
    }

    parseMessage(message, channel) {
        console.log(`🔧 Parsing message ID: ${message.id}`);
        
        // Generate a unique ID if message.id is undefined
        let telegramId;
        if (message.id !== undefined && message.id !== null) {
            telegramId = typeof message.id === 'bigint' 
                ? message.id.toString() 
                : message.id.toString();
        } else {
            const dateStr = message.date ? message.date.toString() : Date.now().toString();
            telegramId = `${channel}_${dateStr}_${Math.random().toString(36).substr(2, 9)}`;
            console.warn(`⚠️  Message has no ID, using synthetic: ${telegramId}`);
        }
        
        // Get text safely
        let messageText = '';
        if (message.text) {
            if (typeof message.text === 'string') {
                messageText = message.text;
            } else if (message.text.text) {
                messageText = message.text.text;
            }
        } else if (message.message) {
            messageText = message.message;
        }
        
        // Extract URLs from text
        const links = this.extractLinks(messageText);
        
        // Parse date
        let postDate;
        if (message.date) {
            if (typeof message.date === 'number') {
                postDate = new Date(message.date * 1000);
            } else if (typeof message.date === 'bigint') {
                postDate = new Date(Number(message.date) * 1000);
            } else {
                postDate = new Date(message.date);
            }
        } else {
            postDate = new Date();
        }
        
        console.log(`✅ Parsed: ID=${telegramId}, Text=${messageText.length} chars, Links=${links.length}`);
        
        return {
            telegram_id: telegramId,
            channel_username: channel,
            message_text: messageText.substring(0, 5000),
            links: links,
            date: postDate,
            views: message.views || 0,
            forwards: message.forwards || 0,
            scraped_contents: []
        };
    }

    extractLinks(text) {
        if (!text) return [];
        
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = text.match(urlRegex) || [];
        
        // Filter and normalize URLs
        return urls
            .map(url => {
                // Remove trailing punctuation
                return url.replace(/[.,;!?)]+$/, '');
            })
            .filter(url => {
                // Filter out common non-content URLs
                const excludedPatterns = [
                    /telegram\.me\//,
                    /t\.me\//,
                    /youtube\.com\/watch/,
                    /youtu\.be\//,
                    /spotify\.com/,
                    /instagram\.com/,
                    /twitter\.com/,
                    /x\.com/
                ];
                
                return !excludedPatterns.some(pattern => pattern.test(url));
            });
    }

    async scrapeLinksFromPost(post) {
        const scrapedContents = [];
        
        for (const [index, url] of post.links.entries()) {
            try {
                console.log(`🌐 [${index + 1}/${post.links.length}] Scraping: ${url.substring(0, 80)}...`);
                
                const content = await this.scrapeUrlContent(url);
                
                if (content) {
                    scrapedContents.push({
                        url: url,
                        title: content.title,
                        text_content: content.text,
                        html_content: content.html,
                        metadata: content.metadata,
                        apply_now_link: content.applyNowLink || null,
                        scraped_at: new Date()
                    });
                    
                    console.log(`✅ Successfully scraped: ${content.title?.substring(0, 60) || 'No title'}...`);
                }
                
                // Respectful delay between requests
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (error) {
                console.error(`❌ Failed to scrape ${url.substring(0, 60)}...:`, error.message);
                
                scrapedContents.push({
                    url: url,
                    error: error.message,
                    scraped_at: new Date()
                });
            }
        }
        
        return scrapedContents;
    }

    async scrapeUrlContent(url) {
        try {
            console.log(`   📡 Fetching with axios...`);
            
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 10000
            });
            
            const $ = cheerio.load(response.data);
            
            // Extract title
            const title = $('title').text() || 
                         $('meta[property="og:title"]').attr('content') ||
                         $('h1').first().text() ||
                         '';
            
            // Remove script and style elements
            $('script, style, nav, footer, header').remove();
            
            // Get main content
            let text = '';
            const selectors = [
                'main', 'article', '.content', '#content', '.post-content',
                '.article-content', '.entry-content', '[role="main"]'
            ];
            
            for (const selector of selectors) {
                const content = $(selector);
                if (content.length > 0) {
                    text = content.text();
                    break;
                }
            }
            
            // If no specific content found, use body
            if (!text.trim()) {
                text = $('body').text();
            }
            
            // Clean up text
            text = text
                .replace(/\s+/g, ' ')
                .replace(/\n+/g, '\n')
                .trim()
                .substring(0, 10000);
            
            // Extract metadata
            const metadata = {
                description: $('meta[name="description"]').attr('content') || 
                           $('meta[property="og:description"]').attr('content') || '',
                keywords: $('meta[name="keywords"]').attr('content') || '',
                author: $('meta[name="author"]').attr('content') ||
                       $('meta[property="article:author"]').attr('content') || '',
                published_time: $('meta[property="article:published_time"]').attr('content') || '',
                site_name: $('meta[property="og:site_name"]').attr('content') || ''
            };

            // Extract "Apply Now" or similar application links
            let applyNowLink = null;
            const applySelectors = [
                'a[href]'
            ];
            const applyKeywords = /apply\s*now|mohon\s*sekarang|permohonan|daftar\s*sekarang|register\s*now|submit\s*application|hantar\s*permohonan|klik\s*sini|click\s*here\s*to\s*apply/i;

            for (const selector of applySelectors) {
                $(selector).each((_, el) => {
                    if (applyNowLink) return false; // stop once found
                    const linkText = $(el).text().trim();
                    const href = $(el).attr('href');
                    // Check button/link text for "Apply Now" patterns
                    if (href && linkText && applyKeywords.test(linkText)) {
                        // Resolve relative URLs
                        if (href.startsWith('http')) {
                            applyNowLink = href;
                        } else if (href.startsWith('/')) {
                            try {
                                const base = new URL(url);
                                applyNowLink = `${base.origin}${href}`;
                            } catch (e) { /* skip */ }
                        }
                    }
                });
            }

            // Also check for buttons with apply-related classes
            if (!applyNowLink) {
                $('a.btn, a.button, a[class*="apply"], a[class*="cta"], button[onclick]').each((_, el) => {
                    if (applyNowLink) return false;
                    const href = $(el).attr('href') || '';
                    const text = $(el).text().trim();
                    if (href.startsWith('http') && applyKeywords.test(text)) {
                        applyNowLink = href;
                    }
                });
            }

            if (applyNowLink) {
                console.log(`   🎯 Found Apply Now link: ${applyNowLink.substring(0, 80)}...`);
            }
            
            return {
                title: title.trim().substring(0, 500),
                text: text,
                html: response.data.substring(0, 50000),
                metadata: metadata,
                applyNowLink: applyNowLink
            };
            
        } catch (error) {
            if (error.code === 'ECONNABORTED' || error.response?.status >= 400) {
                console.log(`   ⚡ Falling back to Puppeteer...`);
                return await this.scrapeWithPuppeteer(url);
            }
            throw error;
        }
    }

    async scrapeWithPuppeteer(url) {
        const page = await this.browser.newPage();
        
        try {
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
            await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
            
            // Wait for content to load
            await page.waitForSelector('body', { timeout: 10000 });
            
            // Get page content
            const content = await page.evaluate(() => {
                // Remove unwanted elements
                const removeSelectors = ['script', 'style', 'nav', 'footer', 'header', 'iframe'];
                removeSelectors.forEach(selector => {
                    document.querySelectorAll(selector).forEach(el => el.remove());
                });
                
                return {
                    title: document.title,
                    text: document.body.innerText,
                    html: document.body.innerHTML
                };
            });
            
            // Extract metadata
            const metadata = await page.evaluate(() => {
                const getMeta = (name, property) => {
                    const element = document.querySelector(`meta[name="${name}"], meta[property="${property}"]`);
                    return element ? element.content : '';
                };
                
                return {
                    description: getMeta('description', 'og:description'),
                    author: getMeta('author', 'article:author'),
                    published_time: getMeta('', 'article:published_time')
                };
            });

            // Extract "Apply Now" link via Puppeteer
            const applyNowLink = await page.evaluate(() => {
                const applyKeywords = /apply\s*now|mohon\s*sekarang|permohonan|daftar\s*sekarang|register\s*now|submit\s*application|hantar\s*permohonan|klik\s*sini|click\s*here\s*to\s*apply/i;
                const links = document.querySelectorAll('a[href]');
                for (const link of links) {
                    const text = link.textContent.trim();
                    const href = link.href;
                    if (href && text && applyKeywords.test(text) && href.startsWith('http')) {
                        return href;
                    }
                }
                // Also check buttons with apply classes
                const btns = document.querySelectorAll('a.btn, a.button, a[class*="apply"], a[class*="cta"]');
                for (const btn of btns) {
                    const text = btn.textContent.trim();
                    const href = btn.href;
                    if (href && text && applyKeywords.test(text) && href.startsWith('http')) {
                        return href;
                    }
                }
                return null;
            });

            if (applyNowLink) {
                console.log(`   🎯 Found Apply Now link: ${applyNowLink.substring(0, 80)}...`);
            }
            
            await page.close();
            
            // Clean text
            const cleanText = content.text
                .replace(/\s+/g, ' ')
                .replace(/\n+/g, '\n')
                .trim()
                .substring(0, 10000);
            
            return {
                title: content.title.trim().substring(0, 500),
                text: cleanText,
                html: content.html.substring(0, 50000),
                metadata: metadata,
                applyNowLink: applyNowLink
            };
            
        } catch (error) {
            await page.close();
            throw new Error(`Puppeteer scrape failed: ${error.message}`);
        }
    }

    async testConnection() {
        try {
            await this.ensureConnected();
            
            // Try a simple request
            const me = await this.client.getMe();
            console.log(`✅ Connected as: ${me.firstName || 'User'} (ID: ${me.id})`);
            
            return true;
        } catch (error) {
            console.error('❌ Connection test failed:', error.message);
            return false;
        }
    }

    async close() {
        try {
            if (this.browser) {
                await this.browser.close();
                console.log('🌐 Puppeteer browser closed');
            }
            if (this.client && this.isConnected) {
                await this.client.disconnect();
                this.isConnected = false;
                console.log('📱 Telegram client disconnected');
            }
            logger.info('Telegram service closed');
        } catch (error) {
            logger.error('Error closing Telegram service:', error);
        }
    }
}

module.exports = TelegramService;