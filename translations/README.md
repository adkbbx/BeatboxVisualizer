# 🌍 Translations Directory - Vibecoding Fireworks App

This directory contains all translation files and internationalization infrastructure for the Vibecoding Fireworks App.

## 📁 File Structure

```
/translations/
├── i18n.js          # Main translation manager class
├── en.js            # English translations (master template)
├── ja.js            # Japanese translations
├── zh-cn.js         # Chinese Simplified translations
├── zh-tw.js         # Chinese Traditional translations
└── README.md        # This file - translation guidelines
```

## 🔧 Usage

### Basic Usage in JavaScript
```javascript
// Get translation
const text = i18n.t('ui.buttons.start'); // Returns: "Start"

// With parameters
const message = i18n.t('presets.messages.loaded', { name: 'Classic' }); 
// Returns: "Preset 'Classic' loaded successfully"

// Switch language
await i18n.switchLanguage('ja');
```

### HTML Usage with data-i18n Attributes
```html
<!-- Static text -->
<span data-i18n="ui.buttons.start">Start</span>

<!-- With parameters -->
<span data-i18n="upload.messages.uploading" data-i18n-current="3" data-i18n-total="10">
  Uploading 3 of 10 files...
</span>
```

## 🗝️ Translation Key Structure

### Naming Convention
- **Dot notation**: `category.subcategory.key`
- **camelCase** for keys
- **Descriptive** and hierarchical
- **Consistent** across all languages

### Key Categories
```
ui.* - User interface elements (buttons, tabs, status)
audio.* - Audio system messages and instructions
settings.* - All settings panel content
presets.* - Preset names, descriptions, and actions
upload.* - File upload system messages
errors.* - Error messages by category
success.* - Success messages by category
navigation.* - Navigation and general UI
time.* - Time and date related text
accessibility.* - Accessibility labels
help.* - Help and instruction content
about.* - About and app information
```

## 📝 Adding New Translations

### 1. Add to English (Master) File
```javascript
// In en.js
ui: {
  buttons: {
    newButton: "New Button Text"
  }
}
```

### 2. Add to ALL Language Files
```javascript
// In ja.js, zh-cn.js, zh-tw.js
ui: {
  buttons: {
    newButton: "新しいボタン" // Japanese translation
  }
}
```

### 3. Use in Code
```javascript
// In JavaScript
button.textContent = i18n.t('ui.buttons.newButton');

// In HTML
<button data-i18n="ui.buttons.newButton">New Button Text</button>
```

## 🌐 Language Support

### Currently Supported
- **English (en)** - Default/fallback language
- **Japanese (ja)** - 日本語
- **Chinese Simplified (zh-cn)** - 简体中文
- **Chinese Traditional (zh-tw)** - 繁體中文

### Adding New Languages

1. **Create translation file**: `translations/{language-code}.js`
2. **Copy structure** from `en.js`
3. **Translate all keys** maintaining the structure
4. **Update i18n.js** supported languages array
5. **Test functionality** across the app

## 🔄 Parameter Interpolation

### Basic Interpolation
```javascript
// Translation with placeholders
"messages": {
  "welcome": "Welcome {{name}}!"
}

// Usage
i18n.t('messages.welcome', { name: 'John' }); // "Welcome John!"
```

### HTML with Parameters
```html
<span data-i18n="upload.messages.uploading" 
      data-i18n-current="3" 
      data-i18n-total="10">
  Uploading files...
</span>
```

## 🛡️ Development Rules

### ✅ DO
- **Always use translation keys** for user-facing text
- **Update ALL language files** when adding new text
- **Use descriptive key names** that explain the content purpose
- **Test language switching** after making changes
- **Handle missing translations** gracefully (falls back to English)

### ❌ DON'T
- **Never hardcode** user-facing text in JavaScript/HTML
- **Don't change key names** without updating all language files
- **Don't use automated translation** without human review
- **Don't forget to update** all language files when adding features

## 🧪 Testing

### Manual Testing Checklist
- [ ] All text displays correctly in each language
- [ ] Language switching works without page reload
- [ ] No text overflow or layout issues
- [ ] Interpolated values display correctly
- [ ] Missing translations fall back to English

### Testing Commands
```javascript
// Test language switching
i18n.switchLanguage('ja');
i18n.switchLanguage('zh-cn');
i18n.switchLanguage('zh-tw');
i18n.switchLanguage('en');

// Test missing key fallback
i18n.t('nonexistent.key'); // Should return 'nonexistent.key'

// Test interpolation
i18n.t('presets.messages.loaded', { name: 'Test' });
```

## 📊 Translation Status

### Completion Status
- **English**: ✅ 100% (Master template)
- **Japanese**: 🔄 ~30% (Core UI completed)
- **Chinese Simplified**: 🔄 ~30% (Core UI completed)
- **Chinese Traditional**: 🔄 ~30% (Core UI completed)

### Priority Translation Areas
1. **Core UI** (buttons, navigation) - ✅ Complete
2. **Audio instructions** - ✅ Complete
3. **Settings panel** - 🔄 In progress
4. **Preset system** - 🔄 In progress
5. **Upload system** - ⏳ Pending
6. **Error messages** - ⏳ Pending

## 🎯 Best Practices

### For Developers
1. **Use semantic keys**: `settings.audio.micSensitivity` not `text1`
2. **Group related content**: Keep buttons under `ui.buttons.*`
3. **Consider text length**: Some languages need more space
4. **Test edge cases**: Very long translations, special characters

### For Translators
1. **Maintain context**: Understand where text appears in UI
2. **Keep technical terms**: Some terms like "Fireworks" may be universal
3. **Preserve formatting**: Keep emoji and special characters
4. **Consider culture**: Adapt instructions for cultural context

## 🔧 Troubleshooting

### Common Issues

**Translation not showing:**
- Check if key exists in translation file
- Verify correct language file is loaded
- Check console for missing key warnings

**Language not switching:**
- Verify language code is supported
- Check if translation file loads without errors
- Confirm `applyTranslations()` is called

**Layout broken with translated text:**
- Test with longer translations
- Adjust CSS for text overflow
- Consider responsive design

## 📞 Support

For questions about translations or internationalization:
1. Check existing translation keys in `en.js`
2. Review this README and main project documentation
3. Test changes in multiple languages before committing
4. Follow the established key naming conventions

---

**Last Updated**: Phase 1 Implementation  
**Next**: Complete remaining translations and integrate with main app 