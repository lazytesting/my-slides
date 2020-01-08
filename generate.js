const sqrl = require('squirrelly');
const fs = require('fs').promises;
const fse = require('fs-extra')

Array.prototype.asyncForEach = async function (fn) {
    for (let i = 0; i < this.length; i++) {
      await fn(this[i], i);
    }
  };

async function generate() {
    await fse.emptyDir('./dist');
    const slides = await getSlideFolders(); 
    slides.asyncForEach(processSlide);
    fse.copy('./src/statics', './dist/statics');
}

async function processSlide(slideFolder) {
    const template = await fs.readFile("./src/index.html", "utf-8");
    const name = slideFolder.replace('-', ' ');
    var slideHtml = sqrl.Render(template, {Title: name});
    const distFolder = `./dist/${slideFolder}`;
    await fs.mkdir(distFolder, { recursive: true });
    await fs.writeFile(`${distFolder}/index.html`, slideHtml);
    await fse.copy(`./src/${slideFolder}`, distFolder)
}

async function getSlideFolders() {
    const source = './src';
    const items = await fs.readdir(source, { withFileTypes: true });
    const folders = items.filter(dirent=> dirent.isDirectory())
        .filter(dirent=> dirent.name !== 'statics')
        .map(dirent=> dirent.name);
    
    return folders;
}


(async ()=>{
    await generate().catch(console.log)
})();