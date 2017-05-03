(function() {
  "use strict";

  angular
  .module("spa-demo.subjects")
  .component("sdThingSelector", {
    controller: ThingSelectorController,
    bindings: {
      authz: "<"
    }
  })
  ;


  // thingSelectorTemplateUrl.$inject = ["spa-demo.config.APP_CONFIG"];
  // function thingSelectorTemplateUrl(APP_CONFIG) {
  //   return APP_CONFIG.thing_selector_html;
  // }

  ThingTypeSelectorController.$inject = ["$scope",
  "$stateParams",
  "spa-demo.authz.Authz",
  "spa-demo.subjects.ThingType"];
  function ThingTypeSelectorController($scope, $stateParams, Authz, ThingType) {
    var vm=this;

    vm.$onInit = function() {
      //console.log("ThingSelectorController",$scope);
      $scope.$watch(function(){
        if (!$stateParams.thing_type) {
          vm.items = Thing_Type.query();
        }
      });
    }
    return;
    //////////////
  }

})();
