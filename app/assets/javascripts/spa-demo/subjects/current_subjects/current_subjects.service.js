(function() {
  "use strict";

  angular
    .module("spa-demo.subjects")
    .service("spa-demo.subjects.currentSubjects", CurrentSubjects);

  CurrentSubjects.$inject = ["$rootScope","$q",
                             "$resource",
                             "spa-demo.geoloc.currentOrigin",
                             "spa-demo.config.APP_CONFIG"];

  function CurrentSubjects($rootScope, $q, $resource, currentOrigin, APP_CONFIG) {
    var subjectsResource = $resource(APP_CONFIG.server_url + "/api/subjects",{},{
      query: { cache:false, isArray:true }
    });
    var service = this;
    service.version = 0;
    service.images = [];
    service.imageIdx = null;
    service.things = [];
    service.imagesType = [];
    service.thingIdx = null;
    service.thingId = null;
    service.refresh = refresh;
    service.isCurrentImageIndex = isCurrentImageIndex;
    service.isCurrentThingIndex = isCurrentThingIndex;
    service.nextThing = nextThing;
    service.previousThing = previousThing;
    service.indexThingType = isCurrentThingTypeIndex;

    //refresh();
    $rootScope.$watch(function(){ return currentOrigin.getVersion(); }, refresh);

    return;
    ////////////////
    function refresh() {
      var params=currentOrigin.getPosition();
      if (!params || !params.lng || !params.lat) {
        params=angular.copy(APP_CONFIG.default_position);
      } else {
        params["distance"]=true;
      }

      if (currentOrigin.getDistance() > 0) {
        params["miles"]=currentOrigin.getDistance();
      }
      params["order"]="ASC";

      params["subjtype"] = $rootScope.SelectType;

      var p1=refreshImages(params);
      params["subject"]="thing";
      var p2=refreshThings(params);
  //    var p3=refreshThingType(params);
      $rootScope.params = params;
      $q.all([p1,p2]).then(
        function(){
          service.setCurrentImageForCurrentThing();
        });
    }

    function refreshImages(params) {
      var result=subjectsResource.query(params);
      result.$promise.then(
        function(images){
          service.images=images;
          service.version += 1;
          if (!service.imageIdx || service.imageIdx > images.length) {
            service.imageIdx=0;
          }
//          console.log("refreshImages", service);
        });
      return result.$promise;
    }
    function refreshThings(params) {
      var result=subjectsResource.query(params);
      result.$promise.then(
        function(things){
          service.things=things;
          service.version += 1;
          if (!service.thingIdx || service.thingIdx > things.length) {
            service.thingIdx=0;
          }
  //        console.log("refreshThings", service);
        });
      return result.$promise;
    }

    function refreshThingType(params) {
      var result=subjectsResource.query(params);
      result.$promise.then(
        function(things){
          angular.forEach(things, function(tt){
            if(tt.thing_subjtype === $rootScope.SelectType){
              service.things= tt;
              service.version += 1;
              if (!service.thingIdx || service.thingIdx > things.length) {
                service.thingIdx=0;
              }
  //            console.log("refreshThingType", service);
            }
          });
        });
  //    console.log("PROMISE PRE!!!!!!: ", result.$promise);
      return result.$promise;
    }

    function isCurrentImageIndex(index) {
      //console.log("isCurrentImageIndex", index, service.imageIdx === index);
      return service.imageIdx === index;
    }
    function isCurrentThingIndex(index) {
      //console.log("isCurrentThingIndex", index, service.thingIdx === index);
      return service.thingIdx === index;
    }
    function isCurrentThingTypeIndex(index) {
      //console.log("isCurrentThingIndex", index, service.thingIdx === index);
      return service.thingIdx === index;
    }
    function nextThing() {
      if (service.thingIdx !== null) {
        service.setCurrentThing(service.thingIdx + 1);
      } else if (service.things.length >= 1) {
        service.setCurrentThing(0);
      }
    }
    function previousThing() {
      if (service.thingIdx !== null) {
        service.setCurrentThing(service.thingIdx - 1);
      } else if (service.things.length >= 1) {
        service.setCurrentThing(service.things.length-1);
      }
    }

  }

  CurrentSubjects.prototype.getVersion = function() {
    return this.version;
  }
  CurrentSubjects.prototype.getImages = function() {
    return this.images;
  }
  CurrentSubjects.prototype.getThings = function() {
    return this.things;
  }
  CurrentSubjects.prototype.getCurrentImageIndex = function() {
     return this.imageIdx;
  }
  CurrentSubjects.prototype.getCurrentImage = function() {
    return this.images.length > 0 ? this.images[this.imageIdx] : null;
  }
  CurrentSubjects.prototype.getCurrentThing = function() {
    return this.things.length > 0 ? this.things[this.thingIdx] : null;
  }
  CurrentSubjects.prototype.getCurrentImageId = function() {
    var currentImage = this.getCurrentImage();
    return currentImage ? currentImage.image_id : null;
  }
  CurrentSubjects.prototype.getCurrentThingId = function() {
    var currentThing = this.getCurrentThing();
    return currentThing ? currentThing.thing_id : null;
  }


  CurrentSubjects.prototype.setCurrentImage = function(index, skipThing) {
    if (index >= 0 && this.images.length > 0) {
      this.imageIdx = (index < this.images.length) ? index : 0;
    } else if (index < 0 && this.images.length > 0) {
      this.imageIdx = this.images.length - 1;
    } else {
      this.imageIdx = null;
    }
    if (!skipThing) {
      this.setCurrentThingForCurrentImage();
    }
    return this.getCurrentImage();
  }

  CurrentSubjects.prototype.setImagesType = function(IdThing, index) {

    if(!Array.isArray(this.things)){
      var aThings = [];
      aThings.push(this.things);
      this.things = aThings;
    }

    this.setCurrentSubjectId(IdThing.thing_id, IdThing.image_id);
    for (var i=0; i<this.things.length; i++) {
      var thing=this.things[i];
      if (thing.thing_id === IdThing.thing_id) {
        this.setCurrentThing(i, true);
        this.setCurrentImageForCurrentThing();
        break;
      }
    }

    for (var i=0; i<this.images.length; i++) {
      var image=this.images[i];
      if (image.thing_id === IdThing.thing_id && image.priority===0) {
        this.setCurrentImage(i, true);
    //    this.setCurrentThingForCurrentImage();
        break;
      }
    }

  }

  CurrentSubjects.prototype.setCurrentThing = function(index, skipImage) {
    if (index >= 0 && this.things.length > 0) {
      this.thingIdx = (index < this.things.length) ? index : 0;
    } else if (index < 0 && this.things.length > 0) {
      this.thingIdx = this.things.length - 1;
    } else {
      this.thingIdx=null;
    }
    if (!skipImage) {
      this.setCurrentImageForCurrentThing();
    }
    return this.getCurrentThing();
  }

  CurrentSubjects.prototype.setCurrentThingForCurrentImage = function() {
    var image=this.getCurrentImage();
    if (!image || !image.thing_id) {
      this.thingIdx = null;
    } else {
      var thing=this.getCurrentThing();
      if (!thing || thing.thing_id !== image.thing_id) {
        this.thingIdx=null;
        for (var i=0; i<this.things.length; i++) {
          thing=this.things[i];
          if (image.thing_id === thing.thing_id) {
            this.setCurrentThing(i, true);
            break;
          }
        }
      }
    }
  }

  CurrentSubjects.prototype.setCurrentImageForCurrentThing = function() {
    var image=this.getCurrentImage();
    var thing=this.getCurrentThing();
    if (!thing) {
      this.imageIdx=null;
    } else if ((thing && (!image || thing.thing_id !== image.thing_id)) || image.priority!==0) {
      for (var i=0; i<this.images.length; i++) {
        image=this.images[i];
        if (image.thing_id === thing.thing_id && image.priority===0) {
          this.setCurrentImage(i, true);
          break;
        }
      }
    }
  }

  CurrentSubjects.prototype.setCurrentImageId = function(image_id, skipThing) {
    var found=this.getCurrentImageId() === image_id;
    if (image_id && !found) {
      for(var i=0; i<this.images.length; i++) {
        if (this.images[i].image_id === image_id) {
          this.setCurrentImage(i, skipThing);
          found=true;
          break;
        }
      }
    }
    if (!found) {
      this.setCurrentImage(null, true);
    }
  }
  CurrentSubjects.prototype.setCurrentThingId = function(thing_id, skipImage) {
    var found=this.getCurrentThingId() === thing_id;
    if (thing_id && !found) {
      for (var i=0; i< this.things.length; i++) {
        if (this.things[i].thing_id === thing_id) {
          this.setCurrentThing(i, skipImage);
          found=true;
          break;
        }
      }
    }
    if (!found) {
      this.setCurrentThing(null, true);
    }
  }
  CurrentSubjects.prototype.setCurrentSubjectId = function(thing_id, image_id) {
  //  console.log("setCurrentSubject", thing_id, image_id);
    this.setCurrentThingId(thing_id, true);
    this.setCurrentImageId(image_id, true);
  }

  })();
