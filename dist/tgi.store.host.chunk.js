/**---------------------------------------------------------------------------------------------------------------------
 * tgi-store-remote/lib/tgi-store-host.lib.js
 */
TGI.STORE = TGI.STORE || {};
TGI.STORE.HOST = function () {
  return {
    version: '0.0.31'
  };
};

/**---------------------------------------------------------------------------------------------------------------------
 * tgi-store-remote/lib/tgi-store-host.source.js
 */

Transport.setMessageHandler('PutModel', function (messageContents, fn) {
  // create proxy for client model
  var ProxyPutModel = function (args) {
    //console.log('PutModel messageContents: json  ' + JSON.stringify(messageContents));
    Model.call(this, args);
    this.modelType = messageContents.modelType;
    this.attributes = [];
    var a, attrib, v;
    for (a in messageContents.attributes) {
      //console.log('PutModel Attribute: json  ' + JSON.stringify(messageContents.attributes[a]));
      if (messageContents.attributes[a].type == 'Model') {
        v = new Attribute.ModelID(createModelFromModelType(messageContents.attributes[a].modelType));
        v.value = messageContents.attributes[a].value.value;
        if (messageContents.attributes[a].value.name)
          v.name = messageContents.attributes[a].value.name;
        attrib = new Attribute({name: messageContents.attributes[a].name, type: 'Model', value: v});
      } else if (messageContents.attributes[a].type == 'Date') {
        attrib = new Attribute(messageContents.attributes[a].name, messageContents.attributes[a].type);
        try {
          attrib.value = messageContents.attributes[a].value === null ? null : new Date(messageContents.attributes[a].value);
        } catch (e) {
          attrib.value = null;
        }
      } else {
        attrib = new Attribute(messageContents.attributes[a].name, messageContents.attributes[a].type);
        if (attrib.name == 'id') { // TODO only If mongo! or refactor mongo to normalize IDs
          if (attrib.value != messageContents.attributes[a].value)
            attrib.value = messageContents.attributes[a].value;
        } else {
          attrib.value = messageContents.attributes[a].value;
        }
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
      msg = new Message('PutModelAck', error + "");
    }
    fn(msg);
  }, this);
});

Transport.setMessageHandler('GetModel', function (messageContents, fn) {
  //console.log('GetModel here');
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
  //console.log('DeleteModel here');
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
      msg = new Message('DeleteModelAck', error + "");
    fn(msg);
  }, this);
});

Transport.setMessageHandler('GetList', function (messageContents, fn) {
  //console.log('GetList here ==== \n' + JSON.stringify(messageContents.filter));
  var filter = messageContents.filter;
  for (var i in filter)
    if (filter.hasOwnProperty(i)) {
      //console.log('GetList Handler: before ' + i + ':' + filter[i] + '');
      if (typeof filter[i] == 'string' && left(filter[i], 7) == 'RegExp:') {
        filter[i] = new RegExp(right(filter[i], (filter[i].length) - 7), 'i'); // todo instead of hard coding ignore case preserve original regexp correctly
      }
      //console.log('GetList Handler: after ' + i + ':' + filter[i] + '');
    }
  var proxyList = new List(new Model());
  proxyList.model.modelType = messageContents.list.model.modelType;
  proxyList.model.attributes = messageContents.list.model.attributes;
  var msg;

  function messageCallback(list, error) {
    if (typeof error == 'undefined') {
      msg = new Message('GetListAck', list);
      //console.log('messageCallback..............');
      //console.log(JSON.stringify(list));
    } else {
      msg = new Message('GetListAck', error + "");
    }
    fn(msg);
  }

  if (messageContents.order) {
    Transport.hostStore.getList(proxyList, messageContents.filter, messageContents.order, messageCallback);
  } else {
    Transport.hostStore.getList(proxyList, messageContents.filter, messageCallback);
  }
});
