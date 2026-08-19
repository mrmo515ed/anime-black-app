const fs = require('fs');
let content = fs.readFileSync('src/components/HomeFeedEngine.tsx', 'utf8');

// replace the end of lucide-react import
content = content.replace(/} from "lucide-react";/, `, Eye, Repeat, Star, Coins, MoreVertical, MoreHorizontal, Flag, UserMinus, VolumeX, EyeOff, ShieldAlert, Pin, Lock, Unlock, Download, RotateCcw, AlertTriangle, UserX, FileText } from "lucide-react";`);

fs.writeFileSync('src/components/HomeFeedEngine.tsx', content);
console.log('Fixed imports in HomeFeedEngine');
