const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public/images/blog');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));

(async () => {
  for (const file of files) {
    const filePath = path.join(dir, file);
    const tempPath = path.join(dir, 'temp_' + file);
    
    await sharp(filePath)
      .resize(800, null, { withoutEnlargement: true }) // Resize to max 800px width
      .jpeg({ quality: 60, progressive: true }) // Compress heavily
      .toFile(tempPath);
      
    fs.renameSync(tempPath, filePath);
    console.log(`Compressed ${file}`);
  }
})();
