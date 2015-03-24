<!DOCTYPE html>
<html ng-csp>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, width=device-width">
    <title></title>

    <link href="http://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css" rel="stylesheet" type="text/css">
    <link href="http://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css" rel="stylesheet" type="text/css">
    <link href="http://fonts.googleapis.com/css?family=Ubuntu" rel="stylesheet" type="text/css">

    <!-- @if NODE_ENV == 'DEVELOPMENT' -->
    <link href="build/vendor.min.css" rel="stylesheet">
    <link href="build/style.min.css" rel="stylesheet">

    <script type="text/javascript" src="asset/js/thenBy.js"></script>
    <script type="text/javascript" src="asset/lib/hammerjs/hammer.js"></script>
    <script type="text/javascript" src="asset/lib/lodash/lodash.js"></script>

    <script type="text/javascript" src="asset/lib/angular/angular.js"></script>
    <script type="text/javascript" src="asset/lib/angular-animate/angular-animate.js"></script>
    <script type="text/javascript" src="asset/lib/angular-aria/angular-aria.js"></script>
    <script type="text/javascript" src="asset/lib/angular-hammer/angular-hammer.js"></script>
    <script type="text/javascript" src="asset/lib/angular-material/angular-material.js"></script>
    <script type="text/javascript" src="asset/lib/angular-ui-router/release/angular-ui-router.js"></script>

    <script type="text/javascript" src="cordova.js"></script>
    <script type="text/javascript" src="debug.js"></script>

    <script type="text/javascript" src="app/shared/cordovahttp.js"></script>
    <script type="text/javascript" src="app/app.module.js"></script>
    <script type="text/javascript" src="app/app.route.js"></script>

    <script type="text/javascript" src="app/shared/AppCtrl.js"></script>

    <script type="text/javascript" src="app/shared/layout/MenuCtrl.js"></script>
    <script type="text/javascript" src="app/shared/layout/RightNavCtrl.js"></script>

    <script type="text/javascript" src="app/shared/platform.js"></script>
    <script type="text/javascript" src="app/shared/util.js"></script>

    <script type="text/javascript" src="app/component/auth/LoginCtrl.js"></script>
    <script type="text/javascript" src="app/component/auth/LogoutCtrl.js"></script>

    <script type="text/javascript" src="app/component/bungie/AuthService.js"></script>
    <script type="text/javascript" src="app/component/bungie/BungieClient.js"></script>
    <script type="text/javascript" src="app/component/bungie/BungieService.js"></script>

    <script type="text/javascript" src="app/component/item/BucketListDirective.js"></script>
    <script type="text/javascript" src="app/component/item/ItemListDirective.js"></script>
    <script type="text/javascript" src="app/component/item/ItemFilters.js"></script>

    <script type="text/javascript" src="app/component/vault/VaultCtrl.js"></script>
    <!-- @endif -->

    <!-- @if NODE_ENV == 'PRODUCTION' -->
    <link href="build/vendor.min.css" rel="stylesheet">
    <link href="build/style.min.css" rel="stylesheet">
    <script type="text/javascript" src="build/vendor.min.js"></script>
    <script type="text/javascript" src="cordova.js"></script>
    <script type="text/javascript" src="build/app.min.js"></script>
    <!-- @endif -->
</head>

<body ng-controller="AppCtrl" layout="column" flex>
<div ui-view flex layout="column"></div>
</body>
</html>
