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
 * Helper function
 */
RemoteStore.stripModel = function (model) {
  //console.log('STRIP: ' + model);
  var newModel = {};
  for (var m in model) {
    if (model.hasOwnProperty(m)) {
      if (m == 'modelType') {
        newModel[m] = model[m];
        //console.log('m ' + m);
      }
      else if (m == 'attributes') {
        var attributes = model[m];
        var newAttributes = [];
        for (var a in attributes) {
          if (attributes.hasOwnProperty(a)) {
            var attribute = attributes[a];
            var newAttribute = {};
            newAttribute.name = attribute.name;
            newAttribute.type = attribute.type;
            newAttribute.value = attribute.value;
            newAttributes.push(newAttribute);
          }
        }
        newModel[m] = newAttributes;
        //console.log('newAttributes ' + newAttributes);
      }
    }
  }
  return newModel;
};

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
  this.transport.send(new Message('GetModel', RemoteStore.stripModel(model)), function (msg) {
    if (msg.type == 'GetModelAck') {
      if (typeof msg.contents == 'string') {
        callback(model, msg.contents);
        return;
      }
      var newAttributes = msg.contents.attributes;
      for (var i = 0; i < model.attributes.length; i++) {
        var attribute = model.attributes[i];
        var name = model.attributes[i].name;
        var gotOne = false;
        for (var j = 0; j < newAttributes.length; j++) {
          var newAttribute = newAttributes[j];
          var name2 = newAttribute.name;
          if (name2 == name) {
            if (newAttribute.value === undefined || newAttribute.value === null) {
              attribute.value = null;
            } else if (attribute.type == 'Date') {
              try {
                attribute.value = new Date(newAttribute.value);
              } catch (e) {
                attribute.value = null;
              }
            } else {
              attribute.value = newAttribute.value;
            }
            gotOne = true;
          }
          if (!gotOne)
            attribute.value = null;
        }
        //console.log('!!! GetModel attribute: ' + attribute);
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
  this.transport.send(new Message('PutModel', RemoteStore.stripModel(model)), function (msg) {
    if (false && msg == 'Ack') { // todo wtf is this
      callback(model);
    } else if (msg.type == 'PutModelAck') {
      var contents = msg.contents;
      //for (var b in model.attributes) {
      //  if (model.attributes[b].type == 'Model') {
      //    console.log('value before ' + JSON.stringify(model.attributes[b].value));
      //  }
      //}
      model.attributes = [];
      for (var a in contents.attributes) {
        if (contents.attributes.hasOwnProperty(a)) {
          var attrib;
          if (contents.attributes[a].type == 'Model') {

            var sourceModel = createModelFromModelType(contents.attributes[a].modelType);
            var modelID = new Attribute.ModelID(sourceModel);

            modelID.value = contents.attributes[a].value.value;
            if (contents.attributes[a].value.name)
              modelID.name = contents.attributes[a].value.name;


            //  var v = new Attribute.ModelID(new Model());
            //  v.value = c.attributes[a].value;
            //  attrib = new Attribute({name:c.attributes[a].name, type:'Model',value:v});

            attrib = new Attribute({
              name: contents.attributes[a].name,
              type: contents.attributes[a].type,
              value: modelID
            });

            //attrib = new Attribute(c.attributes[a].name, c.attributes[a].type);
            //attrib.value = c.attributes[a].value;

            //console.log('modelID ' + JSON.stringify(modelID));
            //console.log('contents    ' + JSON.stringify(contents.attributes[a].value));
            //console.log('value after ' + JSON.stringify(attrib.value));

          } else {
            attrib = new Attribute(contents.attributes[a].name, contents.attributes[a].type);
            attrib.value = contents.attributes[a].value;
          }
          model.attributes.push(attrib);
        }
      }

      if (typeof contents == 'string')
        callback(model, contents);
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
  this.transport.send(new Message('DeleteModel', RemoteStore.stripModel(model)), function (msg) {
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
      //console.log('RemoteStore: before ' + i + ':' + filter[i] + '');
      if (filter[i] instanceof RegExp) {
        filter[i] = filter[i].source;
        filter[i] = 'RegExp:' + filter[i];
      }
      //console.log('RemoteStore: after ' + i + ':' + filter[i] + '');
    }
  var newList = {};
  var strippedModel = RemoteStore.stripModel(list.model);
  newList._itemIndex = list._itemIndex;
  newList._items = list._items;
  newList.model = strippedModel;
  newList.attributes = strippedModel.attributes;
  this.transport.send(new Message('GetList', {list: newList, filter: filter, order: order}), function (msg) {
    if (false && msg == 'Ack') { // todo wtf is this
      callback(list);
    } else if (msg.type == 'GetListAck') {
      list._items = msg.contents._items;
      list._itemIndex = msg.contents._itemIndex;
      //console.log('GetListAck..............');
      //console.log(JSON.stringify(list));
      callback(list);
    } else {
      callback(list, Error(msg));
    }
  });
};
