(function() {
    var self = packmule.Platform = {
        isAndroid: function() {
            return navigator.userAgent.match(/android/i);
        },

        isChrome: function() {
            return typeof cordova === 'undefined';
        },

        isMobile: function() {
            return !self.isChrome();
        }
    };
})();
