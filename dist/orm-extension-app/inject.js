//Poll for URL changes
var oldURL = window.location.href;
var checkURLchange = setInterval(function() {

    if(window.location.href != oldURL){
		bootstrap();
        oldURL = window.location.href;
    }

}, 1000);

//Ensure ready state before bootstrap
var readyStateCheckInterval = setInterval(function() {
	
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);
		bootstrap();
	}

}, 500);

function init(title){
		
	chrome.storage.local.get(['userTabY'], function(saveduUerTabY) {

		chrome.runtime.sendMessage ({message: "get_location"}, function (position, err) {

			var dispatchResponse = {
				userTabYsavedPosition: saveduUerTabY.userTabY,
				title: title
			};

			if(err){
				//Handle location error

				//failed to get location, send saved one if avail
				chrome.storage.local.get(['userPosition'], function(savedPosition) {
					
					if(savedPosition && savedPosition.userPosition){

						dispatchResponse.userPosition = savedPosition.userPosition;
						
					}

				});

			} else if(position) {
				//Have have the location

				var userPosition = {lat: position.coords.latitude, lon: position.coords.longitude};

				dispatchResponse.userPosition = userPosition;
				
				//Store user location in case next request fails
				chrome.storage.local.set({"userPosition": userPosition});

			}

			document.dispatchEvent(new CustomEvent('user_details', {detail: JSON.stringify(dispatchResponse)}));
			
		});
		
	});
}

function getSchemaOrgTitle(cb) {
	
	let title;

	let checkCount = 0;
	var checkJSONld = setInterval(()=>{
		checkCount++;
console.log("checking JSONld");
		document.querySelectorAll("[type='application/ld+json']").forEach(function(el){
			let jsonData = JSON.parse(el.innerText);
		
			if(Array.isArray(jsonData) && jsonData[0]) {
				jsonData = jsonData[0]
			}
			
			if(jsonData["@type"] == "Product" && jsonData["name"]) {
				title = jsonData.name;
			}
			
		});
	
		if(title){
			clearInterval(checkJSONld);
			return cb(title);
		}
		else if(checkCount > 10){
			clearInterval(checkJSONld);
			return cb();
		}

	}, 1000);

}

function getWhitelistTitle(obConfig, host, href, cb) {
	
	let thisObConfig = obConfig[host];
	let title;

	if(thisObConfig) {

		var urlMatch = thisObConfig.url_regex.find(function(url_regex){
			var urlTest = new RegExp(url_regex);
			return urlTest.test(href);
		});
	
		if(urlMatch && urlMatch.length > 0){

			let config = thisObConfig;
			
			let checkCount = 0;
			var checkTitleEl = setInterval(()=>{
				checkCount++;

				config.selectors.title.forEach(selector => {
					var titleEl = document.querySelector(selector);
					if(titleEl){
						title = titleEl.innerText;
					}
				});
				
				if(title){
					clearInterval(checkTitleEl);
					return cb(title);
				}
				else if(checkCount > 10){
					clearInterval(checkTitleEl);
					return cb();
				}
			}, 1000);
		
		} else {
			return cb();
		}
		  
	} else {
		return cb();
	}

}

function start(title) {

	let extEl = document.querySelector("orm-extension");
	if(title){
		
		//Ensure ORM extension is present
		if(extEl){
			extEl.style.display = "block";
			init(title);
		} else {
			//Embed ORM extension if not already done

			var el = document.createElement( 'orm-extension' );
			document.body.appendChild( el );
			
			setTimeout(function() {
			
				var s = document.createElement( 'script' );
				s.setAttribute( 'src', chrome.runtime.getURL("polyfills.js"));
				document.body.appendChild( s );
				
				var s = document.createElement( 'script' );
				s.setAttribute( 'src', chrome.runtime.getURL("main.js") );
				document.body.appendChild( s );

				this.document.addEventListener('orm_tab_y_change', function(event) {
					chrome.storage.local.set({"userTabY": event.detail});
				});
			
				this.document.addEventListener('orm_angular_ready', function(event) {

					init(title);
					
				});

			}, 200);
		}
	} else {
		if(extEl) extEl.style.display = "none";
	}
}

function bootstrap(){

	chrome.runtime.sendMessage ({message: "get_config"}, function (globalConfig) {
		//First try whitelist
		getWhitelistTitle(globalConfig, window.location.host, window.location.href, function(title) {

			if(title) {
				start(title);
			} else {
				getSchemaOrgTitle(function(title) {
					if(title) {
						start(title);
					}
				});
			}

		});
	});

}