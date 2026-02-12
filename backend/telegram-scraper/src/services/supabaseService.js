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
                    message_text: postData.message_text,
                    media_urls: postData.media_urls || '',
                    link: postData.link || null,
                    amount: postData.amount || null,
                    course: postData.course || null,
                    eligibility: postData.eligibility || null,
                    opening_date: postData.opening_date || null,
                    deadline: postData.deadline || null,
                    date: postData.date
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