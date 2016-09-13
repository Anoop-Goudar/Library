'use strict';

var cas = require('connect-cas');


module.exports = function (app) {
  // Root routing
  var core = require('../controllers/core.server.controller');

  // Define error pages
  app.route('/server-error').get(core.renderServerError);

  // Return a 404 for all undefined api, module or lib routes
  app.route('/:url(api|modules|lib)/*').get(core.renderNotFound);

  // Define application route
  // cas.ssout('/routename'), cas.serviceValidate(), cas.authenticate()
  app.route('/*').get(cas.ssout('/routename'), cas.serviceValidate(), cas.authenticate(), core.renderIndex);
  // core.renderIndex

};
