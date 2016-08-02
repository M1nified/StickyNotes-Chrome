'use strict';

var Store = {
  run: function run() {
    if (!this.runnning) {
      this.runnning = true;

      this.availabilityCheck();
    }
    this.updatePurchasedElements();
  },
  availabilityCheck: function availabilityCheck() {
    google.payments.inapp.getSkuDetails({
      'parameters': { 'env': 'prod' },
      'success': this.onSkuDetails.bind(this),
      'failure': this.onSkuDetailsFail.bind(this)
    });
  },
  setIsStoreOpen: function setIsStoreOpen(state) {
    chrome.storage.local.set({ isStoreOpen: state });
    this.availabilityCheckTimeout = setTimeout(this.availabilityCheck.bind(this), 30000);
  },
  onSkuDetails: function onSkuDetails(sku) {
    try {
      if (sku.response.details.inAppProducts.length > 0) {
        this.setIsStoreOpen(true);
      } else {
        this.setIsStoreOpen(false);
      }
    } catch (err) {
      this.setIsStoreOpen(false);
    }
  },
  onSkuDetailsFail: function onSkuDetailsFail(sku) {
    this.setIsStoreOpen(false);
  },
  updatePurchasedElements: function updatePurchasedElements() {
    google.payments.inapp.getPurchases({
      'parameters': { 'env': 'prod' },
      'success': this.onLicenseUpdate.bind(this),
      'failure': this.onLicenseUpdateFail.bind(this)
    });
  },
  onLicenseUpdate: function onLicenseUpdate(resp) {
    var prodsArr = resp.response.details;
    var appid = chrome.runtime.id.toString();
    var newlist = {};
    for (var i in prodsArr) {
      if (prodsArr[i].state !== "ACTIVE") {
        continue;
      }
      var sku = prodsArr[i].sku.split(appid + "_inapp").join("");
      newlist[sku] = true;
    }
    newlist.speech_to_text = true;
    chrome.storage.sync.set({ purchasedinapp: newlist });
  },
  onLicenseUpdateFail: function onLicenseUpdateFail(resp) {
    chrome.storage.sync.get('purchasedinapp', function (data) {
      var newlist = {};
      if (data && data.purchasedinapp) {
        newlist = data.purchasedinapp;
      }

      newlist.speech_to_text = true;
      chrome.storage.sync.set({ purchasedinapp: newlist });
    });
  }
};