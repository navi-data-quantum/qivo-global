class TranslationService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async t(key, lang = "en") {
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

module.exports = TranslationService;