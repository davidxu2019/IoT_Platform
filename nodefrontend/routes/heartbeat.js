var express = require('express');
var router = express.Router();

/* heartbeat messages. */
router.get('/', function(req, res, next) {
  res.send('OK');
});

module.exports = router;
