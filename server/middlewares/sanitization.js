import sanitizeHtml from 'sanitize-html';

export const sanitizeInput = (req, res, next) => {
    const sanitizeObject = (obj) => {
        if (!obj) return obj;
        
        if (typeof obj === 'string') {
            return sanitizeHtml(obj, {
                allowedTags: [],
                allowedAttributes: {},
                disallowedTagsMode: 'discard'
            });
        }
        
        if (Array.isArray(obj)) {
            return obj.map(item => sanitizeObject(item));
        }
        
        if (typeof obj === 'object') {
            const sanitized = {};
            for (const [key, value] of Object.entries(obj)) {
                sanitized[key] = sanitizeObject(value);
            }
            return sanitized;
        }
        
        return obj;
    };

    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    if (req.query) {
        req.query = sanitizeObject(req.query);
    }
    if (req.params) {
        req.params = sanitizeObject(req.params);
    }

    next();
};

export const sanitizeHtmlConfig = {
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 'b', 'i', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'a', 'img', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'div', 'blockquote', 'code', 'pre'],
    allowedAttributes: {
        'a': ['href', 'title', 'target', 'rel'],
        'img': ['src', 'alt', 'title', 'width', 'height'],
        'span': ['style', 'class'],
        'p': ['style', 'class'],
        'div': ['style', 'class'],
        'table': ['style', 'class', 'border', 'cellpadding', 'cellspacing'],
        'td': ['style', 'class', 'colspan', 'rowspan'],
        'th': ['style', 'class', 'colspan', 'rowspan']
    },
    allowedStyles: {
        '*': {
            'color': [/^./],
            'background-color': [/^./],
            'text-align': [/^./],
            'font-size': [/^./],
            'font-weight': [/^./],
            'margin': [/^./],
            'padding': [/^./],
            'border': [/^./]
        }
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowProtocolRelative: false
};

export const sanitizeForHtml = (html) => {
    return sanitizeHtml(html, sanitizeHtmlConfig);
};