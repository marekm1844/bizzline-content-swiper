// Create or update server.js in your project root
const path = require("path");

const nextServer = require("next/dist/server/next-server").default;
const app = new nextServer({
  dir: path.join(__dirname),
  dev: false,
  conf: {
    env: {},
    experimental: {},
    compress: true,
    distDir: "./.next",
  },
});

const handler = app.getRequestHandler();
app.prepare().then(() => {
  require("http")
    .createServer((req, res) => {
      handler(req, res);
    })
    .listen(process.env.PORT || 3000);
});
