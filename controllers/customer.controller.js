angular.module('driving.customer', [])
    .controller('CustomerCtrl', CustomerCtrl)
    .controller('CustomerNewCtrl', CustomerNewCtrl)
    .controller('CustomerViewCtrl', CustomerViewCtrl)
    .service('CustomerService', CustomerService);

function CustomerService($http, $config) {

    return {
        getCustomers: getCustomers,
        saveCustomer: saveCustomer,
        viewCustomer: viewCustomer,
        saveExam: saveExam,
        updateCustomer: updateCustomer,
        deleteExam: deleteExam,
        updateExam: updateExam
    };

    function getCustomers(type) {
        return $http.get($config.host + "customers?status=" + type);
    }

    function saveCustomer(param) {
        return $http.post($config.host + "customers", param);
    }

    function viewCustomer(id) {
        return $http.get($config.host + "customers/" + id);
    }

    function updateCustomer(id, param) {
        return $http.put($config.host + "customers/" + id, param);
    }

    function saveExam(param) {
        return $http.post($config.host + "exams", param);
    }

    function deleteExam(id) {
        return $http.delete($config.host + "exams/" + id);
    }

    function updateExam(id, param) {
        return $http.put($config.host + "exams/" + id, param);
    }
}


function CustomerCtrl(CustomerService, $state, $rootScope) {
    $rootScope.$navigation = "Customer";
    $rootScope.$breadcrumbs = [{
            name: 'Customers',
            sref: false,
            active: false
        },
        {
            name: 'Search',
            sref: false,
            active: true
        }
    ];
    var vm = this;

    vm.activeCustomers = [];
    vm.inactiveCustomers = [];

    vm.navigate = function(id) {
        $rootScope.customerID = id;
        $state.go('customer-view');
    };

    CustomerService.getCustomers("active").then(function(data) {

        vm.activeCustomers = data.data.data;
    });


    CustomerService.getCustomers("inactive").then(function(data) {
        vm.inactiveCustomers = data.data.data;
    });
}


function CustomerNewCtrl(CustomerService, $rootScope, ngToast, $scope, $config) {
    var vm = this;
    $rootScope.$navigation = "Customer";
    $rootScope.$breadcrumbs = [{
            name: 'Customers',
            sref: false,
            active: false
        },
        {
            name: 'New',
            sref: false,
            active: true
        }
    ];
    vm.vehicles = [];

    angular.copy($config.vehicles, vm.vehicles);

    $scope.customer = {};
    vm.saveCustomer = function() {
        ngToast.info({
            dismissOnTimeout: false,
            content: "Saving..."

        });
        $scope.customer.fees = Number($scope.customer.fees.replace(/[^0-9\.]+/g, ""));
        $scope.customer.joinDateString = moment($scope.customer.joinDate).format("YYYY-MM-DD");

        $scope.customer.vehicles = JSON.stringify(vm.vehicles);
        CustomerService.saveCustomer($scope.customer).then((data) => {
            ngToast.dismiss();
            ngToast.success({
                dismissButton: true,
                content: 'Saved Successfully!',
                timeout: 7000,
                dismissOnClick: false,
                animation: 'slide'
            });
            $scope.customer = {};
            angular.copy($config.vehicles, vm.vehicles);
        });
    };
}

function CustomerViewCtrl($state, $mdDialog, ngToast, $config, $mdToast, $scope, $rootScope, $stateParams, CustomerService) {
    var vm = this;
    $rootScope.$navigation = "Customer";


    vm.customerID = $rootScope.customerID;


    vm.customer = {};
    $scope.customer = {};

    vm.exam = {};

    vm.loading = true;
    vm.exams = [];
    vm.payments = [];

    vm.totalPaid = 0;
    vm.due = 0;
    vm.selectedExam = {};
    vm.buildCustomer = buildCustomer;
    vm.add2Numbers = function(num1, num2) {
        return parseFloat(num1) + parseFloat(num2);
    };
    vm.vehicles = [];
    angular.copy($config.vehicles, vm.vehicles);

    $rootScope.$breadcrumbs = [{
            name: 'Customers',
            sref: false,
            active: false
        },
        {
            name: 'Search',
            sref: 'customer-list',
            active: false
        },
        {
            name: vm.customer.fullname,
            sref: false,
            active: true
        }
    ];

    function construct() {
        CustomerService.viewCustomer(vm.customerID).then((data) => {

            vm.customer = data.data.customer;
            vm.exams = data.data.exams;
            vm.payments = data.data.payments;

            vm.totalPaid = parseFloat(_.sumBy(vm.payments, 'amount')) + parseFloat(_.sumBy(vm.payments, 'stamp'));
            vm.due = vm.customer.total_price - vm.totalPaid;

            $rootScope.$breadcrumbs = [{
                    name: 'Customers',
                    sref: false,
                    active: false
                },
                {
                    name: 'Search',
                    sref: 'customer-list',
                    active: false
                },
                {
                    name: vm.customer.fullname,
                    sref: false,
                    active: true
                }
            ];

            buildCustomer();
            vm.loading = false;
        });
    }

    function buildCustomer() {
        $scope.customer.joinDate = new Date(moment(vm.customer.date_of_admission).valueOf());
        $scope.customer.name = vm.customer.fullname;
        $scope.customer.address = vm.customer.address;
        $scope.customer.remarks = vm.customer.remarks;
        $scope.customer.mobile = vm.customer.phone1;
        $scope.customer.land = vm.customer.phone2;
        $scope.customer.fees = vm.customer.total_price.toFixed(2);
        $scope.customer.nic = vm.customer.nic;
        $scope.customer.status = vm.customer.status;
        $scope.customer.regno = vm.customer.regno;
        if (vm.customer.vehicles && vm.customer.vehicles !== null && vm.customer.vehicles !== "") {
            vm.vehicles = JSON.parse(vm.customer.vehicles);
        }
    }

    vm.saveExam = function() {

        vm.exam.dateFormat = moment(vm.exam.examDate).format("YYYY-MM-DD");
        ngToast.info({
            dismissOnTimeout: false,
            content: "Saving..."
        });
        vm.exam.cid = vm.customerID;
        CustomerService.saveExam(vm.exam).then((data) => {
            vm.exam = {};
            vm.exam.type = "Practical";
            construct();
            ngToast.dismiss();
            ngToast.success({
                dismissButton: true,
                content: 'Saved Successfully!',
                timeout: 7000,
                dismissOnClick: false,
                animation: 'slide'
            });

        });
    };

    vm.deleteExam = function(ev, id) {

        var confirm = $mdDialog.confirm({
                onComplete: function afterShowAnimation() {
                    var $dialog = angular.element(document.querySelector('md-dialog'));
                    var $actionsSection = $dialog.find('md-dialog-actions');
                    var $cancelButton = $actionsSection.children()[0];
                    var $confirmButton = $actionsSection.children()[1];
                    angular.element($confirmButton).addClass('md-raised md-warn');

                }
            })
            .title('Are you sure?')
            .textContent('This cannot be undone afterwards.')
            .ariaLabel('')
            .ok('Delete')
            .cancel('Cancel');

        $mdDialog.show(confirm).then(function() {
            ngToast.info({
                dismissOnTimeout: false,
                content: "Deleting..."
            });
            CustomerService.deleteExam(id).then((data) => {
                construct();
                ngToast.dismiss();
                ngToast.success({
                    dismissButton: true,
                    content: 'Deleted Successfully!',
                    timeout: 7000,
                    dismissOnClick: false,
                    animation: 'slide'
                });

            });
        });

    };

    vm.updateCustomer = function() {
        ngToast.info({
            dismissOnTimeout: false,
            content: "Updating..."
        });
        $scope.customer.joinDateString = moment($scope.customer.joinDate).format("YYYY-MM-DD");
        if ($scope.customer.fees) {
            $scope.customer.fees = $scope.customer.fees + "";
            $scope.customer.newFees = Number($scope.customer.fees.replace(/[^0-9\.]+/g, ""));
            delete $scope.customer.fees;
        }
        $scope.customer.vehicles = JSON.stringify(vm.vehicles);
        CustomerService.updateCustomer(vm.customerID, $scope.customer).then((data) => {
            ngToast.dismiss();

            ngToast.success({
                dismissButton: true,
                content: 'Updated Successfully!',
                timeout: 7000,
                dismissOnClick: false,
                animation: 'slide'
            });
            construct();
        }, () => {
            ngToast.dismiss();
            ngToast.danger('Failed! Something Went Wrong');
        });
    }

    vm.editExam = function(ev, exam) {

        angular.copy(exam, vm.selectedExam);


        vm.selectedExam.examDate = new Date(moment(exam.date).valueOf());
        vm.dialog = $mdDialog.show({
            scope: $scope,
            templateUrl: './views/customers/exam.edit.html',
            clickOutsideToClose: true,
            preserveScope: true,
            parent: angular.element(document.body)
        });
    };

    construct();

    vm.hide = function() {
        $mdDialog.hide();
    }

    vm.updateExam = function() {
        ngToast.info({
            dismissOnTimeout: false,
            content: "Updating..."
        });

        vm.selectedExam.date = moment(vm.selectedExam.examDate).format("YYYY-MM-DD");

        CustomerService.updateExam(vm.selectedExam.id, vm.selectedExam).then((data) => {
            ngToast.dismiss();

            ngToast.success({
                dismissButton: true,
                content: 'Updated Successfully!',
                timeout: 7000,
                dismissOnClick: false,
                animation: 'slide'
            });
            vm.hide();
            construct();
        }, () => {
            ngToast.dismiss();
            ngToast.danger('Failed! Something Went Wrong');
        });
    }
}