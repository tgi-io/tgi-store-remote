/**---------------------------------------------------------------------------------------------------------------------
 * tgi-spec/spec/html-runner.js
 **/
var spec = new Spec({timeOut:500});
(function () {
  var CORE = REMOTE_STORE;
  UTILITY().injectMethods(this);
  CORE().injectMethods(this);
  testSpec(spec, CORE);
  log('Connecting to host...');
  var hostStore = new RemoteStore({name: 'Host Test Store'});
  hostStore.onConnect('http://localhost:8080', function (store, err) {
    if (err) {
      logError('hostStore unavailable (' + err + ')');
    } else {
      log('hostStore connected');
      spec.runTests(function (msg) {
        /**
         * msg callback events msg.eror, msg.log, msg.done
         */
        if (msg.error) {
          logError(msg.error);
        } else if (msg.done) {
          if (msg.testsFailed || msg.testsPending)
            if (msg.testsPending)
              logError(msg.testsCreated + ' tests attempted with ' + msg.testsFailed + ' errors, ' +
              msg.testsPending + ' tests timed out');
            else
              logError(msg.testsCreated + ' tests attempted with ' + msg.testsFailed + ' errors');
          else
            logSuccess(msg.testsCreated + ' tests completed with no errors');
        } else if (msg.log) {
          //log(msg.log);
        }
      });
    }
    console.log(hostStore.name + ' ' + hostStore.storeType);
  }, {vendor: null, keepConnection: true});
  /**
   * DOM rendering functions
   */
  function log(txt) {
    if (left(txt, 5) == 'MUTE ' || txt.indexOf("(MUTED)") > -1) return;
    var p = document.createElement("p");
    p.style.margin = '2px';
    p.style.padding = '1px';
    p.style.backgroundColor = "#FFFFF0";
    p.style.border = "solid";
    p.style.borderWidth = "1px";
    p.style.borderColor = "#7F7F8F";
    p.style.lineHeight = "1.0";
    p.appendChild(document.createTextNode(txt));
    document.body.appendChild(p);
  }

  function logError(txt) {
    var p = document.createElement("p");
    p.style.fontWeight = "bold";
    p.style.margin = '2px';
    p.style.padding = '1px';
    p.style.backgroundColor = "#FFCCCC";
    p.style.border = "solid";
    p.style.borderWidth = "1px";
    p.style.lineHeight = "1.5";
    p.appendChild(document.createTextNode(txt));
    document.body.appendChild(p);
  }

  function logSuccess(txt) {
    var p = document.createElement("p");
    p.style.fontWeight = "bold";
    p.style.margin = '2px';
    p.style.padding = '1px';
    p.style.backgroundColor = "#CCFFCC";
    p.style.border = "solid";
    p.style.borderWidth = "1px";
    p.style.lineHeight = "1.5";
    p.appendChild(document.createTextNode(txt));
    document.body.appendChild(p);
  }
}());
