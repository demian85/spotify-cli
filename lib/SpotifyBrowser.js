const path = require('path');
const puppeteer = require('puppeteer');

const CHROME_EXEC_PATH = '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary';
// const CHROME_USER_DATA_DIR = '/Users/demian/Library/Application Support/Google/Chrome Canary/';
const DEFAULT_USER_DATA_DIR = path.resolve(__dirname, '../profile');

class SpotifyBrowser {

  constructor() {
    this.playlists = [];
    this.browser = null;
    this.page = null;
  }

  getPlaylistNames() {
    return this.playlists.map(v => v.name);
  }

  async open() {
    try {
      console.log(puppeteer.defaultArgs({
        userDataDir: DEFAULT_USER_DATA_DIR,
        headless: false,
      }));
      this.browser = await puppeteer.launch({
        executablePath: CHROME_EXEC_PATH,
        userDataDir: DEFAULT_USER_DATA_DIR,
        headless: true,
        defaultViewport: {
          width: 1920,
          height: 1080,
        },
        ignoreDefaultArgs: ['--mute-audio', '--hide-scrollbars'],
      });
      this.page = await this.browser.newPage();
      await this.page.setViewport({
        width: 1366,
        height: 768,
      });
      await this.page.setDefaultNavigationTimeout(10000);
      await this.loadPlaylists();
    } catch (e) {
      console.error(e);
    }
  }

  async close() {
    try {
      await this.page.close();
      await this.browser.close();
    } catch (e) {
      console.error('browser already closed');
    }
  }

  async play(playlistName) {
    const playlist = this.playlists.find(item => item.name === playlistName);
    if (!playlist) {
      throw new Error('invalid playlist');
    }
    console.log(`Loading playlist ${playlist.name}...`);
    await this.page.goto(playlist.href);
    await this.page.waitForSelector('.entity-info .btn-green');
    await this.page.screenshot({ path: 'screenshot-test.png' });
    await this.page.click('.entity-info .btn-green');
    // await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
    // await this.page.keyboard.down('Space');
  }

  async login() {
    const { page } = this;
    console.log('Loading...');
    await page.goto('https://accounts.spotify.com/en/login');
    console.log('Logging in...');
    await page.type('#login-username', process.env.SPOTIFY_USER);
    await page.type('#login-password', process.env.SPOTIFY_PASS);
    await page.click('#login-button');
    await page.screenshot({ path: 'login.png' });
  }

  async loadPlaylists() {
    console.log('Loading...');
    await this.page.goto('https://open.spotify.com/collection/playlists');
    await this.page.screenshot({ path: 'playlists.png' });
    await this.page.waitForSelector('a.cover-art', { timeout: 5000 });
    this.playlists = await this.page.$$eval('a.cover-art', (elements) => {
      return elements.map((el) => {
        const parentContainer = el.closest('.media-object-hoverable');
        const name = parentContainer.querySelector('.mo-info-name').textContent.trim();
        const playlistUrlMatch = el.href.match(/\/playlist\/(\w+)$/i);
        const id = playlistUrlMatch[1] || null;
        return { name, id, href: el.href };
      });
    });
    console.log(`Found ${this.playlists.length} playlists...`);
  }
}

module.exports = SpotifyBrowser;
