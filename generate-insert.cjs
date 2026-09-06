const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const blogDir = path.join(__dirname, 'src/content/blog');
const imagesDir = path.join(__dirname, 'public/images/blog');

const files = fs.readdirSync(blogDir).filter(f => f.startsWith('saudi-curriculum-'));
const images = fs.readdirSync(imagesDir);

let sql = ``;

for (const file of files) {
  const content = fs.readFileSync(path.join(blogDir, file), 'utf-8');
  const parsed = matter(content);
  
  const slug = file.replace('.md', '');
  const title = parsed.data.title;
  const description = parsed.data.description;
  const pubDate = parsed.data.pubDate.toISOString ? parsed.data.pubDate.toISOString() : new Date(parsed.data.pubDate).toISOString();
  const author = parsed.data.author || 'أكاديمية KSA';
  const readingTime = parsed.data.readingTime || '10 دقائق';
  const tags = JSON.stringify(parsed.data.tags || []);
  
  let imageMatch = '';
  if (slug.includes('arabic')) imageMatch = images.find(i => i.startsWith('arabic_guide'));
  else if (slug.includes('biology')) imageMatch = images.find(i => i.startsWith('biology_guide'));
  else if (slug.includes('chemistry')) imageMatch = images.find(i => i.startsWith('chemistry_guide'));
  else if (slug.includes('digital-skills')) imageMatch = images.find(i => i.startsWith('digital_skills_guide'));
  else if (slug.includes('english')) imageMatch = images.find(i => i.startsWith('english_guide'));
  else if (slug.includes('mathematics')) imageMatch = images.find(i => i.startsWith('mathematics_guide'));
  else if (slug.includes('physics')) imageMatch = images.find(i => i.startsWith('physics_guide'));
  else if (slug.includes('qiyas')) imageMatch = images.find(i => i.startsWith('qiyas_tahsili_guide'));
  else if (slug.includes('science')) imageMatch = images.find(i => i.startsWith('science_guide'));

  const heroImage = imageMatch ? `/images/blog/${imageMatch}` : '';

  let body = parsed.content.replace(/'/g, "''"); 
  body = body.replace(/\r/g, ""); 
  body = body.replace(/\n/g, "{NEWLINE}"); 

  sql += `INSERT OR REPLACE INTO blog (slug, title, description, pubDate, heroImage, author, readingTime, tags, body) VALUES ('${slug}', '${title.replace(/'/g, "''")}', '${description.replace(/'/g, "''")}', '${pubDate}', '${heroImage}', '${author}', '${readingTime}', '${tags}', replace('${body}', '{NEWLINE}', char(10)));\n`;
}

fs.writeFileSync(path.join(__dirname, 'insert-new-articles.sql'), sql);
console.log('Successfully generated insert-new-articles.sql!');
