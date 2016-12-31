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
        deleteExam: deleteExam
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


function CustomerNewCtrl(CustomerService, $rootScope, ngToast, $scope) {
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
    $scope.customer = {};
    vm.saveCustomer = function() {
        ngToast.info({
            dismissOnTimeout: false,
            content: "Saving..."
        });
        $scope.customer.joinDateString = moment($scope.customer.joinDate).format("YYYY-MM-DD");
        CustomerService.saveCustomer($scope.customer).then((data) => {
            ngToast.dismiss();
            ngToast.success('Saved Successfully!');
            $scope.customer = {};

        });
    };
}

function CustomerViewCtrl($state, $mdDialog, ngToast, $mdToast, $scope, $rootScope, $stateParams, CustomerService) {
    var vm = this;
    $rootScope.$navigation = "Customer";


    vm.customerID = $rootScope.customerID;


    vm.customer = {};
    $scope.customer = {};

    vm.exam = {};
    vm.exam.cid = vm.customerID;

    vm.exams = [];
    vm.payments = [];

    vm.totalPaid = 0;
    vm.due = 0;

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
            console.log(data);
            vm.customer = data.data.customer;
            vm.exams = data.data.exams;
            vm.payments = data.data.payments;

            vm.totalPaid = _.sumBy(vm.payments, 'amount');
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
        });
    }

    function buildCustomer() {
        $scope.customer.joinDate = new Date(moment(vm.customer.date_of_admission).valueOf());
        $scope.customer.name = vm.customer.fullname;
        $scope.customer.address = vm.customer.address;
        $scope.customer.remarks = vm.customer.remarks;
        $scope.customer.mobile = vm.customer.phone1;
        $scope.customer.land = vm.customer.phone2;
        $scope.customer.fees = vm.customer.total_price;
        $scope.customer.nic = vm.customer.nic;
        $scope.customer.status = vm.customer.status;
    }

    vm.saveExam = function() {

        vm.exam.dateFormat = moment(vm.exam.examDate).format("YYYY-MM-DD");
        ngToast.info({
            dismissOnTimeout: false,
            content: "Saving..."
        });
        CustomerService.saveExam(vm.exam).then((data) => {
            vm.exam = {};
            vm.exam.type = "Practical";
            construct();
            ngToast.dismiss();
            ngToast.success('Saved Successfully!');

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
                ngToast.success('Deleted Successfully!');

            });
        });

    };

    vm.updateCustomer = function() {
        ngToast.info({
            dismissOnTimeout: false,
            content: "Updating..."
        });
        $scope.customer.joinDateString = moment($scope.customer.joinDate).format("YYYY-MM-DD");
        CustomerService.updateCustomer(vm.customerID, $scope.customer).then((data) => {
            ngToast.dismiss();

            ngToast.success('Customer Updated Successfully!');
            construct();
        }, () => {
            ngToast.dismiss();
            ngToast.danger('Failed! Something Went Wrong');
        });
    }



    construct();
}