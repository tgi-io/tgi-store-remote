/**---------------------------------------------------------------------------------------------------------------------
 * tgi-spec/spec/node-runner.js
 */
var Spec = require('tgi-spec/dist/tgi.spec.js');
var testSpec = require('../dist/tgi-store-remote.spec.js');
var spec = new Spec();
var UTILITY = require('tgi-utility/dist/tgi.utility');
var CORE = require('../dist/tgi-store-remote.js');
var fs = require('fs');

(function () {
  UTILITY().injectMethods(this);
  CORE().injectMethods(this);
  testSpec(spec, CORE);

  var remoteStore = new remoteStore({name: 'Host Test Store'});
  remoteStore.onConnect('http://localhost', function (store, err) {
    if (err) {
      console.log('remoteStore unavailable (' + err + ')');
      process.exit(1);
    } else {
      console.log('remoteStore connected');
      spec.runTests(function (msg) {
        if (msg.error) {
          console.log(msg.error);
          process.exit(1);
        } else if (msg.done) {
          console.log('Testing completed with  ...');
          console.log('testsCreated = ' + msg.testsCreated);
          console.log('testsPending = ' + msg.testsPending);
          console.log('testsFailed = ' + msg.testsFailed);
          if (msg.testsFailed || msg.testsPending) {
            fs.writeFileSync('spec/README.md', spec.githubMarkdown(), 'utf8');
            process.exit(1);
          } else {
            fs.writeFileSync('spec/README.md', spec.githubMarkdown(), 'utf8');
            process.exit(0);
          }
        } else if (msg.log) {
          //console.log(msg.log);
        }
      });
    }
  }, {vendor:null, keepConnection: true});

}());


