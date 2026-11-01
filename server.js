'use strict';
const { createServer } = require('./index');
function start() {
  const port = Number(process.env.PORT || 8888);
  const host = process.env.HOST || '127.0.0.1';
  const server = createServer();
  server.listen(port, host, () => console.log(`BabelBet preparation only: http://${host}:${server.address().port}`));
  return server;
}
module.exports = { start };
if (require.main === module) start();
