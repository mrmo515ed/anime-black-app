const fs = require('fs');
let content = fs.readFileSync('src/components/HomeFeedEngine.tsx', 'utf8');

const regex = /<\/button> className="absolute right-3 top-2\.5 text-zinc-500 hover:text-white">[\s\S]*?<\/div>/;
const replacement = `</button>`;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/components/HomeFeedEngine.tsx', content);
  console.log('Fixed HomeFeedEngine');
} else {
  console.log('Not found in HomeFeedEngine');
}
