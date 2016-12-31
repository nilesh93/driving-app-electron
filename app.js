var moment = require('moment');

require('angular');
require('angular-utils-pagination');
require('angular-material');
require('angular-animate');
require('angular-aria');
require('material-steppers');
require('angular-messages');
require('./bower_components/tg-angular-validator/dist/angular-validator');
require('angular-sanitize');
require('ng-toast');


require('./controllers/mainController');
require('./controllers/customer.controller');
require('./controllers/payement.controller');

var config = require('./config.json');
var moment = require('moment');
var _ = require('lodash');

angular.module('driving-school', [
        require('angular-ui-router'),
        'angularUtils.directives.dirPagination',
        'ngMaterial',
        'ngAnimate',
        'ngAria',
        'mdSteppers',
        'angularValidator',
        'ngMessages',
        'ngSanitize',
        'ngToast',



        //controllers
        'driving-school.main',
        'driving.customer',
        'driving.payment'

    ])
    .constant('$config', config)
    .config(($stateProvider, $mdAriaProvider, $urlRouterProvider) => {
        $mdAriaProvider.disableWarnings();
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
                controller: 'CustomerCtrl as vm',
                parent: 'main',

            })
            .state('customer-view', {
                templateUrl: './views/customers/customers.view.html',
                controller: 'CustomerViewCtrl as vm',
                parent: 'main'
            })

        .state('customer-new', {
                templateUrl: './views/customers/customers.create.html',
                parent: 'main',
                controller: 'CustomerNewCtrl as vm'
            })
            .state('payment-list', {
                templateUrl: './views/payments/payments.list.html',
                parent: 'main',
                controller: 'PaymentListCtrl as vm'
            })
            .state('payment-add', {
                templateUrl: './views/payments/payments.create.html',
                parent: 'main',
                controller: "PaymentAddCtrl as vm"
            })
            .state('attendence-list', {
                templateUrl: './views/attendence/attendence.list.html',
                parent: 'main'
            });

    })
    .run(($state, $rootScope) => {
        $rootScope.$breadcrumbs = [];
        $state.go('customer-list');
    })
    .filter('numberFixedLen', () => (a, b) => (1e4 + "" + a).slice(-b));