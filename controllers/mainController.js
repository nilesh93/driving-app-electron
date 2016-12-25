"use strict";
angular.module('driving-school.main',[])
.controller("mainController", function($scope, $location){
	console.log("controller works");
	$scope.date = new Date();
});