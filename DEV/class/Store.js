'use strict';
class Store {
  static run(){
    if(!this.runnning){
      this.runnning = true;
      console.log('MAKE ME SHOP');
      this.availabilityCheck();
    }
  }
  static availabilityCheck(){
  	//console.log("CHECK")
  	/*if(!navigator.onLine){
  		setIsStoreOpen(false);
  		setTimeout(function(){availabilityCheck();},1000);
  		return;
  	}*/
  	google.payments.inapp.getSkuDetails({
  		'parameters':{'env':'prod'},
  		'success':this.onSkuDetails.bind(this),
  		'failure':this.onSkuDetailsFail.bind(this)
  	})
  }
  static setIsStoreOpen(state){
  	chrome.storage.local.set({isStoreOpen:state});
  	this.availabilityCheckTimeout = setTimeout(this.availabilityCheck.bind(this),30000);
  }
  static onSkuDetails(sku){
  	try{
  		if(sku.response.details.inAppProducts.length>0){
  			this.setIsStoreOpen(true);
  		}else{
  			this.setIsStoreOpen(false);
  		}
  	}catch(err){
  		this.setIsStoreOpen(false);
  	}
  }
  static onSkuDetailsFail(sku){
  	this.setIsStoreOpen(false);
  }
  static updatePurchasedElements(){
  	google.payments.inapp.getPurchases({
  		'parameters': {'env': 'prod'},
  		'success': this.onLicenseUpdate.bind(this),
  		'failure': this.onLicenseUpdateFail.bind(this)
  	});
  }
  static onLicenseUpdate(resp){
    var prodsArr = resp.response.details;
  	var appid = chrome.runtime.id.toString();
  	var newlist = {};
  	for(var i in prodsArr){
  		if(prodsArr[i].state!=="ACTIVE"){
  			continue;
  		}
  		var sku = prodsArr[i].sku.split(appid+"_inapp").join("");
  		newlist[sku]=true;
  	}
  	newlist.speech_to_text = true;//TYMCZASOWE DARMOWE ROZPOZNAWANIE MOWY
  	chrome.storage.sync.set({purchasedinapp:newlist});
  }
  static onLicenseUpdateFail(resp){
  	//console.log(resp);
  	chrome.storage.sync.get('purchasedinapp',function(data){
  		var newlist = {};
  		if(data && data.purchasedinapp){
  			newlist = data.purchasedinapp;
  		}
      //TYMCZASOWE DARMOWE ROZPOZNAWANIE MOWY
  		newlist.speech_to_text = true;
  		chrome.storage.sync.set({purchasedinapp:newlist});
  	})
  }
}
