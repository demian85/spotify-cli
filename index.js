require('dotenv/config');

const puppeteer = require('puppeteer');

(async () => {
  console.log('Loading...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://accounts.spotify.com/en/login');
  console.log('Logging in...');
  await page.type('#login-username', process.env.SPOTIFY_USER);
  await page.type('#login-password', process.env.SPOTIFY_PASS);
  await page.click('#login-button');
  await page.screenshot({path: 'login.png'});
  await browser.close();
})();
