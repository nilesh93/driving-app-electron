angular.module('driving.dashboard', [])
    .controller('DashboardCtrl', DashboardCtrl);


function DashboardCtrl($rootScope, $scope, $http, $config) {

    var vm = this;
    $rootScope.$breadcrumbs = [{
            name: 'Dashboard',
            sref: false,
            active: false
        },
        {
            name: 'Main',
            sref: false,
            active: false
        }

    ];

    vm.dashboardData = {};
    vm.loading = true;
    $http.get($config.host + "dashboard").then((data) => {
        vm.dashboardData = data.data;

        console.log(vm.dashboardData);
        buildChart(vm.dashboardData.payments);
        vm.loading = false;
    });

    vm.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "Decemeber"];


    $rootScope.$navigation = "Dashboard";
    $scope.labels = [];
    $scope.series = ['Credit', 'Debit'];
    vm.credit = [];
    vm.debit = [];


    $scope.data = [
        [],
        []
    ];
    vm.totalProfit = 0;

    function buildChart(dataSet) {
        vm.credit = []; // income
        vm.debit = []; // expenditure
        $scope.labels = [];
        $scope.series = ['Income', 'Expenditure'];


        // dataSet = dataSet.reverse();

        var currentMonth = new Date().getMonth();
        dataSet.map((data) => {
            if (currentMonth < 0) {
                currentMonth = 11;
            }

            var income = false;
            var expenditure = false;

            $scope.labels.push(vm.months[currentMonth]);
            if (data[0]) {
                if (data[0].type == 'Income') {
                    income = true;
                    vm.debit.push(parseInt(data[0].amount));
                } else {
                    vm.credit.push(parseInt(data[0].amount));
                    expenditure = true;
                }
            } else {
                vm.debit.push(0);
                vm.credit.push(0);
                return data;
            }
            if (data[1]) {
                if (data[1].type == 'Income') {
                    income = true;
                    vm.debit.push(parseInt(data[1].amount));
                } else {
                    vm.credit.push(parseInt(data[1].amount));
                    expenditure = true;
                }

            } else {
                if (!income) {
                    vm.debit.push(0);
                }
                if (!expenditure) {
                    vm.credit.push(0);
                }
            }

            currentMonth--;
        });


        $scope.labels.reverse();
        vm.debit.reverse();
        vm.credit.reverse();
        $scope.data = [
            vm.debit,
            vm.credit

        ];


        vm.totalProfit = _.sum(vm.debit) - _.sum(vm.credit);
    }



    $scope.onClick = function(points, evt) {
        console.log(points, evt);
    };
    $scope.datasetOverride = [];
    $scope.options = {

    };
}