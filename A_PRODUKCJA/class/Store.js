'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Store = (function () {
  function Store() {
    _classCallCheck(this, Store);
  }

  _createClass(Store, null, [{
    key: 'run',
    value: function run() {
      if (!this.runnning) {
        this.runnning = true;
        console.log('MAKE ME SHOP');
        this.availabilityCheck();
      }
    }
  }, {
    key: 'availabilityCheck',
    value: function availabilityCheck() {
      google.payments.inapp.getSkuDetails({
        'parameters': { 'env': 'prod' },
        'success': this.onSkuDetails.bind(this),
        'failure': this.onSkuDetailsFail.bind(this)
      });
    }
  }, {
    key: 'setIsStoreOpen',
    value: function setIsStoreOpen(state) {
      chrome.storage.local.set({ isStoreOpen: state });
      this.availabilityCheckTimeout = setTimeout(function () {
        this.availabilityCheck();
      }, 30000);
    }
  }, {
    key: 'onSkuDetails',
    value: function onSkuDetails(sku) {
      try {
        if (sku.response.details.inAppProducts.length > 0) {
          this.setIsStoreOpen(true);
        } else {
          this.setIsStoreOpen(false);
        }
      } catch (err) {
        this.setIsStoreOpen(false);
      }
    }
  }, {
    key: 'onSkuDetailsFail',
    value: function onSkuDetailsFail(sku) {
      this.setIsStoreOpen(false);
    }
  }, {
    key: 'updatePurchasedElements',
    value: function updatePurchasedElements() {
      google.payments.inapp.getPurchases({
        'parameters': { 'env': 'prod' },
        'success': this.onLicenseUpdate.bind(this),
        'failure': this.onLicenseUpdateFail.bind(this)
      });
    }
  }, {
    key: 'onLicenseUpdate',
    value: function onLicenseUpdate(resp) {
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
    }
  }, {
    key: 'onLicenseUpdateFail',
    value: function onLicenseUpdateFail(resp) {
      chrome.storage.sync.get('purchasedinapp', function (data) {
        var newlist = {};
        if (data && data.purchasedinapp) {
          newlist = data.purchasedinapp;
        }
        newlist.speech_to_text = true;
        chrome.storage.sync.set({ purchasedinapp: newlist });
      });
    }
  }]);

  return Store;
})();