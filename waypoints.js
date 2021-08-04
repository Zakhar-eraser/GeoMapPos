ymaps.ready(init);
var myMap, waypointsCollection, UAVCollection;

function init() {
    myMap = new ymaps.Map('map', {
            center: [55.813314, 37.498447],
            zoom: 18,
            controls: []
        }, {
            searchControlProvider: 'yandex#search'
        });
        waypointsCollection = new ymaps.GeoObjectCollection(null, {
            preset: 'islands#blackStretchyIcon'
        });
        UAVCollection = new ymaps.GeoObjectCollection(null, {
            preset: 'islands#circleIcon',
            iconColor: '#3caa3c'
        });
        var modeBtn =  new ymaps.control.Button({
            data: {
                content: "Редактирование точек"
            },
            options:{
                maxWidth: 200
            }
        }), createPointBtn = new ymaps.control.Button({
        state: {
            enabled: false
        },
        data: {
            content: "Создать метку"
        },
        options: {
            selectOnClick: false,
            maxWidth: 150
        }
    }), removePoints = new ymaps.control.Button({
        state:{
            enabled: false
        },
        data: {
            content: "Удалить метку"
        },
        options: {
            selectOnClick: false,
            maxWidth: 150
        }
    });

    var balloonLastData;

    var idBalloon = ymaps.templateLayoutFactory.createClass(
        '<div style="margin: 10px;">' +
            '<b>ID</b><br />' +
            '<form action="waypoints.js"><input type="text" id="idField" value={{properties.iconContent}}></form>' +
        '</div>', {
            clear: function () {
                balloonLastData = $("#idField").val();
                idBalloon.superclass.clear.call(this);
            }
        });

    myMap.controls.add(removePoints).add(createPointBtn).add(modeBtn, {float: 'right'});
    myMap.geoObjects.add(waypointsCollection).add(UAVCollection);

    createPointBtn.events.add('mouseup', function(){
        createPointBtn.disable();
        var polyl = new ymaps.Polyline([myMap.getCenter()], {}, {
            strokeColor: "#00000088",
            strokeWidth: 4,
            editorMaxPoints: 2,
            editorMenuManager: function (items) {
                items.push({
                    title: "Построить метку",
                    onClick: function () {
                        if(polyl.geometry.getLength()==2){
                            var coord = polyl.geometry.getCoordinates();
                            var pnt = new ymaps.Placemark(myMap.getCenter(), {
                                iconContent: waypointsCollection.getLength(),
                                hintContent: Math.atan((coord[0][0]-coord[1][0])/(coord[0][1]-coord[1][1])/Math.cos(Math.PI*coord[0][0]/180.0))
                            }, {
                                balloonContentLayout: idBalloon,
                                preset: 'islands#blackStretchyIcon',
                                draggable: true
                            });
                            waypointsCollection.add(pnt);
                            pnt.events.add('balloonclose', function(){
                                if(modeBtn.isSelected()){
                                    if(balloonLastData == "") balloonLastData = 0;
                                    pnt.properties.set("iconContent", balloonLastData);
                                }
                            });
                            myMap.geoObjects.remove(polyl);
                            createPointBtn.enable();
                        }
                    }
                });
                return items;
            }
        });
        myMap.geoObjects.add(polyl);
        polyl.editor.startEditing();
    });

    removePoints.events.add('mouseup', function(){
        var wpCount = waypointsCollection.getLength();
        if(wpCount > 0){
            waypointsCollection.remove(waypointsCollection.get(wpCount - 1));
        }
    });

    modeBtn.events.add('mouseup', function(){
        var state = !modeBtn.isSelected();
        if(state){
            createPointBtn.enable();
            removePoints.enable();
        } else{
            createPointBtn.disable();
            removePoints.disable();
            ChangeData();
        }
        for(let i = 0; i < waypointsCollection.getLength(); i++){
             waypointsCollection.get(i).options.set("draggable", state);
        }
    });
    setInterval(function(){UpdateUAVsPlacemarks();}, 1000);
    UpdateUAVsPlacemarks();
}

function UpdateUAVsPlacemarks(){
    $.ajax({
        url: "checkUAVs.php",
        type: "POST",
        success: function(dat){
            UAVCollection.removeAll();
            dat = jQuery.parseJSON(dat);
            $.each(dat, function(i, item){
                UAVCollection.add(new ymaps.Placemark([item.latitude, item.longitude], {iconContent: item.id}, {
                    iconOffset: [0, 0],
                    preset: 'islands#circleIcon',
                    iconColor: '#3caa3c'
                }));
            });
        }
    });
}

function ChangeData(){
    $.ajax({
        url: "clearDB.php",
        type: "GET",
        data: "a=4356",
        success: function(dat){
            for(let i = 0; i < waypointsCollection.getLength(); i++){
                var point = waypointsCollection.get(i);
                var pointId = point.properties.get("iconContent"),
                pointCoords = point.geometry.getCoordinates(),
                pointAngle = point.properties.get("hintContent");
                $.ajax({
                    url: "writeWaypoints.php",
                    type: "GET",
                    data: {id: pointId, latitude: pointCoords[0], longitude: pointCoords[1], angle: pointAngle}
                });
            }
        }
    });
}