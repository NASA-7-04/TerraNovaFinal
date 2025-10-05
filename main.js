const path = require('path');
const express = require('express');
const cors = require('cors');

function init(parent) {
  const app = express();
  const corsOptions = {
    origin: [
      "https://gengine.co.kr"
    ],
    credentials: true,
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  app.use('', express.static(path.join(__dirname, 'build')));

  app.get('', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

  parent.use("/terranova", app);
}

module.exports = { init };
