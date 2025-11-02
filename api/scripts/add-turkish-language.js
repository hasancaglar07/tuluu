/**
 * Script to add Turkish language to MongoDB
 * Run with: node api/scripts/add-turkish-language.js
 */

const mongoose = require('mongoose');

// MongoDB connection URI from .env
const MONGODB_URI = 'mongodb+srv://tarfyazilim_db_user:rVJhMF2Xvm0eYXvb@tulu0.ztsglsx.mongodb.net/?appName=tulu0';

// Language Schema (matching api/models/Language.ts)
const LanguageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    nativeName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    flag: {
      type: String,
      required: true,
      trim: true,
    },
    baseLanguage: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    imageUrl: {
      type: String,
      required: false,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Create model
const Language = mongoose.model('Language', LanguageSchema);

// Turkish language data
const turkishLanguage = {
  name: 'turkish',
  nativeName: 'türkçe',
  flag: '🇹🇷',
  baseLanguage: 'english',
  imageUrl: 'https://cdn-icons-png.flaticon.com/128/197/197518.png',
  isActive: true,
};

async function addTurkishLanguage() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if Turkish already exists
    const existingTurkish = await Language.findOne({
      name: 'turkish',
      baseLanguage: 'english',
    });

    if (existingTurkish) {
      console.log('⚠️  Turkish language already exists in database:');
      console.log(JSON.stringify(existingTurkish, null, 2));
      console.log('\n✅ No action needed - Turkish is already configured!');
    } else {
      // Create new Turkish language record
      const newLanguage = new Language(turkishLanguage);
      await newLanguage.save();

      console.log('✅ Turkish language successfully added to database:');
      console.log(JSON.stringify(newLanguage, null, 2));
    }

    // List all languages
    console.log('\n📋 All languages in database:');
    const allLanguages = await Language.find({});
    allLanguages.forEach((lang, index) => {
      console.log(
        `${index + 1}. ${lang.flag} ${lang.nativeName} (${lang.name}) - ${
          lang.isActive ? '✅ Active' : '❌ Inactive'
        }`
      );
    });

    console.log('\n✨ Script completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
addTurkishLanguage();