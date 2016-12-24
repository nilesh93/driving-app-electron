require('./controllers/mainController');

angular.module('driving-school', [
    require('angular-ui-router'),
    'angularUtils.directives.dirPagination',


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
                parent: 'main'
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