  //Receives any message sent from other scripts
  chrome.runtime.onMessage.addListener(
      function(message, sender, callback) {
        if(message != undefined) {

          switch(message.message) {
            case "get_location":
              navigator.geolocation.getCurrentPosition (
                function (position) {
                    callback ( {coords: {latitude: position.coords.latitude, longitude: position.coords.longitude }} );
                },
                function (err){
                  console.warn(`ERROR(${err.code}): ${err.message}`);
                  callback(null, err);
                },
                {
                  timeout: 10000
                }
              );
              return true;
            break;

            case "get_config":
              
              var currentUTCTimeStamp = Math.floor((new Date()).getTime() / 1000);
              
              var sendConfig = function(obConfig){
                callback(obConfig); 
              }
              
              //Check if current config is expired
							chrome.storage.local.get(['obConfig'], function(result) {

                if(result && result.obConfig && result.obConfig.iat && (currentUTCTimeStamp - result.obConfig.iat) < 3600) {
                  sendConfig(result.obConfig);
                } else {

                  //Refresh the config
                  var httpRequest = new XMLHttpRequest();
                  httpRequest.onload = function () {
                      if(httpRequest.status == 200) {
                          console.log("Config: " + httpRequest.responseText);
    
                          var configResponse = JSON.parse(httpRequest.responseText);
                          var obConfig = configResponse.ob_config;

                          //set current time so that we can expire later
                          obConfig.iat = currentUTCTimeStamp;
                          
                          chrome.storage.local.set({"obConfig": obConfig});

                          sendConfig(obConfig);
                          
                      }
                  };
                  httpRequest.onerror = function(err) {
                      console.log(err)
                  };
                  httpRequest.open('GET', 'https://orm-proudction-functions.azurewebsites.net/api/orm_extension_configuration');
                  httpRequest.send();

                }

              });

              return true;
            break;
          }

        }
  });