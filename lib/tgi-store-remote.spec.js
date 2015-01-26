/**---------------------------------------------------------------------------------------------------------------------
 * tgi-store-remote/lib/tgi-store-remote.spec.js
 */
/**
 * Doc Intro
 */
spec.test('lib/tgi-store-remote.spec.js', 'REMOTE_STORE', '', function (callback) {
  var coreTests = spec.mute(false);
  spec.heading('RemoteStore', function () {
    spec.paragraph('The RemoteStore handles data storage to a host using the Transport core ' +
    'and tgi-store-host.js in this repo');
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
      //spec.runnerStoreMethods(RemoteStore,true);
      spec.my_runnerListStoreIntegration(RemoteStore);
    });
  });
});

spec.my_runnerListStoreIntegration = function (SurrogateStore) {
  spec.example('Test variations on getList method.', spec.asyncResults(true), function (callback) {
    var test = this;
    var storeBeingTested = new SurrogateStore();
    test.log('storeBeingTested: ' + storeBeingTested);

    // Create list of actors
    test.actorsInfo = [
      // Actor Born Male Oscards
      ['Jack Nicholson', new Date("01/01/1937"), true, 3],
      ['Meryl Streep', new Date("01/01/1949"), false, 3],
      ['Marlon Brando', new Date("01/01/1924"), true, 2],
      ['Cate Blanchett', new Date("01/01/1969"), false, 1],
      ['Robert De Niro', new Date("01/01/1943"), true, 2],
      ['Judi Dench', new Date("01/01/1934"), false, 1],
      ['Al Pacino', new Date("01/01/1940"), true, 1],
      ['Nicole Kidman', new Date("01/01/1967"), false, null],
      ['Daniel Day-Lewis', new Date("01/01/1957"), true, null],
      ['Shirley MacLaine', new Date("01/01/1934"), false, null],
      ['Dustin Hoffman', new Date("01/01/1937"), true, null],
      ['Jodie Foster', new Date("01/01/1962"), false, null],
      ['Tom Hanks', new Date("01/01/1956"), true, null],
      ['Kate Winslet', new Date("01/01/1975"), false, null],
      ['Anthony Hopkins', new Date("01/01/1937"), true, null],
      ['Angelina Jolie', new Date("01/01/1975"), false, null],
      ['Paul Newman', new Date("01/01/1925"), true, null],
      ['Sandra Bullock', new Date("01/01/1964"), false, null],
      ['Denzel Washington', new Date("01/01/1954"), true, null],
      ['Renée Zellweger', new Date("01/01/1969"), false, null]
    ];

    // Create actor class
    test.Actor = function (args) {
      Model.call(this, args);
      this.modelType = "Actor";
      this.attributes.push(new Attribute('name'));
      this.attributes.push(new Attribute('born', 'Date'));
      this.attributes.push(new Attribute('isMale', 'Boolean'));
      this.attributes.push(new Attribute('oscarWs', 'Number'));
    };
    test.Actor.prototype = inheritPrototype(Model.prototype);
    test.actor = new test.Actor(); // instance to use for stuff

    // Make sure store starts in known state.  Stores such as mongoStore will retain test values.
    // So... use getList to get all Actors then delete them from the Store
    test.list = new List(new test.Actor());
    test.oldActorsKilled = 0;
    test.oldActorsFound = 0;
    try {
      test.killhim = new test.Actor();
      storeBeingTested.getList(test.list, [], function (list, error) {
        if (typeof error != 'undefined') {
          callback(error);
          return;
        }
        if (list._items.length < 1)
          storeActors();
        else {
          test.oldActorsFound = list._items.length;
          var testakill = function (model, error) {
            if (++test.oldActorsKilled >= test.oldActorsFound) {
              storeActors();
            }
          };
          for (var i = 0; i < list._items.length; i++) {
            test.killhim.set('id', list._items[i][0]);
            storeBeingTested.deleteModel(test.killhim, testakill);
          }
        }
      });
    }
    catch (err) {
      callback(err);
    }

    // Callback after model cleaned
    // now, build List and add to store
    function storeActors() {
      test.actorsStored = 0;
      for (var i = 0; i < test.actorsInfo.length; i++) {
        test.actor.set('ID', null);
        test.actor.set('name', test.actorsInfo[i][0]);
        test.actor.set('born', test.actorsInfo[i][1]);
        test.actor.set('isMale', test.actorsInfo[i][2]);
        storeBeingTested.putModel(test.actor, actorStored);
      }
    }

    // Callback after actor stored
    function actorStored(model, error) {
      if (typeof error != 'undefined') {
        callback(error);
        return;
      }
      if (++test.actorsStored >= test.actorsInfo.length) {
        getAllActors();
      }
    }

    // test getting all 20
    function getAllActors() {
      try {
        storeBeingTested.getList(test.list, {}, function (list, error) {
          if (typeof error != 'undefined') {
            callback(error);
            return;
          }
          test.shouldBeTrue(list._items.length == 20, '20');
          getTomHanks();
        });
      }
      catch (err) {
        callback(err);
      }
    }

    // only one Tom Hanks
    function getTomHanks() {
      try {
        storeBeingTested.getList(test.list, {name: "Tom Hanks"}, function (list, error) {
          if (typeof error != 'undefined') {
            callback(error);
            return;
          }
          test.shouldBeTrue(list._items.length == 1, ('1 not ' + list._items.length));
          getD();
        });
      }
      catch (err) {
        callback(err);
      }
    }

    // 3 names begin with D
    // test RegExp
    function getD() {

      //callback(true);
      //return;


      try {
        storeBeingTested.getList(test.list, {name: /^D/}, function (list, error) {
          if (typeof error != 'undefined') {
            callback(error);
            return;
          }
          test.shouldBeTrue(list._items.length == 3, ('3 not ' + list._items.length));
          getRZ();
        });
      }
      catch (err) {
        callback(err);
      }
    }

    // Renée Zellweger only female starting name with 'R'
    // test filter 2 properties (logical AND)
    function getRZ() {
      try {
        storeBeingTested.getList(test.list, {name: /^R/, isMale: false}, function (list, error) {
          if (typeof error != 'undefined') {
            callback(error);
            return;
          }
          test.shouldBeTrue(list._items.length == 1, ('1 not ' + list._items.length));
          test.shouldBeTrue(list.get('name') == 'Renée Zellweger', 'rz');
          getAlphabetical();
        });
      }
      catch (err) {
        callback(err);
      }
    }

    // Retrieve list alphabetically by name
    // test order parameter
    function getAlphabetical() {
      try {
        storeBeingTested.getList(test.list, {}, {name: 1}, function (list, error) {
          if (typeof error != 'undefined') {
            callback(error);
            return;
          }
          // Verify each move returns true when move succeeds
          test.shouldBeTrue(list.moveFirst(), 'moveFirst');
          test.shouldBeTrue(!list.movePrevious(), 'movePrevious');
          test.shouldBeTrue(list.get('name') == 'Al Pacino', 'AP');
          test.shouldBeTrue(list.moveLast(), 'moveLast');
          test.shouldBeTrue(!list.moveNext(), 'moveNext');
          test.shouldBeTrue(list.get('name') == 'Tom Hanks', 'TH');
          callback(true);
        });
      }
      catch (err) {
        callback(err);
      }
    }
  });
};