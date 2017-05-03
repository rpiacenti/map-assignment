(function() {
  "use strict";

  angular
  .module("spa-demo.subjects")
  .component("sdThingTypeSelector", {
    templateUrl: templateUrl,
    controller: ThingTypeSelectorController
  })
  ;

  templateUrl.$inject = ["spa-demo.config.APP_CONFIG"];
  function templateUrl(APP_CONFIG) {
    return APP_CONFIG.thing_type_selector_html;
  }

  ThingTypeSelectorController.$inject = ["$rootScope","$scope","spa-demo.subjects.currentSubjects"];
  function ThingTypeSelectorController($rootScope, $scope, currentSubjects) {
    var vm=this;
    vm.typething = "";

    vm.$onInit = function() {
      console.log("ThingTypeSelectorController",$scope);
      $scope.typething = "";
      $rootScope.SelectType = "";
      $rootScope.InfoOpen = false;
    }

    //////////////
    vm.searchThingType = function() {

      console.log("Searching for", vm.typething );

      $rootScope.SelectType = vm.typething;
      vm.typething = "";
      $rootScope.aThings = [];
      $rootScope.InfoOpen = false;
      currentSubjects.refresh();
    }

    return;
    }
  })();
