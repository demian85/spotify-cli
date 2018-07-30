require('dotenv/config');

const repl = require('repl');
const SpotifyBrowser = require('./lib/SpotifyBrowser');

async function initREPL() {
  const spotify = new SpotifyBrowser();
  await spotify.open();

  const server = repl.start({
    prompt: '>',
    // eval: (cmd, context, filename, cb) => {

    // },
    completer(line) {
      const match = line.match(/^.play(.*)/);
      let results = [];
      if (match) {
        const input = match[1].trim();
        const completions = spotify.getPlaylistNames();
        const hits = completions.filter(item => item.startsWith(input));
        results = hits.length === 1 ? [`.play ${hits[0]}`] : hits;
      }
      return [results, line];
    },
  });
  server.defineCommand('play', {
    help: 'Start playing specified playlist name',
    async action(name) {
      this.clearBufferedCommand();
      console.log(`Play ${name}!`);
      try {
        await spotify.play(name);
      } catch (e) {
        console.error(e.message);
      }
      this.displayPrompt();
    },
  });

  server.on('exit', async () => {
    console.log('Closing session...');
    await spotify.close();
  });
}

(async () => {
  await initREPL();
})();
