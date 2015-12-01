$(function(){
	getAllItems();
	getPurchases();
	
	$(".tabbutton").on("click",function(){
		$(".tabbutton").removeClass("tabcurrent");
		$(".tabcontent").removeClass("tabcontenton");
		var tab = $(this).addClass("tabcurrent").data("for");
		$(".tabcontent#"+tab).addClass("tabcontenton")
	});
})
var getAllItems = function(){
	google.payments.inapp.getSkuDetails({
		'parameters':{'env':'prod'},
		'success':onSkuDetails,
		'failure':onSkuDetailsFail
	})
}
var onSkuDetails = function(sku){
	console.log(sku);
	var prodsArr = sku.response.details.inAppProducts;
	displayShop(prodsArr);
}
var onSkuDetailsFail = function(sku){
	console.log(sku);
}
var displayShop = function(products){
	if(products.length > 0){
		$("#available").empty().append('<ul class="itemlist"></ul>');
	}
	for(var i in products){
		if(url("#bgcolors")!==undefined && /^color_background_.+/.test(products[i].sku)===false){
			continue;//bo to nie kolor tla, wiec pomijamy przy prosbie o wyswietlenie tylko kolorow tla
		}
		if(inAppProducts[products[i].sku] === undefined){//w osobnym, bo to trzeba jakos inaczej obslugiwac
			continue;
		}
		$("#available>ul.itemlist").append('<li><div class="leftbox"><h2>'+inAppProducts[products[i].sku].title+"</h2><p>"+inAppProducts[products[i].sku].description+'</p></div><div class="rightbox"><button class="purchasebutton buy" data-sku="'+products[i].sku+'">Buy</button></div></li>');
	}
}
var getPurchases = function(){
	google.payments.inapp.getPurchases({
		'parameters': {'env': 'prod'},
		'success': onLicenseUpdate,
		'failure': onLicenseUpdateFail
	});
}
var onLicenseUpdate = function(resp){
	console.log(resp);
	var prodsArr = resp.response.details;
	displayPurchases(prodsArr);
}
var onLicenseUpdateFail = function(resp){
	console.log(resp);
}
var displayPurchases = function(products){
	if(products.length > 0){
		$("#purchased").empty().append('<ul class="itemlist"></ul>');
	}
	for(var i in products){
		if(products[i].state!=="ACTIVE"){
			continue;
		}
		if(inAppProducts[products[i].sku] === undefined){//w osobnym, bo to trzeba jakos inaczej obslugiwac
			continue;
		}
		$("#purchased>ul.itemlist").append('<li><div class="leftbox"><h2>'+inAppProducts[products[i].sku].title+"</h2><p>"+inAppProducts[products[i].sku].description+'</p></div><div class="rightbox"><button class="purchasebutton owned" data-sku="'+products[i].sku+'">Owned</button></div></li>');
	}
}

//LISTENERS
$(document).on('click',"button.purchasebutton.buy",function(evt){
	var sku = $(this).data("sku");
	google.payments.inapp.buy({
		'parameters': {'env': 'prod'},
		'sku': sku,
		'success': onBuySuccess,
		'failure': onBuyFailure
	});
})
var onBuySuccess = function(resp){
	chrome.storage.sync.get("purchasedinapp",function(data){
		if(data && data.purchasedinapp === undefined){
			data.purchasedinapp={};
		}
		items = data.purchasedinapp;
		var bought = resp.request.contents.line_item;
		var appid = chrome.runtime.id.toString();
		for(var i in bought){
			var item = bought[i];
			var sku = item.sku.split(appid+"_inapp").join("");
			items[sku] = true;
		}
		chrome.storage.sync.set({purchasedinapp:items});
	})
}
var onBuyFailure = function(resp){
	
}