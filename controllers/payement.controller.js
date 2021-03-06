angular.module('driving.payment', [])
    .controller('PaymentListCtrl', PaymentListCtrl)
    .controller('PaymentAddCtrl', PaymentAddCtrl)
    .service('PaymentService', PaymentService);


function PaymentService($http, $config) {
    return {
        getPayments: getPayments,
        savePayment: savePayment,
        deletePayment: deletePayment
    };

    function getPayments(params) {
        return $http.get($config.host + "payments" + params)
    }

    function savePayment(params) {
        return $http.post($config.host + "payments", params);
    }

    function deletePayment(id) {
        return $http.delete($config.host + "payments/" + id)
    }
}


function PaymentListCtrl(PaymentService, $rootScope, $mdDialog, ngToast) {
    var vm = this;
    $rootScope.$navigation = "Payment";
    $rootScope.$breadcrumbs = [{
            name: 'Payments',
            sref: false,
            active: false
        },
        {
            name: 'Search',
            sref: false,
            active: true
        }
    ];

    vm.add2Numbers = function(num1, num2) {
        return parseFloat(num1) + parseFloat(num2);
    };
    vm.search = {};
    vm.loading = true;
    vm.search.startDate = new Date();
    vm.search.endDate = new Date();

    vm.credit = 0; //yanawa
    vm.debit = 0; //enawa

    vm.searchPayment = function() {
        var toast = ngToast.info({
            dismissOnTimeout: false,
            content: "Loading..."
        });
        var str = "?startDate=" + moment(vm.search.startDate).format("YYYY-MM-DD") + "&endDate=" + moment(vm.search.endDate).format("YYYY-MM-DD");

        PaymentService.getPayments(str).then((data) => {
            ngToast.dismiss(toast);
            vm.payments = data.data.data;
            console.log(vm.payments);

            vm.credit = _.sumBy(vm.payments, function(o) {
                if (o.type == 'Expenditure') {
                    return o.amount;
                } else {
                    return o.stamp;
                }
            });

            vm.debit = _.sumBy(vm.payments, function(o) {
                if (o.type == 'Income') {
                    return o.amount + parseFloat(o.stamp);
                } else {
                    return 0;
                }
            });
            vm.loading = false;
        });

    };

    vm.searchPayment();

    vm.deletePayment = function(ev, id) {

        var confirm = $mdDialog.confirm({
                onComplete: function afterShowAnimation() {
                    var $dialog = angular.element(document.querySelector('md-dialog'));
                    var $actionsSection = $dialog.find('md-dialog-actions');
                    var $cancelButton = $actionsSection.children()[0];
                    var $confirmButton = $actionsSection.children()[1];
                    angular.element($confirmButton).addClass('md-raised md-warn');

                }
            })
            .title('Delete Payment?')
            .textContent('This cannot be undone.')
            .ariaLabel('')
            .ok('Delete')
            .cancel('Cancel');

        $mdDialog.show(confirm).then(function() {
            ngToast.info({
                dismissOnTimeout: false,
                content: "Deleting..."
            });
            PaymentService.deletePayment(id).then((data) => {
                vm.searchPayment();
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
}

function PaymentAddCtrl($scope, ngToast, $rootScope, CustomerService, PaymentService, $mdDialog) {
    var vm = this;
    vm.payment = {};
    vm.customers = [];
    $rootScope.$navigation = "Payment";
    $rootScope.$breadcrumbs = [{
            name: 'Payments',
            sref: false,
            active: false
        },
        {
            name: 'New',
            sref: false,
            active: true
        }
    ];
    $scope.querySearch = querySearch;

    function construct() {
        CustomerService.getCustomers("active").then(function(data) {

            vm.customers = data.data.data;
            console.log(vm.customers);
        });
    }

    function querySearch(query) {
        return query ? vm.customers.filter(createFilterFor(query)) : [];
    }

    function createFilterFor(query) {
        return function filterFn(customer) {
            return (customer.name.toLowerCase().indexOf(angular.lowercase(query)) === 0);
        };
    }

    vm.savePayment = function() {

        var pay = vm.payment;
        if (pay.type == 'Income') {
            pay.remarkSave = pay.remark || '';

            if (pay.cid) {
                var temp = _.find(vm.customers, _.matchesProperty('id', parseInt(pay.cid)));

                if (temp) {
                    pay.remarkSave += " - " + temp.fullname;
                    pSave(pay);
                } else {
                    var confirm = $mdDialog.confirm({
                            onComplete: function afterShowAnimation() {
                                var $dialog = angular.element(document.querySelector('md-dialog'));
                                var $actionsSection = $dialog.find('md-dialog-actions');
                                var $cancelButton = $actionsSection.children()[0];
                                var $confirmButton = $actionsSection.children()[1];
                                angular.element($confirmButton).addClass('md-raised md-success');

                            }
                        })
                        .title('Sorry! Customer ID ' + pay.cid + " Does not Exist.")
                        .textContent('Do you want to   continue & save anyway?')
                        .ariaLabel('')
                        .ok('Continue')
                        .cancel('No');

                    $mdDialog.show(confirm).then(function() {
                        pay.remarkSave += "";
                        pay.cid = null;
                        pSave(pay);
                    });
                }
            } else {
                var confirm = $mdDialog.confirm({
                        onComplete: function afterShowAnimation() {
                            var $dialog = angular.element(document.querySelector('md-dialog'));
                            var $actionsSection = $dialog.find('md-dialog-actions');
                            var $cancelButton = $actionsSection.children()[0];
                            var $confirmButton = $actionsSection.children()[1];
                            angular.element($confirmButton).addClass('md-raised md-success');

                        }
                    })
                    .title('Sorry! Customer Id not defined')
                    .textContent('Do you want to continue & save anyway?')
                    .ariaLabel('')
                    .ok('Continue')
                    .cancel('No');

                $mdDialog.show(confirm).then(function() {
                    pay.remarkSave += "";
                    pay.cid = null;
                    pSave(pay);
                });
            }
        } else {
            pay.remarkSave = pay.remark || '';
            pay.cid = null;
            pSave(pay);
        }


    }

    function pSave(pay) {
        ngToast.info({
            dismissOnTimeout: false,
            content: "Saving..."
        });
        pay.paymentDateSave = moment(pay.paymentDate).format("YYYY-MM-DD");

        pay.amount = Number(pay.amount.replace(/[^0-9\.]+/g, ""));
        if (pay.type === "Income") {
            pay.amount = pay.amount - parseFloat(pay.stampfee);
        }
        PaymentService.savePayment(pay).then((data) => {
            ngToast.dismiss();
            ngToast.success({
                dismissButton: true,
                content: 'Saved Successfully!',
                timeout: 7000,
                dismissOnClick: false,
                animation: 'slide'
            });
            vm.payment = {};
            vm.payment.type = "Income";
        });

    }
    construct();

}