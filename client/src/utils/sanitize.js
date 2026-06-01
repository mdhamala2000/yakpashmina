import DOMPurify from 'dompurify';

export const sanitizeHtml = (dirtyHtml) => {
    if (!dirtyHtml) return '';
    
    return DOMPurify.sanitize(dirtyHtml, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'b', 'i', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'a', 'img', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'div', 'blockquote', 'code', 'pre'],
        ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'src', 'alt', 'width', 'height', 'style', 'class'],
        ALLOW_DATA_ATTR: false
    });
};

export const sanitizeText = (text) => {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};