const fs = require('fs');
const path = require('path');

const coursesDir = path.join(__dirname, '../src/content/courses');
const files = fs.readdirSync(coursesDir).filter(f => f.endsWith('.json'));

const getSeoDescription = (title, tag) => {
  return `دورة ${title} التفاعلية والمتميزة. نقدم في هذه الدورة تغطية شاملة لجميع دروس ومفاهيم مادة ${tag} بأسلوب مبسط وممتع، مع تدريب مكثف، وحل بنوك الأسئلة، ومتابعة مستمرة لضمان التفوق بأعلى الدرجات.`;
};

files.forEach(file => {
  const filePath = path.join(coursesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (!data.description) {
    data.description = getSeoDescription(data.title, data.tag);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${file}`);
  }
});

console.log('All courses updated with SEO descriptions.');
