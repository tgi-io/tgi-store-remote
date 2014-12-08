# tgi-store-remote

RemoteStore [read the spec](spec/README.md).


    self.socket.on('connect_error', function (reason) {
      var theError = 'connect error to ' + self.location + (reason ? ', reason ' + reason : '');
      console.error(theError);
      // If have not ever connected then signal error
      if (self.initialConnect) {
        callBack.call(self, new Message('Error', theError));
      }
    });
