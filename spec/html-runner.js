/**---------------------------------------------------------------------------------------------------------------------
 * tgi-spec/spec/html-runner.js
 **/
var spec = new Spec({timeOut:1000}); //todo this timeout should not hold if all tests done - test should end!
testSpec(spec, TGI);
log('Connecting to host...');
var RemoteStore = TGI.STORE.REMOTE().RemoteStore;
var hostStore = new RemoteStore({name: 'Host Test Store'});
hostStore.onConnect('http://localhost:8080', function (store, err) {
  if (err) {
    logError('hostStore unavailable (' + err + ')');
  } else {
    log('hostStore connected');
    spec.runTests(function (msg) {
      /**
       * msg callback events msg.error, msg.log, msg.done
       */
      if (msg.error) {
        logError(msg.error);
      } else if (msg.done) {
        if (msg.testsFailed || msg.testsPending)
          logError(msg.testsCreated + ' Tests attempted with ' + msg.testsFailed + ' errors, ' + msg.testsPending + ' pending. ' );
        else
          logSuccess(msg.testsCreated + ' Tests completed with no errors');
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
