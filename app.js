var moment = require('moment');

 
require('angular-material');
require('angular-material-datetimepicker');

require('./controllers/mainController');

angular.module('driving-school', [
    require('angular-ui-router'),
    'angularUtils.directives.dirPagination',
 
    'ngMaterial',
    'ngMaterialDatePicker',


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
                controller:'mainController as vm'
            })
            .state('customer-view', {
                templateUrl: './views/customers/customers.view.html',
                parent: 'main'
            });
    })
    .run(($state) => {
        console.log('app works');
        $state.go('login');
    });