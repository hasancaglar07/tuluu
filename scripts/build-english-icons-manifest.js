import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 5 Ünite için sabit kavram havuzları (15'er ikon)
// Dosya adları scripts/thiings_icons_png içinde doğrulandı.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WINDOWS_ICONS_PATH = 'C:/Users/ihsan/Desktop/ikonlar/thiings_icons_png';
const LOCAL_ICONS_PATH = path.join(__dirname, 'thiings_icons_png');

function detectIconsDir() {
  if (fs.existsSync(LOCAL_ICONS_PATH)) return LOCAL_ICONS_PATH;
  if (fs.existsSync(WINDOWS_ICONS_PATH)) return WINDOWS_ICONS_PATH;
  throw new Error('İkon klasörü bulunamadı. scripts/thiings_icons_png veya C:/Users/ihsan/Desktop/ikonlar/thiings_icons_png');
}

function item(fileName, label) {
  return { fileName, label };
}

const curated = [
  {
    key: 'animals',
    titleTR: 'Hayvanlar',
    items: [
      item('African_Lion_african-lion.png', 'lion'),
      item('African_Elephant_african-elephant.png', 'elephant'),
      item('Adelie_Penguin_adelie-penguin.png', 'penguin'),
      item('Dog_dog.png', 'dog'),
      item('Cat_cat.png', 'cat'),
      item('African_Grey_Parrot_african-grey-parrot.png', 'parrot'),
      item('Clown_Fish_clown-fish.png', 'fish'),
      item('Bear_bear.png', 'bear'),
      item('Giraffe_giraffe.png', 'giraffe'),
      item('Zebra_zebra.png', 'zebra'),
      item('Cow_cow.png', 'cow'),
      item('Rabbit_rabbit.png', 'rabbit'),
      item('Frog_frog.png', 'frog'),
      item('Monkey_monkey.png', 'monkey'),
      item('Tiger_tiger.png', 'tiger'),
    ],
  },
  {
    key: 'vehicles',
    titleTR: 'Araçlar',
    items: [
      item('Car_car.png', 'car'),
      item('Bus_bus.png', 'bus'),
      item('Bullet_Train_bullet-train.png', 'train'),
      item('Airplane_airplane.png', 'airplane'),
      item('Cargo_Ship_cargo-ship.png', 'ship'),
      item('Boat_boat.png', 'boat'),
      item('Bicycle_bicycle.png', 'bicycle'),
      item('Blackhawk_Helicopter_blackhawk-helicopter.png', 'helicopter'),
      item('Cable_Car_cable-car.png', 'cable car'),
      item('Ambulance_ambulance.png', 'ambulance'),
      item('Cargo_Plane_cargo-plane.png', 'cargo plane'),
      item('Armored_Truck_armored-truck.png', 'truck'),
      item('Articulated_Bus_articulated-bus.png', 'articulated bus'),
      item('Airship_airship.png', 'airship'),
      item('Boat_Trailer_boat-trailer.png', 'trailer'),
    ],
  },
  {
    key: 'foods',
    titleTR: 'Yiyecekler',
    items: [
      item('Apple_apple.png', 'apple'),
      item('Banana_banana.png', 'banana'),
      item('Bread_bread-white.png', 'bread'),
      item('Cake_cake.png', 'cake'),
      item('Chocolate_Chip_Cookie_chocolate-chip-cookie.png', 'cookie'),
      item('Cheese_cheese.png', 'cheese'),
      item('Cheese_Pizza_cheese-pizza.png', 'pizza'),
      item('Carton_of_Milk_carton-of-milk.png', 'milk'),
      item('Apple_Juice_apple-juice.png', 'juice'),
      item('Bottle_of_Water_bottle-of-water.png', 'water'),
      item('Chicken_Sandwich_chicken-sandwich.png', 'sandwich'),
      item('Deviled_Eggs_deviled-eggs.png', 'eggs'),
      item('Cranberry_Juice_cranberry-juice.png', 'cranberry juice'),
      item('Cupcake_cupcake.png', 'cupcake'),
      item('Classic_Cheeseburger_classic-cheeseburger.png', 'burger'),
    ],
  },
  {
    key: 'home',
    titleTR: 'Ev Eşyaları',
    items: [
      item('Bed_bed.png', 'bed'),
      item('Chair_chair.png', 'chair'),
      item('Coffee_Table_coffee-table.png', 'table'),
      item('Couch_couch.png', 'sofa'),
      item('Byzantine_Icon_Lamp_byzantine-icon-lamp.png', 'lamp'),
      item('Coffee_Cup_coffee-cup.png', 'cup'),
      item('Cordless_Phone_cordless-phone.png', 'phone'),
      item('Computer_Tower_computer-tower.png', 'computer'),
      item('Book_book.png', 'book'),
      item('Bottle_of_Lotion_bottle-of-lotion.png', 'bottle'),
      item('Computer_Mouse_desktop-computer-mouse.png', 'mouse'),
      item('Bunk_Bed_bunk-bed.png', 'bunk bed'),
      item('Armchair_armchair.png', 'armchair'),
      item('Bar_Table_bar-table.png', 'bar table'),
      item('Bottle_Cap_bottle-cap.png', 'bottle cap'),
    ],
  },
  {
    key: 'clothes',
    titleTR: 'Giysiler & Aksesuarlar',
    items: [
      item('Baseball_Cap_baseball-cap.png', 'cap'),
      item('Babushka_Scarf_babushka-scarf.png', 'scarf'),
      item('Chelsea_Boots_chelsea-boots.png', 'boots'),
      item('Cat-Eye_Sunglasses_cat-eye-sunglasses.png', 'sunglasses'),
      item('Ankle_Boots_ankle-boots.png', 'ankle boots'),
      item('Comic_Book_Print_Jacket_comic-book-print-jacket.png', 'jacket'),
      item('Zebra_Print_Fedora_zebra-print-fedora.png', 'hat'),
      item('African_Dress_african-dress.png', 'dress'),
      item('Animal_Print_Headband_animal-print-headband.png', 'headband'),
      item('Banana_Earrings_banana-earrings.png', 'earrings'),
      item('Adventure_Boots_adventure-boots.png', 'boots'),
      item('Cloud_Coat_cloud-coat.png', 'coat'),
      item('Cloud_Print_Sweater_cloud-print-sweater.png', 'sweater'),
      item('Ball_Gown_ball-gown.png', 'gown'),
      item('Bicycle_helmet_bicycle-helmet.png', 'helmet'),
    ],
  },
];

function main() {
  const root = detectIconsDir();
  const manifest = { sourceDir: root, categories: [] };
  for (const cat of curated) {
    const items = cat.items.map((it) => {
      const filePath = path.resolve(root, it.fileName);
      const exists = fs.existsSync(filePath);
      if (!exists) {
        console.warn(`⚠️ Eksik ikon: ${it.fileName}`);
      }
      const slug = it.fileName.replace(/\.[a-zA-Z0-9]+$/, '').split('_').pop();
      return {
        ...it,
        exists,
        slug,
        filePath,
        // Default local URL, blob upload sonrası güncellenecek
        imageUrl: 'file://' + filePath.replace(/\\/g, '/'),
      };
    });
    manifest.categories.push({ key: cat.key, titleTR: cat.titleTR, items });
  }
  const out = path.join(__dirname, 'english_icons_manifest.json');
  fs.writeFileSync(out, JSON.stringify(manifest, null, 2));
  console.log(`✅ Manifest yazıldı: ${out}`);
}

main();

