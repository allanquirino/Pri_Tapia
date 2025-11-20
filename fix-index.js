// Script Node.js para corrigir index.html automaticamente
// Execute: node fix-index.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const indexPath = path.join(__dirname, 'dist', 'index.html');

if (!fs.existsSync(indexPath)) {
    console.log('❌ index.html não encontrado em dist/. Execute npm run build primeiro.');
    process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');

console.log('🔧 Corrigindo MIME types no index.html...');

// Substituir script modules
html = html.replace(
    /<script type="module" crossorigin src="\/(assets\/[^"]+\.js)"><\/script>/g,
    '<script src="serve-js.php?file=$1"></script>'
);

// Substituir CSS
html = html.replace(
    /<link rel="stylesheet" href="\/(assets\/[^"]+\.css)"[^>]*>/g,
    '<link rel="stylesheet" href="serve-js.php?file=$1">'
);

fs.writeFileSync(indexPath, html);

console.log('✅ index.html corrigido!');
console.log('📁 Arquivo salvo em: dist/index.html');
console.log('📤 Faça upload do dist/ para o servidor.');