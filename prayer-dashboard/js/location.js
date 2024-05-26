let map;
let pin;
let advancedMarker;
let mylocation = {
    city: null,
    region: null,
    country: null,
    latitude: -6.2,
    longitude: 107,
    status: false
}

async function detectLocation() {
    // URL endpoint GeoIP API
    var apiUrl = 'https://api.ipbase.com/v1/json/';

    // Mengirimkan permintaan HTTP GET ke API
    await fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            mylocation = {
                city: data.city,
                region: data.region,
                country: data.country_name,
                latitude: data.latitude,
                longitude: data.longitude,
                status: true
            }
            $('.location').html(`${mylocation['city']}, ${mylocation['country']}`);
            $('.latitude').val(mylocation['latitude']);
            $('.longitude').val(mylocation['longitude']);
            if (map){
                map.setCenter({lat: data.latitude, lng: data.longitude});
                map.setZoom(9);
                moveMarker();
            }
            // shalatTime();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

async function savePreciseLocation(position) {
    mylocation['latitude'] = position.coords.latitude;
    mylocation['longitude'] = position.coords.longitude;
    mylocation['status'] = true;

    apiUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${mylocation['latitude']}&longitude=${mylocation['longitude']}&localityLanguage=en`
    await fetch(apiUrl)
        .then( response => response.json() )
        .then( data => {
            mylocation["city"] = data.city;
            mylocation["region"] = data.principalSubdivision;
            mylocation["country"] = data.countryName;

            $('.location').html(`${mylocation['city']}, ${mylocation['country']}`);
            $('.latitude').val(mylocation['latitude']);
            $('.longitude').val(mylocation['longitude']);
        })
    if (map){
        map.setCenter({lat: position.coords.latitude, lng: position.coords.longitude});
        map.setZoom(14);
        moveMarker();
    }
    
}

function detectPreciseLocation() {
    if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(savePreciseLocation);;
    }
    else {
        detectLocation();
    }
}

async function initMap() {
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    let locallocation = { lat: -4.1, lng: 137 };

    if (mylocation) {
        locallocation = {lat: mylocation.latitude, lng: mylocation.longitude}
    }

    map = new Map(document.getElementById("map"), {
        center: locallocation,
        zoom: 8,
        mapId: '753'
    });

    pin = new AdvancedMarkerElement({
        map,
        position: locallocation,
        gmpDraggable: true,
    });

    pin.addListener("dragend", (event) => {
        const position = pin.position;
        map.setCenter(position);
        
        $('.latitude').val(position.lat);
        $('.longitude').val(position.lng);
    });
}

function updatePositionFromInput(){
    var position = {
        coords: {
            latitude: parseFloat($('#latitude').val()),
            longitude: parseFloat($('#longitude').val())
        }
    };
    savePreciseLocation(position);
}

function moveMarker() {
    if (pin){
        let position = {
            lat: parseFloat($('#latitude').val()),
            lng: parseFloat($('#longitude').val())
        }
        pin.position = position;
        pin.map.panTo(position);
    }
  }

detectPreciseLocation();
initMap();