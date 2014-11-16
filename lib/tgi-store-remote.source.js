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
    canGetModel: false,
    canPutModel: false,
    canDeleteModel: false,
    canGetList: false
  };
  var unusedProperties = getInvalidProperties(args, ['name', 'storeType']);
  var errorList = [];
  for (var i = 0; i < unusedProperties.length; i++) errorList.push('invalid property: ' + unusedProperties[i]);
  if (errorList.length > 1) throw new Error('error creating Store: multiple errors');
  if (errorList.length) throw new Error('error creating Store: ' + errorList[0]);
};
RemoteStore.prototype = Object.create(Store.prototype);
/**
 * Methods
 */
RemoteStore.prototype.onConnect = function (location, callBack, options) {
  if (typeof location != 'string') throw new Error('argument must a url string');
  if (typeof callBack != 'function') throw new Error('argument must a callback');
  callBack(this, undefined);
};
RemoteStore.prototype.getModel = function (model, callBack) {
  throw new Error(this.storeType + ' does not provide getModel');
};
RemoteStore.prototype.putModel = function (model, callBack) {
  throw new Error('Store does not provide putModel');
};
RemoteStore.prototype.deleteModel = function (model, callBack) {
  throw new Error('Store does not provide deleteModel');
};
RemoteStore.prototype.getList = function (list, filter, arg3, arg4) {
  throw new Error('Store does not provide getList');
};
