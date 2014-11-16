/**---------------------------------------------------------------------------------------------------------------------
 * tgi-store-remote/lib/tgi-store-remote.spec.js
 */
/**
 * Doc Intro
 */
spec.test('lib/tgi-store-remote.spec.js', 'REMOTE_STORE', '', function (callback) {
  var coreTests = spec.mute(false);
  spec.heading('RemoteStore', function () {
    spec.paragraph('The RemoteStore handles data storage via REMOTE_STORE.');
    spec.paragraph('Core tests run: ' + JSON.stringify(coreTests));
    spec.heading('CONSTRUCTOR', function () {
      spec.heading('Store Constructor tests are applied', function () {
        spec.runnerStoreConstructor(RemoteStore,true);
      });
      spec.example('objects created should be an instance of RemoteStore', true, function () {
        return new RemoteStore() instanceof RemoteStore;
      });
    });
    spec.heading('Store tests are applied', function () {
      spec.runnerStoreMethods(RemoteStore,true);
      spec.runnerListStoreIntegration(RemoteStore);
    });
  });
});
