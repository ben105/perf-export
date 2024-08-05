const fs = require('fs');
const csv = require('csv-parser');
const handlebars = require('handlebars');
const { chromium } = require('playwright');

(() => {
  const templateSource = fs.readFileSync('template.hbs', 'utf8');
  const template = handlebars.compile(templateSource);

  const rows = [];
  fs.createReadStream('data.csv')
    .pipe(csv())
    .on('data', (row) => rows.push(row))
    .on('end', async () => {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const htmlContent = template(row);
        const outputPath = `output_${i + 1}.pdf`;
        await generatePdf(htmlContent, outputPath);
      }
    })
})();

async function generatePdf(htmlContent, outputPath) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
  await page.pdf({ path: outputPath, format: 'A4' });
  await browser.close();
  console.log(`PDF generated: ${outputPath}`);
}

