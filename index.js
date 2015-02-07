'use strict';

var path = require('path');

var isDebug = require('isdebug');
var Goji = require('goji');
var Hapi = require('hapi');

var server = new Hapi.Server();
server.connection({
  address: '127.0.0.1',
  port: 8080
});

var templateDir = path.resolve(__dirname + '/templates');
var gojiOptions = {
  cache: false, // We don't need Goji to cache anything. Hapi will do it
  templatesDir: templateDir // We need to tell Goji where to look for templates
};

// Configure Hapi's views engine to use Goji to render templates
server.views({
  engines: {
    html: new Goji(gojiOptions)
  },
  path: templateDir, // Hapi needs to know about the template directory too
  isCached: !isDebug
});

// Serve a template that will be processed by Goji
server.route({
  path: '/',
  method: 'GET',
  handler: function indexHandler(request, reply) {
    // Create a context for Goji to use during processing
    var context = {
      partial: {
        // 'index' is the name of the file within the partials directory
        // that will be loaded when `g-partial="partial.name"`
        name: 'index'
      },
      foo: {
        url: '/foo'
      }
    };

    // Reply with the processed template
    reply.view('index', context);
  }
});

// Add another route to show using a template as a layout
server.route({
  path: '/foo',
  method: 'GET',
  handler: function fooHandler(request, reply) {
    var context = {
      partial: {
        name: 'foo'
      },
      foo: {
        class: 'bar',
        text: 'Text from the context.'
      }
    };

    // The "index" template is our layout
    reply.view('index', context);
  }
});

// Serve static files out of the /web directory
server.route({
  method: 'GET',
  path: '/{param*}',
  handler: {
    directory: {
      path: 'web'
    }
  }
});

server.start(function() {
  console.log('server started -- %s', server.info.uri);
});