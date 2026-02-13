// src/index.js
require('dotenv').config({ path: `${__dirname}/../.env` });
const TelegramService = require('./services/telegramService');
const SupabaseService = require('./services/supabaseService');
const ContentProcessor = require('./services/contentProcessor');
const logger = require('./utils/logger');

// --- Configuration ---
const RUN_DURATION_MS = 7 * 60 * 1000;   // 7 minutes
const BATCH_SIZE = 20;                     // messages fetched per batch
const DELAY_BETWEEN_POSTS_MS = 500;        // delay between each post process
const CHANNEL = '@BiasiswaMalaysia';

async function main() {
    const startTime = Date.now();
    const deadline = startTime + RUN_DURATION_MS;

    console.log('='.repeat(60));
    console.log('  TELEGRAM SCRAPER');
    console.log(`  Channel  : ${CHANNEL}`);
    console.log(`  Duration : ${RUN_DURATION_MS / 60000} minutes`);
    console.log(`  Batch    : ${BATCH_SIZE} messages per fetch`);
    console.log('='.repeat(60));

    let telegram = null;
    let stats = { found: 0, saved: 0, skipped: 0, failed: 0 };

    try {
        // Initialize services
        telegram = new TelegramService();
        const supabase = new SupabaseService();
        const processor = new ContentProcessor();

        console.log('\n Initializing services...');
        await telegram.initialize();
        await supabase.initialize();
        await processor.initialize(supabase);
        console.log(' Services initialized\n');

        // Test connection
        const isConnected = await telegram.testConnection();
        if (!isConnected) throw new Error('Telegram connection test failed');

        // Resolve channel entity once
        const channelName = CHANNEL.replace('@', '');
        const channelEntity = await telegram.client.getEntity(channelName);
        console.log(` Channel found: ${channelEntity.title}\n`);

        let offsetId = 0;          // for pagination
        let batchNum = 0;
        const seenIds = new Set(); // in-memory dedup within this run

        //  Main loop  keep fetching batches until time runs out 
        while (Date.now() < deadline) {
            batchNum++;
            const remaining = Math.ceil((deadline - Date.now()) / 1000);
            console.log(`\n--- Batch ${batchNum} | ${remaining}s remaining ---`);

            // Fetch a batch of messages
            const fetchOpts = { limit: BATCH_SIZE };
            if (offsetId > 0) fetchOpts.offsetId = offsetId;

            const messages = await telegram.client.getMessages(channelEntity, fetchOpts);

            if (!messages || messages.length === 0) {
                console.log(' No more messages. Reached end of channel history.');
                break;
            }

            console.log(` Fetched ${messages.length} messages`);

            // Track the last message ID for next batch pagination
            const lastMsg = messages[messages.length - 1];
            const lastId = typeof lastMsg.id === 'bigint' ? Number(lastMsg.id) : lastMsg.id;
            if (lastId === offsetId) {
                console.log(' No new messages beyond this point.');
                break;
            }
            offsetId = lastId;

            // Process each message one-by-one
            for (const msg of messages) {
                // Time check inside inner loop too
                if (Date.now() >= deadline) {
                    console.log('\n Time limit reached mid-batch. Stopping.');
                    break;
                }

                if (!msg.text && !msg.message) continue; // skip media-only

                const msgId = msg.id !== undefined && msg.id !== null
                    ? msg.id.toString()
                    : null;

                if (!msgId) continue;

                stats.found++;

                //  In-memory dedup 
                if (seenIds.has(msgId)) {
                    stats.skipped++;
                    continue;
                }
                seenIds.add(msgId);

                //  DB dedup: check if already saved 
                try {
                    const exists = await supabase.checkPostExists(msgId);
                    if (exists) {
                        console.log(`   [${stats.found}] #${msgId} already in DB - skipped`);
                        stats.skipped++;
                        continue;
                    }
                } catch (checkErr) {
                    // If check fails, proceed anyway (upsert will handle it)
                    console.log(`   [${stats.found}] Could not check DB for #${msgId}, proceeding...`);
                }

                //  Parse message 
                console.log(`\n   [${stats.found}] Processing #${msgId}...`);
                const post = telegram.parseMessage(msg, CHANNEL);

                //  Scrape links 
                if (post.links && post.links.length > 0) {
                    console.log(`      ${post.links.length} link(s) to scrape`);
                    try {
                        post.scraped_contents = await telegram.scrapeLinksFromPost(post);
                    } catch (scrapeErr) {
                        console.error(`      Link scraping failed: ${scrapeErr.message}`);
                        post.scraped_contents = [];
                    }
                } else {
                    post.scraped_contents = [];
                }

                //  Enrich 
                const enrichedPost = processor.enrichPost(post);

                //  Save immediately 
                try {
                    await supabase.savePost(enrichedPost);
                    stats.saved++;
                    const preview = (post.message_text || '').substring(0, 60).replace(/\n/g, ' ');
                    console.log(`       Saved! "${preview}..."`);
                    if (enrichedPost.amount) console.log(`       Amount: RM ${enrichedPost.amount}`);
                    if (enrichedPost.deadline) console.log(`       Deadline: ${enrichedPost.deadline}`);
                    if (enrichedPost.course) console.log(`       Course: ${enrichedPost.course.substring(0, 60)}`);
                    if (enrichedPost.eligibility) console.log(`       CGPA: ${enrichedPost.eligibility}`);
                    if (enrichedPost.link) console.log(`       Link: ${enrichedPost.link.substring(0, 70)}`);
                } catch (saveErr) {
                    stats.failed++;
                    console.error(`       Save FAILED: ${saveErr.message}`);
                }

                // Small delay between posts to avoid rate limiting
                await new Promise(r => setTimeout(r, DELAY_BETWEEN_POSTS_MS));
            }

            // Small delay between batches
            await new Promise(r => setTimeout(r, 1000));
        }

    } catch (error) {
        logger.error('Main execution error:', error);
        console.error('\n Fatal error:', error.message);
    } finally {
        // Print summary
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log('\n' + '='.repeat(60));
        console.log('  SCRAPER SUMMARY');
        console.log('='.repeat(60));
        console.log(`  Duration     : ${elapsed}s`);
        console.log(`  Posts found  : ${stats.found}`);
        console.log(`  Saved (new)  : ${stats.saved}`);
        console.log(`  Skipped (dup): ${stats.skipped}`);
        console.log(`  Failed       : ${stats.failed}`);
        console.log('='.repeat(60));

        // Cleanup
        if (telegram) {
            try { await telegram.close(); } catch (e) {}
        }
        console.log('\n Scraper finished');
    }
}

main();
