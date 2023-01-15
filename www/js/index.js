//2023 cozycode.ca (c) MIT cordova-plugin-inapppurchases

//Enter product ids for testing here:
var product_id_1 = "";
//disable logging 
var enable_logging = true;
var enable_alert_logging = true;
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

/* (c) cozycode.ca */
function loadAppPurchases(){
    var productIds = [product_id_1];
    inAppPurchases.getAllProductInfo(productIds).then( function (products) {
        //handle
        for (var i=0; i<products.length; i++){
            if (products[i]["productId"] == product_id_1){
                //show the price that was set in the stores
                var buy_amount_elem = document.getElementById("buy_button");
                buy_amount_elem.value = "buy for "+products[i].price;
            }
        }
        return inAppPurchases.restorePurchases();
    }).then( function(purchases){
        //restore bought purchases
        for (var i=0; i<purchases.length; i++){
            if (purchases[i]["productId"] == product_id_1){
                //bought product_id_1
                if (purchases[i]["pending"]) continue;
                if (!purchases[i]["completed"]) inAppPurchase.completePurchase(purchases[i]["productId"]);
                givePaidContent();
            }
        }
    }).catch( function(err) {
        //console.log("price won't be updated, try again later if connection issue or debug error" + JSON.stringify(err));
        setTimeout(loadAppPurchases,1000);
        logError(err);
        if (enable_logging && enable_alert_logging) enable_alert_logging = !confirm("Stop displaying error messages?");
    });
}
function onRestoreButtonPressOrUpdate(){
    inAppPurchases.restorePurchases().then( function(purchases){
        for (var i=0; i<purchases.length; i++){
            if (purchases[i]["pending"]) continue;
            if (!purchases[i]["completed"]) inAppPurchase.completePurchase(purchases[i]["productId"]);
            // handle purchases:
            if (purchases[i]["productId"] == product_id_1){
                if (!checkPaidContent()) alert("restored purchase");
                givePaidContent();
            }
        }
        if (purchases.length == 0) alert("nothing to restore");
    }).catch (function(err){
        alert("could not restore purchases");
        logError(err);
        // view or handle billing or api error messages
    });
}
function buyPaidContent(){
    inAppPurchases.purchase(product_id_1).then( function(purchase){
        if (purchase[i]["pending"]){
            alert("waiting for payment to complete");
            return; //not paid for yet
        }
        // handle purchase here, or after its been completed:
        givePaidContent();
        return inAppPurchase.completePurchase(purchase["productId"]);
    }).then(function(purchase){
        // purchase is acknowledged and consumed
    }).catch (function(err){
        if (!checkGavePaidContent()) alert("Could not purchase");
        logError(err);
    });
}
function givePaidContent(){
    if (checkGavePaidContent()) return;
    var buy_elem = document.getElementById("buy_section");
    if (!buy_elem){ alert("missing page element buy"); return; }
    var paid_section = document.createElement("div");
    paid_section.id = "paid_app_section";
    paid_section.innerHTML = '<div id="paid_app_section"><h2>Purchased the In-App Purchase/          Subscription</h2><p>Paid content is now here</p></div>';
    buy_elem.parentElement.insertBefore(paid_section,buy_elem);
    buy_elem.parentElement.removeChild(buy_elem);
}
function checkGavePaidContent(){
    return document.getElementById("paid_app_section");
}
function logError(err){
    if (!enable_logging) return; 
    if (enable_alert_logging) alert(JSON.stringify(err));
    else console.log(JSON.stringify(err));
}
//start demo
function startInAppPurchasesDemo(){
    if (product_id_1){
        var inf = document.getElementById("enter_products");
        if (inf) inf.parentElement.removeChild(inf);
    }
    var purchase = document.getElementById("buy_button");
    if (!purchase){ alert("missing page element buy"); }
    purchase.onclick = buyPaidContent;
    var restore = document.getElementById("restore_button");
    if (!restore){ alert("missing page element restore"); }
    restore.onclick = onRestoreButtonPressOrUpdate;
    //called from onDeviceReady
    loadAppPurchases();
    //onResume
    document.addEventListener('resume', onRestoreButtonPressOrUpdate, false);
}
function onDeviceReady() {
    // Cordova is now initialized. Have fun!
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById('deviceready').classList.add('ready');

    // add event listeners for buttons
    startInAppPurchasesDemo();
}
