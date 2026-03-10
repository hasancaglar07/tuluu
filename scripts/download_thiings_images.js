import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_URL = 'https://www.thiings.co/things';
const OUTPUT_DIR = path.join(__dirname, 'indirilen_gorseller');

// Function to scroll to the bottom of the page to load all content
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

async function scrapeImages() {
    console.log('🚀 Kazıyıcı bot başlatılıyor...');

    // 1. Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR);
        console.log(`✅ Çıktı klasörü oluşturuldu: ${OUTPUT_DIR}`);
    }

    let browser;
    try {
        // 2. Launch Puppeteer
        console.log('🖥️  Tarayıcı başlatılıyor... (Bu işlem biraz sürebilir)');
        browser = await puppeteer.launch({
            headless: true, // Run in the background
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        // 3. Navigate to the target URL
        console.log(`🌍 Sayfaya gidiliyor: ${TARGET_URL}`);
        await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });

        // 4. Scroll to load all images
        console.log('⏬ Sayfa sonuna kadar kaydırılarak tüm görsellerin yüklenmesi sağlanıyor...');
        // A more robust scrolling mechanism might be needed if content loads very slowly
        await page.evaluate(async () => {
            for (let i = 0; i < 100; i++) { // Scroll 100 times to be sure, adjust if needed
                window.scrollBy(0, window.innerHeight);
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        });
        console.log('✅ Tüm görsellerin yüklendiği varsayılıyor.');

        // 5. Extract image URLs
        console.log('🖼️  Görsel URL\'leri toplanıyor...');
        const imageUrls = await page.evaluate(() => {
            const images = Array.from(document.querySelectorAll('img'));
            const urls = images.map(img => img.src).filter(src => src.startsWith('https://'));
            return [...new Set(urls)]; // Remove duplicates
        });

        if (imageUrls.length === 0) {
            console.log('❌ Hiç görsel URL\'si bulunamadı. Site yapısı değişmiş olabilir.');
            return;
        }

        console.log(`👍 ${imageUrls.length} adet benzersiz görsel URL\'si bulundu.`);

        // 6. Download images
        console.log('📥 Görseller indiriliyor...');
        for (const url of imageUrls) {
            try {
                const viewSource = await page.goto(url);
                const buffer = await viewSource.buffer();
                
                // Generate a filename from the URL
                const filename = path.basename(new URL(url).pathname) || `${Date.now()}.png`;
                const savePath = path.join(OUTPUT_DIR, filename);

                fs.writeFileSync(savePath, buffer);
                console.log(`  -> Kaydedildi: ${filename}`);
            } catch (error) {
                console.error(`  -> Hata (indirilemedi): ${url} - ${error.message}`);
            }
        }

        console.log('\n🎉 İŞLEM TAMAMLANDI! 🎉');
        console.log(`Tüm görseller başarıyla "${OUTPUT_DIR}" klasörüne indirildi.`);

    } catch (error) {
        console.error('❌ Beklenmedik bir hata oluştu:', error);
    } finally {
        if (browser) {
            await browser.close();
            console.log('🚪 Tarayıcı kapatıldı.');
        }
    }
}

scrapeImages();
