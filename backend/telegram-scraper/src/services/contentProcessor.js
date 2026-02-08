const logger = require('../utils/logger');

class ContentProcessor {
    constructor() {
        this.scholarKeywords = [];
        this.loanKeywords = [];
    }

    async initialize(supabaseService) {
        this.supabaseService = supabaseService;
        
        // Load keywords from database
        await this.loadKeywords();
    }

    async loadKeywords() {
        try {
            const keywords = await this.supabaseService.getKeywords();
            
            this.scholarKeywords = keywords
                .filter(k => k.category === 'scholar')
                .map(k => k.keyword.toLowerCase());
            
            this.loanKeywords = keywords
                .filter(k => k.category === 'loan')
                .map(k => k.keyword.toLowerCase());
            
            logger.info(`Loaded ${this.scholarKeywords.length} scholar keywords and ${this.loanKeywords.length} loan keywords`);
        } catch (error) {
            logger.error('Error loading keywords:', error);
        }
    }

    async processPost(post) {
        try {
            logger.debug(`Processing post: ${post.id}`);
            
            const text = post.message_text.toLowerCase();
            
            // Check for scholar content
            const isScholar = this.scholarKeywords.some(keyword => 
                text.includes(keyword.toLowerCase())
            );
            
            // Check for loan content
            const isLoan = this.loanKeywords.some(keyword => 
                text.includes(keyword.toLowerCase())
            );

            if (isScholar) {
                await this.extractScholarData(post);
            } else if (isLoan) {
                await this.extractLoanData(post);
            } else {
                logger.debug(`Post ${post.id} doesn't contain scholar/loan keywords`);
            }

        } catch (error) {
            logger.error(`Error processing post ${post.id}:`, error);
        }
    }

    async extractScholarData(post) {
        try {
            const text = post.message_text;
            
            // Extract data using regex patterns
            const scholarData = {
                post_id: post.id,
                game_name: this.extractGameName(text),
                scholar_name: this.extractScholarName(text),
                scholar_email: this.extractEmail(text),
                scholar_wallet: this.extractWallet(text),
                manager_share: this.extractManagerShare(text),
                scholar_share: this.extractScholarShare(text),
                mmr_requirement: this.extractMMR(text),
                slp_requirement: this.extractSLP(text),
                experience_level: this.extractExperienceLevel(text),
                country: this.extractCountry(text),
                contact_method: this.extractContactMethod(text),
                contact_info: this.extractContactInfo(text),
                application_link: this.extractLinks(text)[0],
                application_deadline: this.extractDeadline(text),
                status: 'open'
            };

            // Only save if we have meaningful data
            if (this.hasValidScholarData(scholarData)) {
                await this.supabaseService.saveScholar(scholarData);
            } else {
                logger.debug(`Incomplete scholar data for post ${post.id}`);
            }

        } catch (error) {
            logger.error(`Error extracting scholar data from post ${post.id}:`, error);
        }
    }

    async extractLoanData(post) {
        try {
            const text = post.message_text;
            
            const loanData = {
                post_id: post.id,
                loan_type: this.extractLoanType(text),
                amount_requested: this.extractAmount(text, 'requested'),
                amount_offered: this.extractAmount(text, 'offered'),
                currency: this.extractCurrency(text),
                interest_rate: this.extractInterestRate(text),
                duration_days: this.extractDuration(text),
                collateral_type: this.extractCollateralType(text),
                collateral_value: this.extractCollateralValue(text),
                lender_requirements: this.extractRequirements(text),
                borrower_profile: this.extractBorrowerProfile(text),
                contact_method: this.extractContactMethod(text),
                contact_info: this.extractContactInfo(text),
                status: 'open'
            };

            // Only save if we have meaningful data
            if (this.hasValidLoanData(loanData)) {
                await this.supabaseService.saveLoan(loanData);
            } else {
                logger.debug(`Incomplete loan data for post ${post.id}`);
            }

        } catch (error) {
            logger.error(`Error extracting loan data from post ${post.id}:`, error);
        }
    }

    // Extraction helper methods
    extractGameName(text) {
        const games = ['axie infinity', 'axie', 'cryptomines', 'splinterlands', 'thetan arena'];
        for (const game of games) {
            if (text.includes(game)) return game;
        }
        return 'axie infinity'; // Default
    }

    extractManagerShare(text) {
        const match = text.match(/(?:manager|mana)[\s:]*(\d{1,3})%/i);
        return match ? parseInt(match[1]) : null;
    }

    extractScholarShare(text) {
        const match = text.match(/(?:scholar|schol)[\s:]*(\d{1,3})%/i);
        return match ? parseInt(match[1]) : null;
    }

    extractAmount(text, type = 'requested') {
        const patterns = [
            /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/,
            /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:usd|php|pesos)/i,
            /(?:amount|loan|need)[\s:]*(\d+(?:,\d{3})*(?:\.\d{2})?)/i
        ];
        
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) return parseFloat(match[1].replace(/,/g, ''));
        }
        
        return null;
    }

    extractEmail(text) {
        const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        return match ? match[0] : null;
    }

    extractLinks(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.match(urlRegex) || [];
    }

    // Validation methods
    hasValidScholarData(data) {
        return data.manager_share || data.scholar_share || data.slp_requirement;
    }

    hasValidLoanData(data) {
        return data.amount_requested || data.amount_offered || data.interest_rate;
    }
}

module.exports = ContentProcessor;