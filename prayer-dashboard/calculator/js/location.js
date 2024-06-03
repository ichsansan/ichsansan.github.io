let mylocation = {
    city: null,
    region: null,
    country: null,
    latitude: -6.2,
    longitude: 107,
    status: false
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
            $('.location').val(`${mylocation['city']}, ${mylocation['country']}`);
            $('.latitude').val(mylocation['latitude']);
            $('.longitude').val(mylocation['longitude']);
            $('.city').val(mylocation['city']);
            $('.region').val(mylocation['region']);
            $('.country').val(mylocation['country']);
        })
    
}

function detectPreciseLocation() {
    if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(savePreciseLocation);;
    }
    else {
        detectLocation();
    }
}

detectPreciseLocation();