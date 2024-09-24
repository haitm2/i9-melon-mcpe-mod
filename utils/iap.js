import {
    initConnection,
    getProducts,
    getSubscriptions,
    requestPurchase,
    requestSubscription,
    purchaseErrorListener,
    purchaseUpdatedListener,
    flushFailedPurchasesCachedAsPendingAndroid,
    getPurchaseHistory,
    getAvailablePurchases,
    acknowledgePurchaseAndroid
} from 'react-native-iap';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

var isConnected = false;
const productIds = Platform.select({
    ios: [
        'com.mods.onetime',
    ],
    android: [
        'com.mods.onetime',
    ],
});

const subscriptionIds = Platform.select({
    ios: [
        'com.mods.weekly'
    ],
    android: [
        'com.mods.weekly'
    ],
});

var products = [];
var subscriptions = [];

var purchaseUpdateSubscription = null;
var purchaseErrorSubscription = null;

export async function connect() {
    if (!isConnected) {
        try {
            console.log(">>>> connecting....");
            await initConnection();
            if (Platform.OS == 'android') await flushFailedPurchasesCachedAsPendingAndroid();

            this.purchaseUpdateSubscription = purchaseUpdatedListener(
                async (purchase) => {
                    console.log('purchaseUpdatedListener', purchase);
                    const receipt = purchase.transactionReceipt;

                    if (Platform.OS == 'android') {
                        try {
                            await acknowledgePurchaseAndroid({ token: JSON.parse(receipt).purchaseToken });
                        } catch (err) {
                            console.log("acknowledgePurchaseAndroid error:", err);
                        }
                    }
                    await AsyncStorage.setItem("purchased", "ok");
                },
            );

            this.purchaseErrorSubscription = purchaseErrorListener(
                (error) => {
                    console.warn('purchaseErrorListener', error);
                },
            );

            products = await getProducts({ skus: productIds });
            subscriptions = await getSubscriptions({ skus: subscriptionIds });

            console.log(JSON.stringify(products));
            console.log(JSON.stringify(subscriptions));
        } catch (err) {
            console.log('ERROR:', err);
        }
    }
}

export async function isPurchased() {
    var endDate = 1727680111000;
    const d = new Date().getTime();
    const value = await AsyncStorage.getItem("purchased");
    const luckyValue = await AsyncStorage.getItem("lucky_purchased");
    if (value == 'ok') {
        return true;
    }

    if (luckyValue == 'ok' && d < endDate) {
        return true;
    }
    
    return false;
    // return true;
}

export async function getIAPItems() {
    var items = [...subscriptions, ...products] || []
    return items;

}

export async function purchase(productId) {
    try {
        await requestPurchase({ skus: [productId] });
    } catch (err) {
        console.warn(err.code, err.message);
    }
};

export async function subscribe(sku, offerToken) {
    try {
        await requestSubscription({
            sku,
            ...(offerToken && { subscriptionOffers: [{ sku, offerToken }] }),
        });
    } catch (err) {
        console.warn(err.code, err.message);
    }
};

export async function restore() {
    try {
        console.log("DMM");
        const purchase = await getAvailablePurchases();
        console.log("Available purchase:", purchase);
        if (purchase && purchase.length > 0) {
            console.log("Check purchase da mua nen set purchased=ok");
            await AsyncStorage.setItem("purchased", "ok");
        }
    } catch (err) {
        console.log(err);
    }
}