angular.module('customer.list',[])
.controller('CustomerCtrl',CustomerCtrl)
.service('CustomerService',CustomerService);

function CustomerCtrl(CustomerService){
    
    var vm = this;

    vm.activeCustomers = [];
    vm.inactiveCustomers = [];
    console.log("customer works");


    CustomerService.getCustomers("active").then(function(data){
        console.log("customers are", data.data.data);

         vm.activeCustomers = data.data.data;
    });

    
    CustomerService.getCustomers("inactive").then(function(data){
         vm.inactiveCustomers = data.data.data;
    });
}


function CustomerService($http){

    return {
        getCustomers:getCustomers
    };

    function getCustomers(type){

      return  $http.get("http://localhost:8000/customers?status="+type);

    }
}