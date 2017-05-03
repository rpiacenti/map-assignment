(function() {
  "use strict";

  angular
  .module("spa-demo.subjects")
  .component("sdCurrentType", {
    templateUrl: thingsTemplateUrl,
    controller: CurrentTypeController,
  })
  .component("sdCurrentThingInfo", {
    templateUrl: thingInfoTemplateUrl,
    controller: CurrentThingInfoController,
  })
  ;

  thingsTemplateUrl.$inject = ["spa-demo.config.APP_CONFIG"];
  function thingsTemplateUrl(APP_CONFIG) {
    return APP_CONFIG.current_thingtype_html;
  }
  thingInfoTemplateUrl.$inject = ["spa-demo.config.APP_CONFIG"];
  function thingInfoTemplateUrl(APP_CONFIG) {
    return APP_CONFIG.current_thing_info_html;
  }

  CurrentTypeController.$inject = ["$rootScope", "$scope", "$element",
  "spa-demo.subjects.currentSubjects"];
  function CurrentTypeController($rootScope, $scope, $element, currentSubjects) {
    var vm=this;
    vm.thingClicked = thingClicked;
    vm.isCurrentThing = currentSubjects.isCurrentThingIndex;
    vm.selectType = "";
    vm.thingtype = [];
    vm.aTemp = [];


    vm.$onInit = function() {
      console.log("CurrentThingsController .....");
    }

    vm.getThings = function() {
      var things = currentSubjects.getThings();
      vm.aTemp = [];
      if(!Array.isArray(things)){
          var aThings = [];
          aThings.push(things);
          things = aThings;
      }
      angular.forEach(things, function(tt){
        if(tt.thing_subjtype != undefined && tt.thing_subjtype == $rootScope.SelectType){
          if(vm.aTemp.indexOf(tt) == -1){
            vm.aTemp.push(tt);
          }
        }
      })
      return vm.aTemp;
    };

    this.$doCheck = function(){

        $rootScope.aThings = vm.getThings();
        vm.thingtype = $rootScope.aThings;

    };

    return;
    //////////////
    function thingClicked(index) {
      var idThing = vm.thingtype[index];
      $rootScope.SelectType = idThing.thing_subjtype;
      currentSubjects.setImagesType(idThing, index);
    }
  }

  CurrentThingInfoController.$inject = ["$scope",
  "spa-demo.subjects.currentSubjects",
  "spa-demo.subjects.Thing",
  "spa-demo.authz.Authz"];
  function CurrentThingInfoController($scope,currentSubjects, Thing, Authz) {
    var vm=this;
    vm.nextThing = currentSubjects.nextThing;
    vm.previousThing = currentSubjects.previousThing;

    vm.$onInit = function() {
      console.log("CurrentThingInfoController",$scope);
    }
    vm.$postLink = function() {
      $scope.$watch(
        function() { return currentSubjects.getCurrentThing(); },
        newThing
      );
      $scope.$watch(
        function() { return Authz.getAuthorizedUserId(); },
        function() { newThing(currentSubjects.getCurrentThing()); }
      );
    }
    return;
    //////////////
    function newThing(link) {
      vm.link = link;
      vm.thing = null;
      if (link && link.thing_id) {
        vm.thing=Thing.get({id:link.thing_id});
      }
    }

  }
})();
