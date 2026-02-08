// src/index.js
require('dotenv').config({ path: `${__dirname}/../.env` });
const TelegramService = require('./services/telegramService');
const SupabaseService = require('./services/supabaseService');
const logger = require('./utils/logger');

async function main() {
    console.log('🚀 Starting Telegram Scraper...');
    
    let telegram = null;
    let supabase = null;
    
    try {
        // Initialize services
        telegram = new TelegramService();
        supabase = new SupabaseService();
        
        console.log('🔄 Initializing services...');
        await telegram.initialize();
        await supabase.initialize();
        
        console.log('✅ Services initialized');
        
        // Test connection first
        const isConnected = await telegram.testConnection();
        if (!isConnected) {
            throw new Error('Telegram connection test failed');
        }
        
        // List joined channels (optional)
        console.log('\n📋 Checking joined channels...');
        try {
            // You can add a method to list channels if needed
            // await telegram.listJoinedChannels();
        } catch (e) {
            console.log('⚠️  Could not list channels (not critical)');
        }
        
        // Scrape specific channel
        const channel = '@BiasiswaMalaysia';
        console.log(`\n🎯 Scraping channel: ${channel}`);
        
        const posts = await telegram.getChannelPosts(channel, 10); // Start with 10 posts
        
        console.log(`\n📊 Scraping completed:`);
        console.log(`   Total posts: ${posts.length}`);
        
        let totalLinks = 0;
        let totalScraped = 0;
        
        // Process and save each post
        for (const post of posts) {
            totalLinks += post.links.length;
            totalScraped += post.scraped_contents.length;
            
            // Save to database
            try {
                await supabase.savePost(post);
                console.log(`   ✓ Saved post ${post.telegram_id} with ${post.scraped_contents.length} scraped links`);
            } catch (saveError) {
                console.error(`   ✗ Failed to save post ${post.telegram_id}:`, saveError.message);
            }
        }
        
        console.log(`\n📈 Summary:`);
        console.log(`   Posts found: ${posts.length}`);
        console.log(`   Links found: ${totalLinks}`);
        console.log(`   Links successfully scraped: ${totalScraped}`);
        
    } catch (error) {
        logger.error('Main execution error:', error);
        console.error('\n❌ Fatal error:', error.message);
        process.exit(1);
    } finally {
        // Cleanup
        if (telegram) {
            try {
                await telegram.close();
            } catch (closeError) {
                console.error('Error closing Telegram:', closeError.message);
            }
        }
        console.log('\n👋 Scraper finished');
    }
}

// Run immediately
main();

// Optional: Schedule to run periodically
if (process.env.SCHEDULE_SCRAPER === 'true') {
    const cron = require('node-cron');
    
    // Schedule every 30 minutes
    cron.schedule('*/30 * * * *', () => {
        console.log('\n🕐 Running scheduled scrape...');
        main().catch(console.error);
    });
    
    console.log('⏰ Scheduled scraper enabled (every 30 minutes)');
}