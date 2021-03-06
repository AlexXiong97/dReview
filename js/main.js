// Start of main.js module
var bc = require('./blockchainConnector.js');
const $ = require('jquery');
window.addEventListener("load", start);

// $(document).ready(function(){
// 	$('#submitButton_2').click(function(){
// 		// alert('New Review Submitted!');
// 		console.log('hi');
// 		var content = document.getElementById("content").value;
// 		var score = document.getElementById("score").value;
// 		console.log(content+score);
// 		// console.log(content, score);
// 		// bc.submitReview(storeId, content, score,function(){
// 		// 	console.log('success!')
// 		// });
// 	});
// });


var storeName;
var storeId;
function start(){
	// function in blockchainConnector;
	console.log("searching...");
	getCurrentTabUrl(display);
}

function submitNewReview(){
	var content = document.getElementById("content").value;
	var score = document.getElementById("score").value;
	document.getElementById('submitButton').style.display = "none";
	document.getElementById('newReview').style.display = "none";
	document.getElementById('feedback-msg').innerHTML = `
	<div class='alert alert-success' style='margin: 0px 70px 10px 0px; height:30px;padding:0px'>
	<p style='font-size:17px; text-align:center; vertical-align:center;'>Review Pending... </p>
	</div>
	`;
	bc.submitReview(storeId, content, score, function(){
		setTimeout(function(){
			start();
		}, 10000);
	});
	// function in blockchainConnector;
}

function display(){
	console.log("In display function: " + storeId);

	// check if store exists

	bc.storeExist(storeId, function(result){
		if (result){
			document.getElementById("storeName").innerHTML = storeName;
			document.getElementById('reviewArea').style.display='block';
			document.getElementById("score").value = "";
			document.getElementById("content").value = "";
			document.getElementById("newReview").style.display = "block";
			document.getElementById('submitButton').style.display = "block";
			document.getElementById('submitButton').addEventListener('click', submitNewReview);
	
			// get blockchain data

			bc.readReviews(storeId, function(reviews){
				// console.log(reviews);
				if (reviews.length == 0){
					document.getElementById("noReview").style.display = "block";
					return;
				} else{
					document.getElementById("noReview").style.display = "none";
					console.log("displaying reviews...");
					// console.log(reviews);
					var tbody = document.getElementById("reviews");
					while(tbody.hasChildNodes()){
						tbody.removeChild(tbody.lastChild);
					}
					var td;
					var node;
					for (var i=0; i<reviews.length; i++){
						var tr = document.createElement("tr");
						// indexing
						td = document.createElement("td");
						node = document.createTextNode(i+1);
						td.appendChild(node);
						tr.appendChild(td);
						// reviewer
						td = document.createElement("td");
						node = document.createTextNode(reviews[i].reviewer.slice(0,6)+'..'+reviews[i].reviewer.slice(-4));
						td.appendChild(node);
						tr.appendChild(td);
						// content
						td = document.createElement("td");
						node = document.createTextNode(reviews[i].comment);
						td.appendChild(node);
						tr.appendChild(td);
						// score
						td = document.createElement("td");
						node = document.createTextNode(reviews[i].score);
						td.appendChild(node);
						tr.appendChild(td);
						tbody.appendChild(tr);
					}
					return;
				}
			});
			
			bc.readOverallScore(storeId, function(overall_score){
				document.getElementById("storeScore").innerHTML = overall_score;
			});

		} else {
			document.getElementById("createStore").style.display = "block";
			document.getElementById("createStore").addEventListener('click',createStoreWrapper);
		}
	});// End of storeExist RPC call
}


function createStoreWrapper(){
	document.getElementById('createStore').style.display = "none";
	bc.createStore(storeId, function(){
		document.getElementById('feedback-msg').innerHTML = `
		<div class='alert alert-warning' style='margin: 0px 70px 10px 0px; height:30px;padding:0px'>
		<p style='font-size:17px; text-align:center; vertical-align:center;'>Creating Store ... </p>
		</div>
		`;
		var refreshCheck = setInterval(function(){
			bc.storeExist(storeId, function(is_exist){
				console.log("waiting...");
				if (is_exist){
					console.log("created!");
					start();
					// document.getElementById('feedback-msg').innerHTML = `
					// <div class='alert alert-success' style='margin: 0px 70px 10px 0px; height:30px;padding:0px'>
					// <p style='font-size:17px; text-align:center; vertical-align:center;'>Store Created! </p>
					// </div>
					// `;
					clearInterval(refreshCheck);
				}
			});	
		}, 1000);
	});
}

function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

	if (bc.web3IsConnected()){
		document.getElementById('feedback-msg').innerHTML = `
		<div class='alert alert-success' style='margin: 0px 70px 10px 0px; height:30px;padding:0px'>
		<p style='font-size:17px; text-align:center; vertical-align:center;'>Successfully connected to Blockchain!</p>
		</div>
		`;

		if (getStoreFromUrl(url)){
			document.getElementById("storeName").innerHTML = "Searching for "+storeName+" on Blockchain";
			document.getElementById("switchAccount").style.display = "block";
	    	callback();
	    } else {
	    	document.getElementById('feedback-msg').innerHTML = `
			<div class='alert alert-warning' style='margin: 0px 70px 10px 0px; height:30px;padding:0px'>
			<p style='font-size:17px; text-align:center; vertical-align:center;'>Please select a store on Google map!</p>
			</div>
			`;
	    }
	}
	else{
		document.getElementById('feedback-msg').innerHTML = `
		<div class='alert alert-warning' style='margin: 0px 70px 10px 0px; height:30px;padding:0px'>
		<p style='font-size:17px; text-align:center; vertical-align:center;'>Not connected to Blockchain!</p>
		</div>
		`;
	}
    
  });
}

function getStoreFromUrl(url){
	if (url.match("https://www.google.com.sg/maps/place/")){
		var results = url.split("/");
		storeName = decodeURIComponent(results[5].split('+').join(' '));
		var storeLatLng = results[7].split('!');
		// remove possible ?hl=en at the end of URL
		storeId = results[5].split('+').join('') + "--" + storeLatLng[storeLatLng.length - 2].slice(2).match(/[0-9]+\.[0-9]{3}/g) + "--" + storeLatLng[storeLatLng.length - 1].slice(2).match(/[0-9]+\.[0-9]{3}/g);
		return true;
	} else {
		return false;
	}
}
// End of main.js module

