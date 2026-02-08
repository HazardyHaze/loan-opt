const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

class SupabaseService {
    constructor() {
        this.supabase = null;
    }

    initialize() {
        try {
            const supabaseUrl = process.env.SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
            
            if (!supabaseUrl || !supabaseKey) {
                throw new Error('Supabase URL and Service Role Key are required');
            }

            this.supabase = createClient(supabaseUrl, supabaseKey, {
                auth: {
                    persistSession: false
                }
            });

            logger.info('Supabase client initialized');
        } catch (error) {
            logger.error('Failed to initialize Supabase client:', error);
            throw error;
        }
    }

    async savePost(postData) {
        try {
            const { data, error } = await this.supabase
                .from('posts')
                .upsert([{
                    telegram_id: postData.telegram_id,
                    channel_username: postData.channel_username,
                    channel_id: postData.channel_id,
                    message_text: postData.message_text,
                    media_urls: postData.media_urls,
                    date: postData.date,
                    views: postData.views,
                    forwards: postData.forwards,
                    reactions: postData.reactions,
                    entities: postData.entities,
                    is_processed: false
                }], {
                    onConflict: 'telegram_id'
                })
                .select()
                .single();

            if (error) throw error;
            
            logger.debug(`Saved post: ${postData.telegram_id}`);
            return data;
        } catch (error) {
            logger.error(`Error saving post ${postData.telegram_id}:`, error);
            throw error;
        }
    }

    async checkPostExists(telegramId) {
        try {
            const { data, error } = await this.supabase
                .from('posts')
                .select('id')
                .eq('telegram_id', telegramId)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            return !!data;
        } catch (error) {
            logger.error(`Error checking post ${telegramId}:`, error);
            throw error;
        }
    }

    async getUnprocessedPosts(limit = 50) {
        try {
            const { data, error } = await this.supabase
                .from('posts')
                .select('*')
                .eq('is_processed', false)
                .order('date', { ascending: false })
                .limit(limit);

            if (error) throw error;
            
            return data || [];
        } catch (error) {
            logger.error('Error fetching unprocessed posts:', error);
            throw error;
        }
    }

    async markPostAsProcessed(postId) {
        try {
            const { error } = await this.supabase
                .from('posts')
                .update({ is_processed: true, updated_at: new Date() })
                .eq('id', postId);

            if (error) throw error;
            
            logger.debug(`Marked post ${postId} as processed`);
        } catch (error) {
            logger.error(`Error marking post ${postId} as processed:`, error);
            throw error;
        }
    }

    async saveScholar(scholarData) {
        try {
            const { data, error } = await this.supabase
                .from('scholars')
                .upsert([scholarData], {
                    onConflict: 'post_id'
                })
                .select()
                .single();

            if (error) throw error;
            
            logger.info(`Saved scholar from post: ${scholarData.post_id}`);
            return data;
        } catch (error) {
            logger.error(`Error saving scholar:`, error);
            throw error;
        }
    }

    async saveLoan(loanData) {
        try {
            const { data, error } = await this.supabase
                .from('loans')
                .upsert([loanData], {
                    onConflict: 'post_id'
                })
                .select()
                .single();

            if (error) throw error;
            
            logger.info(`Saved loan from post: ${loanData.post_id}`);
            return data;
        } catch (error) {
            logger.error(`Error saving loan:`, error);
            throw error;
        }
    }

    async getKeywords(category = null) {
        try {
            let query = this.supabase
                .from('keywords')
                .select('*')
                .eq('is_active', true);

            if (category) {
                query = query.eq('category', category);
            }

            const { data, error } = await query.order('priority', { ascending: false });

            if (error) throw error;
            
            return data || [];
        } catch (error) {
            logger.error('Error fetching keywords:', error);
            throw error;
        }
    }

    async cleanupOldPosts(days = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            const { error } = await this.supabase
                .from('posts')
                .delete()
                .lt('date', cutoffDate.toISOString());

            if (error) throw error;
            
            return true;
        } catch (error) {
            logger.error('Error cleaning up old posts:', error);
            throw error;
        }
    }
}

module.exports = SupabaseService;