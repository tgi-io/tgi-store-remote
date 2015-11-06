/**---------------------------------------------------------------------------------------------------------------------
 * tgi-store-remote/lib/tgi-store-remote.lib.js
 */
TGI.STORE = TGI.STORE || {};
TGI.STORE.REMOTE = function () {
  return {
    version: '0.0.3',
    RemoteStore: RemoteStore
  };
};

/**---------------------------------------------------------------------------------------------------------------------
 * tgi-store-remote/lib/tgi-store-remote.source.js
 */

/**
 * Constructor
 */
var RemoteStore = function (args) {
  if (false === (this instanceof RemoteStore)) throw new Error('new operator required');
  args = args || {};
  this.storeType = args.storeType || "RemoteStore";
  this.name = args.name || 'a ' + this.storeType;
  this.storeProperty = {
    isReady: false,
    canGetModel: true,
    canPutModel: true,
    canDeleteModel: true,
    canGetList: true
  };
  var unusedProperties = getInvalidProperties(args, ['name', 'storeType']);
  var errorList = [];
  for (var i = 0; i < unusedProperties.length; i++) errorList.push('invalid property: ' + unusedProperties[i]);
  if (errorList.length > 1) throw new Error('error creating Store: multiple errors');
  if (errorList.length) throw new Error('error creating Store: ' + errorList[0]);

  // if already connected reuse but ... todo is this good code ???

  if (RemoteStore.transport) {
    this.storeProperty.isReady = true;
    this.transport = RemoteStore.transport;
  }

};
RemoteStore.prototype = Object.create(Store.prototype);
/**
 * Methods
 */
RemoteStore.prototype.onConnect = function (location, callback, options) {
  if (typeof location != 'string') throw new Error('argument must a url string');
  if (typeof callback != 'function') throw new Error('argument must a callback');
  var store = this;
  try {
    store.transport = new Transport(location, function (msg) {
      if (msg.type == 'Error') {
        console.log('Transport connect error: ' + store.name);
        callback(undefined, new Error(msg.contents));
        return;
      }
      if (msg.type == 'Connected') {
        //console.log('Transport connected: ' + store.name);
        store.storeProperty.isReady = true;
        RemoteStore.transport = store.transport; // todo a static connection not well designed
        callback(store);
        return;
      }
      console.log('Transport unexpected message type: ' + store.name);
      callback(undefined, new Error('unexpected message type: ' + msg.type));
    });
  }
  catch (err) {
    callback(undefined, err);
  }
};
RemoteStore.prototype.getModel = function (model, callback) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getObjectStateErrors().length) throw new Error('model has validation errors');
  if (!model.attributes[0].value) throw new Error('ID not set');
  if (typeof callback != "function") throw new Error('callback required');
  this.transport.send(new Message('GetModel', model), function (msg) {
    //console.log('GetModel callback');
    if (false && msg == 'Ack') { // todo wtf is this
      callback(model);
    } else if (msg.type == 'GetModelAck') {
      var c = msg.contents;
      model.attributes = [];
      for (var a in c.attributes) {
        if (c.attributes.hasOwnProperty(a)) {
          var attrib = new Attribute(c.attributes[a].name, c.attributes[a].type);
          attrib.value = c.attributes[a].value;
          model.attributes.push(attrib);
        }
      }
      if (typeof c == 'string')
        callback(model, c);
      else
        callback(model);
    } else {
      callback(model, Error(msg));
    }
  });
};
RemoteStore.prototype.putModel = function (model, callback) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getObjectStateErrors().length) throw new Error('model has validation errors');
  if (typeof callback != "function") throw new Error('callback required');
  this.transport.send(new Message('PutModel', model), function (msg) {
    if (false && msg == 'Ack') { // todo wtf is this
      callback(model);
    } else if (msg.type == 'PutModelAck') {
      var c = msg.contents;

      model.attributes = [];
      for (var a in c.attributes) {
        if (c.attributes.hasOwnProperty(a)) {
          var attrib;
          //if (c.attributes[a].type=='Model') {
          //  var v = new Attribute.ModelID(new Model());
          //  v.value = c.attributes[a].value;
          //  attrib = new Attribute({name:c.attributes[a].name, type:'Model',value:v});
          //} else {
            attrib = new Attribute(c.attributes[a].name, c.attributes[a].type);
            attrib.value = c.attributes[a].value;
          //}
          model.attributes.push(attrib);
        }
      }

      if (typeof c == 'string')
        callback(model, c);
      else
        callback(model);
    } else {
      callback(model, Error(msg));
    }
  });
};

RemoteStore.prototype.deleteModel = function (model, callback) {
  if (!(model instanceof Model)) throw new Error('argument must be a Model');
  if (model.getObjectStateErrors().length) throw new Error('model has validation errors');
  if (typeof callback != "function") throw new Error('callback required');
  this.transport.send(new Message('DeleteModel', model), function (msg) {
    //console.log('DeleteModel callback');
    if (false && msg == 'Ack') { // todo wtf is this
      callback(model);
    } else if (msg.type == 'DeleteModelAck') {
      var c = msg.contents;
      model.attributes = [];
      for (var a in c.attributes) {
        if (c.attributes.hasOwnProperty(a)) {
          var attrib = new Attribute(c.attributes[a].name, c.attributes[a].type);
          attrib.value = c.attributes[a].value;
          model.attributes.push(attrib);
        }
      }
      if (typeof c == 'string')
        callback(model, c);
      else
        callback(model);
    } else {
      callback(model, Error(msg));
    }
  });
};
RemoteStore.prototype.getList = function (list, filter, arg3, arg4) {
  var callback, order, myFilter;
  if (typeof(arg4) == 'function') {
    callback = arg4;
    order = arg3;
  } else {
    callback = arg3;
  }
  if (!(list instanceof List)) throw new Error('argument must be a List');
  if (!(filter instanceof Object)) throw new Error('filter argument must be Object');
  if (typeof callback != "function") throw new Error('callback required');
  for (var i in filter)
    if (filter.hasOwnProperty(i)) {
      //console.log('before ' + i + ':' + filter[i] + '');
      if (filter[i] instanceof RegExp) {
        filter[i] = filter[i].toString();
        filter[i] = left(filter[i],filter[i].length-1);
        filter[i] = right(filter[i],filter[i].length-1);
        filter[i] = 'RegExp:' + filter[i];
      }
      //console.log('after ' + i + ':' + filter[i] + '');
    }
  this.transport.send(new Message('GetList', {list: list, filter: filter, order: order}), function (msg) {
    if (false && msg == 'Ack') { // todo wtf is this
      callback(list);
    } else if (msg.type == 'GetListAck') {
      list._items = msg.contents._items;
      list._itemIndex = msg.contents._itemIndex;
      callback(list);
    } else {
      callback(list, Error(msg));
    }
  });
};
