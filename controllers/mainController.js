"use strict";
angular.module('driving-school.main', [])
    .controller("mainController", function($scope, $mdDialog, $state, $location) {
        var vm = this;
        vm.navigate = function(state) {
            $state.go(state);
        }

        vm.logout = function() {

            var confirm = $mdDialog.confirm({
                    onComplete: function afterShowAnimation() {
                        var $dialog = angular.element(document.querySelector('md-dialog'));
                        var $actionsSection = $dialog.find('md-dialog-actions');
                        var $cancelButton = $actionsSection.children()[0];
                        var $confirmButton = $actionsSection.children()[1];
                        angular.element($confirmButton).addClass('md-raised md-warn');

                    }
                })
                .title('Logout?')
                .textContent('All your unsaved changes will be lost.')
                .ariaLabel('')
                .ok('Logout')
                .cancel('Cancel');

            $mdDialog.show(confirm).then(function() {
                $state.go('login');
            });

        }
    })
    .controller("loginController", function($config, $base64, $state, ngToast, $rootScope) {
        var vm = this;

        vm.userData = {
            username: '',
            password: ''
        };

        vm.error = false;

        vm.login = function() {
            vm.error = false;
            ngToast.dismiss();

            var temp = '';

            vm.userData.type = 'admin';
            if ($config.other.indexOf($base64.encode(JSON.stringify(vm.userData))) !== -1) {

                $rootScope.$user = vm.userData;
                $state.go("dashboard");
            } else {
                vm.userData.type = 'employee';

                if ($config.other.indexOf($base64.encode(JSON.stringify(vm.userData))) !== -1) {
                    $rootScope.$user = vm.userData;
                    $state.go("customer-list");

                } else {
                    vm.error = true;

                    ngToast.error({
                        dismissButton: true,
                        content: 'Invalid Login!',
                        timeout: 7000,
                        dismissOnClick: false,
                        animation: 'slide'
                    });

                }
            }




        };
    });