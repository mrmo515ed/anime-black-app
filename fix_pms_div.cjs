const fs = require('fs');
let content = fs.readFileSync('src/components/PrivateMessagingSystem.tsx', 'utf8');

const regex = /<X className="w-4 h-4 text-zinc-400 group-hover:text-white" \/>\n              <\/button>\n            <\/div>\n          \)}/g;
const replacement = `<X className="w-4 h-4 text-zinc-400 group-hover:text-white" />
              </button>
              </div>
            </div>
          )}`;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/components/PrivateMessagingSystem.tsx', content);
  console.log('Fixed in PrivateMessagingSystem');
} else {
  console.log('Not found in PrivateMessagingSystem');
}
