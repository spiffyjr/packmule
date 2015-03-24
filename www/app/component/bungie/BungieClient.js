var BungieClient = function($rootScope, $q, cordovaHTTP, AuthService) {
    var BUNGIE_BASE_URL = 'https://www.bungie.net/Platform/';

    var EP_ACCOUNT = 'Destiny/{mtype}/Account/{mid}/?definitions={d}';
    var EP_BUNGIE_NET_USER = 'User/GetBungieNetUser/';
    var EP_CHARACTER_INVENTORY = 'Destiny/{mtype}/Account/{mid}/Character/{cid}/Inventory/?definitions={d}';
    var EP_EQUIP_ITEM = 'Destiny/EquipItem/';
    var EP_MEMBERSHIP_IDS = 'User/GetMembershipIds/?excludebungienet=true';
    var EP_TRANSFER_ITEM = 'Destiny/TransferItem/';
    var EP_VAULT = 'Destiny/{mtype}/MyAccount/Vault/?definitions={d}';

    var requestCount = 0;

    var buildUrl = function(endpoint, endpointParams) {
        var url = BUNGIE_BASE_URL + endpoint;

        _.forEach(endpointParams, function(value, key) {
            if (key == 'd') {
                value = value ? 'true' : 'false';
            }
            url = url.replace('{' + key + '}', value);
        });

        return url;
    };

    var request = function(method, endpoint, endpointParams, data) {
        var start = function() {
            if (requestCount == 0) {
                $rootScope.$broadcast('BungieClient:requestStart');
            }

            requestCount++;
        };

        var finish = function() {
            requestCount--;

            if (requestCount == 0) {
                $rootScope.$broadcast('BungieClient:requestEnd');
            }
        };

        var send = function(cookie) {
            var url = buildUrl(endpoint, endpointParams);
            var headers = {
                'content-type': 'application/json',
                'x-requested-with': 'XMLHttpRequest',
                'x-csrf': AuthService.getCsrf()
            };

            // Required for Android
            if (cookie) {
                headers.cookie = cookie;
            }

            if (!data) {
                data = {};
            }

            console.log('sending request: ' + url);
            console.log('method: ' + method);
            console.log('headers: ' + JSON.stringify(headers));
            console.log('data: ' + JSON.stringify(data));

            return $q(function(resolve, reject) {
                start();

                switch(method.toLowerCase()) {
                    case 'get':
                        cordovaHTTP
                            .get(url, data, headers)
                            .then(function(response) {
                                finish();
                                response = JSON.parse(response.data);

                                console.log(response);

                                if (response.ErrorCode == 1) {
                                    resolve(response.Response);
                                    return;
                                }
                                reject(response);
                            }, function(response) {
                                finish();
                                console.log(response);
                                reject(response);
                            });
                        break;
                }
            });
        };

        if (packmule.Platform.isMobile()) {
            return $q(function(resolve, reject) {
                packmule.Cookies.get('https://www.bungie.net', function(cookie) {
                    send(cookie).then(resolve, reject);
                });
            });
        } else {
            return send();
        }
    };

    this.equipItem = function(data) {
        return request('POST', EP_EQUIP_ITEM, null, data);
    };

    this.transferItem = function(data) {
        return request('POST', EP_TRANSFER_ITEM, null, data);
    };

    this.findBungieNetUser = function() {
        return request('GET', EP_BUNGIE_NET_USER);
    };

    this.findMembershipIds = function() {
        return request('GET', EP_MEMBERSHIP_IDS);
    };

    this.findAccount = function(mtype, mid, d) {
        return request('GET', EP_ACCOUNT, {mtype: mtype, mid: mid, d: d});
    };

    this.findVault = function(mtype, d) {
        return request('GET', EP_VAULT, {mtype: mtype, d: d});
    };

    this.findCharacterInventory = function(mtype, mid, cid, d) {
        return request('GET', EP_CHARACTER_INVENTORY, {mtype: mtype, mid: mid, cid: cid, d: d})
    };
};

angular
    .module('app.bungie')
    .service('BungieClient', BungieClient);
