var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': APP.GLOBAL.getUserModel(),
        'isShowActions': false,
        'statusbarHeight': 0,
        'actions': [],
        'language': {}
    },
    methods: {
        'updateUserModel': function () {
            Vue.set(this, 'currentUser', APP.GLOBAL.getUserModel());
        },
        'fromCamera': function () {
            this.isShowActions = false;

            var camera = plus.camera.getCamera();
            camera.captureImage(this.resolveFile);
        },
        'fromGallery': function () {
            this.isShowActions = false;

            plus.gallery.pick(this.resolveFile);
        },
        'resolveFile': function (captureFile) {
            APP.GLOBAL.toastLoading({ 'message': this.language.LOADING_TEXT });

            plus.io.resolveLocalFileSystemURL(captureFile, function (entry) {
                var fileName = APP.CONFIG.SYSTEM_NAME === 'ios' ? entry.toRemoteURL() : entry.toLocalURL();

                APP.GLOBAL.gotoNewWindow('croppaPage', 'child/croppa', {
                    ani: 'slide-in-bottom',
                    param: 'fn=' + encodeURIComponent(fileName),
                    openCallback: function () {
                        plus.navigator.setStatusBarStyle('light');
                        APP.GLOBAL.closeToastLoading();
                    },
                    closeCallback: function () {
                        plus.navigator.setStatusBarStyle('dark');
                    }
                });
            });
        },
        'getIDTypeName': function (typeId) {
            if (typeId === 1) {
                return this.language.IDCARD;
            } else if (typeId === 2) {
                return this.language.PASSPORT;
            } else {
                return this.language.UNKNOW;
            }
        },
        'getCountryName': function (code) {
            for (var i = 0; i < country.length; i++) {
                if (country[i].code === code) return country[i].text;
            }

            return this.language.UNKNOW;
        },
        'changeLanguage': function () {
            LSE.install('profile', function (lang) {
                Vue.set(_vue, 'language', lang);

                _vue.actions.push({
                    'name': _vue.language.ACTION_ITEM_1,
                    'callback': _vue.fromCamera
                });
                _vue.actions.push({
                    'name': _vue.language.ACTION_ITEM_2,
                    'callback': _vue.fromGallery
                });
            });
        }
    },
    computed: {
        'getGlory': function () {
            var name = this.currentUser.HonorName ? this.currentUser.HonorName : 'error';
            var aTag = '';

            for (var i = 0; i < this.currentUser.HonorLevel; i++) {
                aTag += '<span class="aTag">A</span>';
            }

            return name + aTag;
        }
    },
    created: function () {
        this.changeLanguage();

        if (APP.CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }
    }
});