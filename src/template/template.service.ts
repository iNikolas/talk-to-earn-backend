import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

@Injectable()
export class TemplateService {
  private templatesCache: { [key: string]: HandlebarsTemplateDelegate } = {};

  private loadTemplate(templateName: string): HandlebarsTemplateDelegate {
    if (this.templatesCache[templateName]) {
      return this.templatesCache[templateName];
    }

    const templateFilePath = path.join(
      process.cwd(),
      'client',
      'templates',
      `${templateName}.html`,
    );

    const templateFile = fs.readFileSync(templateFilePath, 'utf8');
    const template = handlebars.compile(templateFile);
    this.templatesCache[templateName] = template;

    return template;
  }

  public renderTemplate(templateName: string, data: any): string {
    const template = this.loadTemplate(templateName);
    return template(data);
  }
}
