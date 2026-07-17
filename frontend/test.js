import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  const layout = await page.evaluate(() => {
    const hero = document.querySelector('section:nth-of-type(1)');
    const features = document.querySelector('section:nth-of-type(2)');
    const cta = document.querySelector('section:nth-of-type(3)');
    return {
      heroRect: hero ? hero.getBoundingClientRect() : null,
      featuresRect: features ? features.getBoundingClientRect() : null,
      ctaRect: cta ? cta.getBoundingClientRect() : null,
    };
  });
  console.log(JSON.stringify(layout, null, 2));
  await browser.close();
})();
