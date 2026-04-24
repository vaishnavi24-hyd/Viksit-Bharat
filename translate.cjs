const fs = require('fs');

const content = fs.readFileSync('src/utils/translations.js', 'utf-8');

// The file is a module exporting a single translations object.
// I will parse the 'en' object manually.
const enStr = content.substring(content.indexOf('en: {') + 4, content.indexOf('hi: {')).trim().replace(/,$/, '');
const getEnObj = () => {
    return eval('(' + enStr + ')');
};

const enObj = getEnObj();
const langs = ['ta', 'kn', 'mr', 'bn'];

async function translateText(text, targetLang) {
    if (!text) return '';
    try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
        const data = await res.json();
        return data[0].map(item => item[0]).join('');
    } catch (e) {
        console.error('Translation error:', e);
        return text;
    }
}

async function run() {
    let result = content;
    result = result.substring(0, result.lastIndexOf('}')); // remove last brace
    
    for (const lang of langs) {
        console.log('Translating', lang, '...');
        const keys = Object.keys(enObj);
        let transObjStr = `,\n  ${lang}: {\n`;
        
        // We can parallelize some requests but we don't want to get blocked
        // Batch size of 10
        for (let i = 0; i < keys.length; i += 10) {
            const batch = keys.slice(i, i + 10);
            const promises = batch.map(async key => {
                const text = enObj[key];
                const translated = await translateText(text, lang);
                return { key, translated };
            });
            
            const results = await Promise.all(promises);
            for (let j = 0; j < results.length; j++) {
                const isLast = (i + j) === keys.length - 1;
                transObjStr += `    "${results[j].key}": ${JSON.stringify(results[j].translated)}${isLast ? '' : ','}\n`;
            }
            
            console.log(lang, i + batch.length, '/', keys.length);
            await new Promise(r => setTimeout(r, 100)); // sleep 100ms between batches
        }
        transObjStr += '  }';
        result += transObjStr;
    }
    result += '\n};\n';
    
    fs.writeFileSync('src/utils/translations.js', result);
    console.log('Done.');
}

run().catch(console.error);
