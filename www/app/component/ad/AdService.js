'use strict';

var AdService = function() {
    var adMobId = {};
    var self = this;

    if (/(android)/i.test(navigator.userAgent)) {
        adMobId = {
            banner: 'ca-app-pub-8750831902188283/1445554059'
        };
    } else if (/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
    } else {
    }

    var created = false;

    var createBanner = function() {
        if (created) {
            return;
        }

        console.log('creating banner');

        AdMob.createBanner({
            adId: adMobId.banner,
            position: AdMob.AD_POSITION.BOTTOM_CENTER,
            autoShow: true
        });

        created = true;
    };

    var removeBanner = function() {
        if (!created) {
            return;
        }

        console.log('removing banner');

        AdMob.removeBanner();
        created = false;
    };

    this.init = function() {
        if (!packmule.Platform.isMobile()) {
            return;
        }

        store.verbosity = store.DEBUG;

        store.register({
            id: 'ads.removal',
            alias: 'ads',
            type: store.NON_CONSUMABLE
        });

        // when ads are bought (approved) - finish the transaction
        store.when('ads').approved(function(p) {
            p.finish();
        });

        // when ads are updated create/remove the ad banner
        // this can trigger multiple times so we have to be smart about double initialization
        store.when('ads').updated(function(p) {
            if (!store.ready()) {
                return;
            }

            if (p.owned) {
                removeBanner();
            } else {
                createBanner();
            }
        });

        store.refresh();
    };
};

angular
    .module('app.ad')
    .service('AdService', AdService);
