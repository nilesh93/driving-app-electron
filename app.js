var moment = require('moment');

require('angular');
require('angular-utils-pagination');
require('angular-material');
require('angular-animate');
require('angular-aria');
require('material-steppers');

require('./controllers/mainController');

angular.module('driving-school', [
    require('angular-ui-router'),
    'angularUtils.directives.dirPagination',
    'ngMaterial',
    'ngAnimate',
    'ngAria',
    'mdSteppers',



    //controllers
    'driving-school.main'

])
    .config(($stateProvider, $urlRouterProvider) => {

        $urlRouterProvider.otherwise("/");
        $stateProvider
            .state('main', {
                abstract: true,
                views: {
                    layout: {
                        templateUrl: './views/main.layout.html'
                    }
                }
            }).state('login', {
                abstract: false,
                views: {
                    layout: {
                        templateUrl: './views/main.login.html'
                    }
                }
            })
            .state('customer-list', {
                templateUrl: './views/customers/customers.list.html',
                parent: 'main',

            })
            .state('customer-view', {
                templateUrl: './views/customers/customers.view.html',
                parent: 'main'
            })

            .state('customer-new', {
                templateUrl: './views/customers/customers.create.html',
                parent: 'main',
                controller: 'mainController as vm'
            })
            .state('payment-list', {
                templateUrl: './views/payments/payments.list.html',
                parent: 'main'
            })
            .state('attendence-list', {
                templateUrl: './views/attendence/attendence.list.html',
                parent: 'main'
            });

    })
    .run(($state) => {
        console.log('app works');
        $state.go('login');
    });