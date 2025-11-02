/**
 * Script to remove Turkish language from MongoDB
 * Run with: node api/scripts/remove-turkish-language.js
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

async function removeTurkishLanguage() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Remove Turkish language
    const result = await Language.deleteOne({
      name: 'turkish',
      baseLanguage: 'english',
    });

    if (result.deletedCount > 0) {
      console.log('✅ Turkish language successfully removed from database');
      console.log(`   Deleted ${result.deletedCount} record(s)`);
    } else {
      console.log('⚠️  Turkish language not found in database');
    }

    // List remaining languages
    console.log('\n📋 Remaining languages in database:');
    const allLanguages = await Language.find({});
    
    if (allLanguages.length === 0) {
      console.log('   No languages in database');
    } else {
      allLanguages.forEach((lang, index) => {
        console.log(
          `${index + 1}. ${lang.flag} ${lang.nativeName} (${lang.name}) - ${
            lang.isActive ? '✅ Active' : '❌ Inactive'
          }`
        );
      });
    }

    console.log('\n✨ Script completed successfully!');
    console.log('💡 Now you can add Turkish language from the admin UI at /admin/lessons');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
removeTurkishLanguage();