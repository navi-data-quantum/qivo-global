import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TranslationService {
  constructor(private prisma: PrismaService) {}

  async t(key: string, lang: string = 'en'): Promise<string> {
    const translation = await this.prisma.app_translations.findFirst({
      where: {
        translation_key: key,
        language_code: lang,
      },
    });

    if (!translation) {
      return key;
    }

    return translation.translation_text;
  }
}