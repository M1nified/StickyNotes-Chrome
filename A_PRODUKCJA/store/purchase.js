"use strict";

$(function () {
	getAllItems();
	getPurchases();

	$(".tabbutton").on("click", function () {
		$(".tabbutton").removeClass("tabcurrent");
		$(".tabcontent").removeClass("tabcontenton");
		var tab = $(this).addClass("tabcurrent").data("for");
		$(".tabcontent#" + tab).addClass("tabcontenton");
	});
	$(".showcountrysupport").on("click", function () {
		$("#countrysupport").fadeIn(300);
	});
});
var getAllItems = function getAllItems() {
	google.payments.inapp.getSkuDetails({
		'parameters': { 'env': 'prod' },
		'success': onSkuDetails,
		'failure': onSkuDetailsFail
	});
};
var onSkuDetails = function onSkuDetails(sku) {
	console.log(sku);
	var prodsArr = sku.response.details.inAppProducts;
	displayShop(prodsArr);
};
var onSkuDetailsFail = function onSkuDetailsFail(sku) {
	console.log(sku);
};
var displayShop = function displayShop(products) {
	if (products.length > 0) {
		$("#available").empty().removeClass("init").append('<ul class="itemlist"></ul>');
		$("#countrysupport").hide();
	}
	for (var i in products) {
		if (url("#bgcolors") !== undefined && /^color_background_.+/.test(products[i].sku) === false && products[i].sku !== "color_palette_background" && /^color_box_background_.+/.test(products[i].sku) === false) {
			continue;
		}
		if (inAppProducts[products[i].sku] === undefined) {
			continue;
		}
		var price = parseInt(products[i].prices[0].valueMicros);
		var a = Math.floor(price / 1000000);
		var b = price % 1000000 / 10000;
		b = b < 10 ? "0" + b : b;
		price = a + '.' + b + ' ' + products[i].prices[0].currencyCode;
		$("#available>ul.itemlist").append('<li><table><tr><td><h2>' + inAppProducts[products[i].sku].title + "</h2><p>" + inAppProducts[products[i].sku].description + '</p></td><td class="price">' + price + '</td><td class="purchasebutton buy" data-sku="' + products[i].sku + '">&nbsp;</td></tr></table></li>');
	}
};
var getPurchases = function getPurchases() {
	google.payments.inapp.getPurchases({
		'parameters': { 'env': 'prod' },
		'success': onLicenseUpdate,
		'failure': onLicenseUpdateFail
	});
};
var onLicenseUpdate = function onLicenseUpdate(resp) {
	console.log(resp);
	var prodsArr = resp.response.details;
	displayPurchases(prodsArr);
};
var onLicenseUpdateFail = function onLicenseUpdateFail(resp) {
	console.log(resp);
};
var displayPurchases = function displayPurchases(products) {
	if (products.length > 0) {
		$("#purchased").empty().removeClass("init").append('<ul class="itemlist"></ul>');
	}
	for (var i in products) {
		if (products[i].state !== "ACTIVE") {
			continue;
		}
		if (inAppProducts[products[i].sku] === undefined) {
			continue;
		}
		$("#purchased>ul.itemlist").append('<li><table><tr><td><h2>' + inAppProducts[products[i].sku].title + "</h2><p>" + inAppProducts[products[i].sku].description + '</p></td><td class="purchasebutton owned" data-sku="' + products[i].sku + '">&nbsp;</td></tr></table></li>');
	}
};

$(document).on('click', ".purchasebutton.buy", function (evt) {
	var sku = $(this).data("sku");
	google.payments.inapp.buy({
		'parameters': { 'env': 'prod' },
		'sku': sku,
		'success': onBuySuccess,
		'failure': onBuyFailure
	});
});
var onBuySuccess = function onBuySuccess(resp) {
	chrome.storage.sync.get("purchasedinapp", function (data) {
		if (data && data.purchasedinapp === undefined) {
			data.purchasedinapp = {};
		}
		items = data.purchasedinapp;
		var bought = resp.request.contents.line_item;
		var appid = chrome.runtime.id.toString();
		for (var i in bought) {
			var item = bought[i];
			var sku = item.sku.split(appid + "_inapp").join("");
			items[sku] = true;
		}
		chrome.storage.sync.set({ purchasedinapp: items });
	});
};
var onBuyFailure = function onBuyFailure(resp) {};