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
    });