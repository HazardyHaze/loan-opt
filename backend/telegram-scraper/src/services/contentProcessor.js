const logger = require('../utils/logger');

class ContentProcessor {
    constructor() {
        this.keywords = [];

        // Whitelisted courses — only these will be extracted
        this.allowedCourses = [
            'Marketing',
            'Business',
            'Economic',
            'Account',
            'Human Resource',
            'Banking',
            'Computer Science',
            'Graphic Design',
            'Multimedia',
            'Information System',
            'Animation',
            'Farmasi',
            'Perubatan',
            'Pergigian',
            'Accounting',
            'Finance',
        ];

        // Build regex-safe patterns (case-insensitive matching)
        this.coursePatterns = this.allowedCourses.map(c => ({
            label: c,
            regex: new RegExp(`\\b${c.replace(/\s+/g, '\\s+')}\\b`, 'i')
        }));
    }

    async initialize(supabaseService) {
        this.supabaseService = supabaseService;
        await this.loadKeywords();
    }

    async loadKeywords() {
        try {
            const keywords = await this.supabaseService.getKeywords();
            this.keywords = keywords.map(k => k.keyword.toLowerCase());
            logger.info(`Loaded ${this.keywords.length} keywords`);
        } catch (error) {
            logger.error('Error loading keywords:', error);
        }
    }

    /**
     * Enrich a post with all extracted fields before saving.
     * Extracts: loan_name, amount, opening_date, deadline, course, eligibility, link
     */
    enrichPost(post) {
        const postText = post.message_text || '';

        // Build the full scraped page text + collect HTML for Apply Now detection
        let allScrapedText = '';
        const scrapedSummaries = [];
        const scrapedTitles = [];
        let applyNowLink = null;

        if (post.scraped_contents && post.scraped_contents.length > 0) {
            for (const sc of post.scraped_contents) {
                if (sc.error) continue;

                const pageText = sc.text_content || '';
                const pageTitle = sc.title || '';
                allScrapedText += ' ' + pageTitle + ' ' + pageText;
                if (pageTitle) scrapedTitles.push(pageTitle);

                // Check for "Apply Now" link in the scraped HTML
                if (!applyNowLink && sc.apply_now_link) {
                    applyNowLink = sc.apply_now_link;
                }

                const snippet = pageText.substring(0, 500).replace(/\n/g, ' ').trim();
                scrapedSummaries.push(
                    `[${sc.url}]\nTitle: ${pageTitle}\nContent: ${snippet}...`
                );
            }
        }

        const combinedText = postText + ' ' + allScrapedText;

        // 1. Loan/Scholarship Name
        const loanName = this.extractLoanName(postText, scrapedTitles, combinedText);
        if (loanName) post.loan_name = loanName;

        // 2. Amount
        const amount = this.extractAmount(combinedText);
        if (amount !== null) post.amount = amount;

        // 3. Opening Date
        const openingDate = this.extractOpeningDate(combinedText);
        if (openingDate) post.opening_date = openingDate;

        // 4. Deadline / Closing Date
        const deadline = this.extractDeadline(combinedText);
        if (deadline !== null) post.deadline = deadline;

        // 5. Eligible Courses (whitelist only)
        const courses = this.extractCourses(combinedText);
        if (courses) post.course = courses;

        // 6. Eligibility Criteria (B40/M40/T20)
        const eligibility = this.extractEligibility(combinedText);
        if (eligibility) post.eligibility = eligibility;

        // 7. Application Link — prefer "Apply Now" link from scraped page, else first link
        if (applyNowLink) {
            post.link = applyNowLink;
        } else if (post.links && post.links.length > 0) {
            post.link = post.links[0];
        }

        // Store scraped content summaries
        if (scrapedSummaries.length > 0) {
            post.media_urls = scrapedSummaries.join('\n\n---\n\n').substring(0, 10000);
        } else if (post.links && post.links.length > 0) {
            post.media_urls = post.links.join(', ');
        } else {
            post.media_urls = '';
        }

        return post;
    }

    isRelevant(post) {
        if (this.keywords.length === 0) return true;
        const text = (post.message_text || '').toLowerCase();
        return this.keywords.some(keyword => text.includes(keyword));
    }

    // ===========================
    // Extraction Methods
    // ===========================

    /**
     * Extract the loan/scholarship name.
     */
    extractLoanName(postText, scrapedTitles, combinedText) {
        const namePatterns = [
            /(?:biasiswa|pinjaman|scholarship|loan|bantuan|dana|geran|grant|fellowship|sponsorship)\s*[:\-–]?\s*(.{5,120})/i,
            /(?:tajuk|nama|name|program|programme)\s*[:\-–]\s*(.{5,120})/i,
        ];

        for (const pattern of namePatterns) {
            const match = postText.match(pattern);
            if (match) {
                let name = match[1].split('\n')[0].trim();
                name = name.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
                name = name.replace(/[.!?]+$/, '').trim();
                if (name.length >= 5 && name.length <= 150) return name;
            }
        }

        for (const title of scrapedTitles) {
            if (title && title.length >= 5 && title.length <= 200) {
                let cleaned = title.split(' - ')[0].split(' | ')[0].trim();
                if (cleaned.length >= 5) return cleaned;
            }
        }

        if (postText) {
            const firstLine = postText.split('\n').find(l => l.trim().length > 5);
            if (firstLine) {
                let cleaned = firstLine.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
                return cleaned.length > 120 ? cleaned.substring(0, 120) + '...' : cleaned;
            }
        }

        return null;
    }

    /**
     * Extract eligible courses — ONLY from the allowed whitelist,
     * and ONLY from sections near course-related context keywords.
     */
    extractCourses(text) {
        // Check for "all courses" first — if found, skip individual matching
        if (/(?:semua\s*(?:kursus|bidang|program|jurusan)|all\s*(?:courses|fields|programs|disciplines)|terbuka\s*kepada\s*semua)/i.test(text)) {
            return 'All Courses';
        }

        // Only extract courses from text near course-context keywords.
        // Grab ~500 chars around each context keyword occurrence.
        const contextKeywords = /(?:kursus|bidang\s*pengajian|program\s*pengajian|jurusan|field\s*of\s*study|eligible\s*(?:course|program|field)|kelayakan\s*(?:kursus|bidang)|course\s*(?:offered|eligible|required|available)|program\s*(?:offered|eligible)|fakulti|faculty|pengajian)/gi;

        let contextText = '';
        let match;
        while ((match = contextKeywords.exec(text)) !== null) {
            const start = Math.max(0, match.index - 200);
            const end = Math.min(text.length, match.index + match[0].length + 500);
            contextText += ' ' + text.substring(start, end);
        }

        // If no course context found, don't extract anything
        if (!contextText.trim()) return null;

        const matched = new Set();

        for (const { label, regex } of this.coursePatterns) {
            if (regex.test(contextText)) {
                matched.add(label);
            }
        }

        if (matched.size === 0) return null;
        return [...matched].join(', ');
    }

    /**
     * Extract minimum CGPA requirement as a float value (2 decimal places).
     * Returns a number (e.g. 3.50) or null if not found.
     */
    extractEligibility(text) {
        const cgpaPatterns = [
            /(?:cgpa|gpa|pngk|png)\s+(?:of\s+(?:at\s+least\s+)?)?(\d\.\d{1,2})/i,
            /(?:cgpa|gpa|pngk|png)\s*[:\-–]\s*(\d\.\d{1,2})/i,
            /(?:cgpa|gpa|pngk|png)\s*(?:minimum|sekurang-kurangnya|at\s*least|tidak\s*kurang|melebihi|above)\s*[:\-–]?\s*(\d\.\d{1,2})/i,
            /(?:minimum|sekurang-kurangnya|at\s*least|tidak\s*kurang)\s*(?:cgpa|gpa|pngk|png)\s*[:\-–]?\s*(\d\.\d{1,2})/i,
            /(?:cgpa|gpa|pngk|png)\s*(\d\.\d{1,2})\s*(?:dan\s*ke\s*atas|and\s*above|or\s*above|ke\s*atas|\+)/i,
            /(?:cgpa|gpa|pngk|png)\s*[>≥]\s*(\d\.\d{1,2})/i,
            /(?:with\s+a\s+)?(?:cgpa|gpa|pngk|png)\s+(\d\.\d{1,2})/i,
        ];

        for (const pattern of cgpaPatterns) {
            const match = text.match(pattern);
            if (match) {
                const cgpa = parseFloat(match[1]);
                if (cgpa >= 1.0 && cgpa <= 4.0) {
                    return parseFloat(cgpa.toFixed(2));
                }
            }
        }

        return null;
    }

    /**
     * Extract the opening date of the application.
     */
    extractOpeningDate(text) {
        // Look for opening-date context keywords (Malay + English)
        const openContextPatterns = [
            /(?:tarikh\s*(?:buka|mula)|opening\s*date|application\s*(?:open|start)|permohonan\s*(?:dibuka|bermula)|mula\s*(?:dari|pada)|open\s*(?:from|on|date))[:\s]*(.*?)(?:\n|$)/gi,
        ];

        for (const pattern of openContextPatterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const dateStr = match[1].trim();
                const parsed = this._parseDate(dateStr);
                if (parsed) return parsed;
            }
        }

        return null;
    }

    /**
     * Extract monetary amount.
     */
    extractAmount(text) {
        const patterns = [
            /RM\s*([\d,]+(?:\.\d{1,2})?)/i,
            /\$\s*([\d,]+(?:\.\d{1,2})?)/,
            /([\d,]+(?:\.\d{1,2})?)\s*(?:ringgit|usd|myr)/i,
            /(?:amount|value|worth|up\s*to|sehingga|sebanyak|bernilai)[\s:]*(?:RM|\$)?\s*([\d,]+(?:\.\d{1,2})?)/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                const val = parseFloat(match[1].replace(/,/g, ''));
                if (val >= 50 && val <= 10000000) return val;
            }
        }

        return null;
    }

    /**
     * Extract application deadline / closing date.
     */
    extractDeadline(text) {
        // Look for deadline-related context first
        const deadlineContextPatterns = [
            /(?:deadline|tarikh\s*tutup|tarikh\s*akhir|tutup|due\s*date|last\s*date|clos(?:e|ing)\s*(?:date)?|permohonan\s*ditutup|tamat\s*(?:pada|tarikh))[:\s]*(.*?)(?:\n|$)/gi,
        ];

        // Try context-based extraction first
        for (const pattern of deadlineContextPatterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const dateStr = match[1].trim();
                const parsed = this._parseDate(dateStr);
                if (parsed) return parsed;
            }
        }

        // Fallback: find any date in the text
        return this._parseDate(text);
    }

    /**
     * Shared date parser — handles multiple date formats including BM months.
     */
    _parseDate(text) {
        const months = {
            'januari': '01', 'january': '01', 'jan': '01',
            'februari': '02', 'february': '02', 'feb': '02',
            'mac': '03', 'march': '03', 'mar': '03',
            'april': '04', 'apr': '04',
            'mei': '05', 'may': '05',
            'jun': '06', 'june': '06',
            'julai': '07', 'july': '07', 'jul': '07',
            'ogos': '08', 'august': '08', 'aug': '08',
            'september': '09', 'sep': '09', 'sept': '09',
            'oktober': '10', 'october': '10', 'oct': '10',
            'november': '11', 'nov': '11',
            'disember': '12', 'december': '12', 'dec': '12',
        };

        const patterns = [
            // "31 March 2026" or "31 Mac 2026"
            { regex: /(\d{1,2})\s+(Januari|Februari|Mac|March|April|Mei|May|Jun|June|Julai|July|Ogos|August|September|Oktober|October|November|Disember|December|Jan|Feb|Mar|Apr|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s+(\d{4})/i, type: 'dmy' },
            // "March 31, 2026"
            { regex: /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/i, type: 'mdy' },
            // "31/03/2026" or "31-03-2026"
            { regex: /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/, type: 'dmy_num' },
            // "2026-03-31"
            { regex: /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/, type: 'ymd' },
        ];

        for (const { regex, type } of patterns) {
            const match = text.match(regex);
            if (!match) continue;

            try {
                let day, monthStr, year;

                if (type === 'dmy') {
                    day = match[1].padStart(2, '0');
                    monthStr = match[2].toLowerCase();
                    year = match[3];
                } else if (type === 'mdy') {
                    monthStr = match[1].toLowerCase();
                    day = match[2].padStart(2, '0');
                    year = match[3];
                } else if (type === 'dmy_num') {
                    day = match[1].padStart(2, '0');
                    monthStr = null;
                    year = match[3];
                    const month = match[2].padStart(2, '0');
                    const d = new Date(`${year}-${month}-${day}`);
                    if (!isNaN(d.getTime())) return d.toISOString();
                    continue;
                } else if (type === 'ymd') {
                    year = match[1];
                    const month = match[2].padStart(2, '0');
                    day = match[3].padStart(2, '0');
                    const d = new Date(`${year}-${month}-${day}`);
                    if (!isNaN(d.getTime())) return d.toISOString();
                    continue;
                }

                const month = months[monthStr];
                if (month) {
                    const d = new Date(`${year}-${month}-${day}`);
                    if (!isNaN(d.getTime())) return d.toISOString();
                }
            } catch (e) {
                continue;
            }
        }

        return null;
    }
}

module.exports = ContentProcessor;