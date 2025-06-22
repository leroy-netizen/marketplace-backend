import fs from 'fs';
import path from 'path';
import logger from './logger';

/**
 * Simple template engine that replaces {{variable}} placeholders with values
 */
export const renderTemplate = (template: string, data: Record<string, any>): string => {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();
    
    // Handle conditional blocks with #if
    if (trimmedKey.startsWith('#if ')) {
      const condition = trimmedKey.substring(4);
      const endIfPos = template.indexOf('{{/if}}', template.indexOf(match) + match.length);
      
      if (endIfPos === -1) {
        return match; // No closing tag found
      }
      
      const blockContent = template.substring(
        template.indexOf(match) + match.length,
        endIfPos
      );
      
      return data[condition] ? blockContent : '';
    }
    
    return data[trimmedKey] !== undefined ? data[trimmedKey] : match;
  });
};

/**
 * Load an email template from the templates directory and render it with data
 */
export const renderEmailTemplate = (templateName: string, data: Record<string, any>): string => {
  try {
    // Add current year to all templates
    const templateData = {
      year: new Date().getFullYear(),
      ...data
    };
    
    const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);
    const template = fs.readFileSync(templatePath, 'utf8');
    
    return renderTemplate(template, templateData);
  } catch (error: any) {
    logger.error(`Failed to render email template: ${templateName}`, {
      error: error.message,
      stack: error.stack
    });
    
    // Fallback to a simple template if the template file can't be loaded
    return `
      <h1>${data.title || 'Notification'}</h1>
      <div>${data.content || ''}</div>
    `;
  }
};