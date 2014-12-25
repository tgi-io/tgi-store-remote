/**---------------------------------------------------------------------------------------------------------------------
 * tgi-store-remote/lib/tgi-store-host.source.js
 */

Transport.setMessageHandler('PutModel', function (messageContents, fn) {
  console.log('PutModel here');

  // create proxy for client model
  var ProxyPutModel = function (args) {
    Model.call(this, args);
    this.modelType = messageContents.modelType;
    this.attributes = [];
    for (var a in messageContents.attributes) {
      var attrib = new Attribute(messageContents.attributes[a].name, messageContents.attributes[a].type);
      if (attrib.name == 'id') { // TODO only If mongo! or refactor mongo to normalize IDs
        if (attrib.value != messageContents.attributes[a].value)
          attrib.value = messageContents.attributes[a].value;
      } else {
        attrib.value = messageContents.attributes[a].value;
      }
      this.attributes.push(attrib);
    }
  };
  ProxyPutModel.prototype = inheritPrototype(Model.prototype); // Todo this is not a real class object may need to make factory builder
  var pm = new ProxyPutModel();
  var msg;
  Transport.hostStore.putModel(pm, function (model, error) { // todo Transport.hostStore arg!
    if (typeof error == 'undefined') {
      msg = new Message('PutModelAck', model);
    } else {
      console.log('ERROR: ' + error + "");
      msg = new Message('PutModelAck', error + "");
    }
    fn(msg);
  }, this);
});

Transport.setMessageHandler('GetModel', function (messageContents, fn) {
  console.log('GetModel here');

  // create proxy for client model
  var ProxyGetModel = function (args) {
    Model.call(this, args);
    this.modelType = messageContents.modelType;
    this.attributes = [];
    for (var a in messageContents.attributes) {
      var attrib = new Attribute(messageContents.attributes[a].name, messageContents.attributes[a].type);
      if (attrib.name == 'id') { // TODO only If mongo! or refactor mongo to normalize IDs
        attrib.value = messageContents.attributes[a].value;
      } else {
        attrib.value = messageContents.attributes[a].value;
      }
      this.attributes.push(attrib);
    }
  };
  ProxyGetModel.prototype = inheritPrototype(Model.prototype);
  var pm = new ProxyGetModel();
  var msg;
  Transport.hostStore.getModel(pm, function (model, error) {
    if (typeof error == 'undefined') {
      msg = new Message('GetModelAck', model);
    } else {
      msg = new Message('GetModelAck', error + "");
    }
    fn(msg);
  }, this);
});

Transport.setMessageHandler('DeleteModel', function (messageContents, fn) {
  console.log('DeleteModel here');

  // create proxy for client model
  var ProxyDeleteModel = function (args) {
    Model.call(this, args);
    this.modelType = messageContents.modelType;
    this.attributes = [];
    for (var a in messageContents.attributes) {
      var attrib = new Attribute(messageContents.attributes[a].name, messageContents.attributes[a].type);
      if (attrib.name == 'id') { // TODO only If mongo! or refactor mongo to normalize IDs
        attrib.value = messageContents.attributes[a].value;
      } else {
        attrib.value = messageContents.attributes[a].value;
      }
      this.attributes.push(attrib);
    }
  };
  ProxyDeleteModel.prototype = inheritPrototype(Model.prototype);
  var pm = new ProxyDeleteModel();
  var msg;
  Transport.hostStore.deleteModel(pm, function (model, error) {
    if (typeof error == 'undefined')
      msg = new Message('DeleteModelAck', model);
    else
      msg = new Message('DeleteModelAck', error);
    fn(msg);
  }, this);
});

Transport.setMessageHandler('GetList', function (messageContents, fn) {
  console.log('GetList here');
  var proxyList = new List(new Model());
  proxyList.model.modelType = messageContents.list.model.modelType;
  proxyList.model.attributes = messageContents.list.model.attributes;
  var msg;

  function messageCallback(list, error) {
    if (typeof error == 'undefined')
      msg = new Message('GetListAck', list);
    else
      msg = new Message('GetListAck', error);
    fn(msg);
  }

  if (messageContents.order) {
    Transport.hostStore.getList(proxyList, messageContents.filter, messageContents.order, messageCallback);
  } else {
    Transport.hostStore.getList(proxyList, messageContents.filter, messageCallback);
  }
});
