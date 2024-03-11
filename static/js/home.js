const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const surah_motivations = [[3, 139], [94, 5], [67, 13], [64, 3], [2, 153], [2,214], [39, 53], [25, 71]];

var update_time = {};
var now;

function saveVariable(variable_name, variable_value){
    localStorage.setItem(variable_name, variable_value);
}

function loadVariable(variable_name) {
    return localStorage.getItem(variable_name);
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}
function showPosition(position) {
    console.log(position);
    getWaktuShalat(position.coords.latitude, position.coords.longitude, position.coords.altitude);
    
    $.get({
        url: "https://api.bigdatacloud.net/data/reverse-geocode-client",
        jsonpCallback: "callback",
        data: {latitude: position.coords.latitude, longitude: position.coords.longitude, localityLanguage: 'id'},
        dataType: "json",
        success: function (location) {
            console.log(location);

            saveVariable('reverse_geocode', location);
            $('#location-selected').html(`${location.city}, ${location.countryName}`);
        },
        error: function(e, s, h) {
            console.log(`Error reverse geocode:`, e, h);

            var location = loadVariable('reverse_geocode');
            $('#location-selected').html(`${location.city}, ${location.countryName}`);
        },
        complete: function() {
            refreshTabelShalat();
        }
    });
}

function getWaktuShalat(lat=null, lon=null, alt=null) {
    try {
        let date_now = now.toISOString().split('T')[0];
        let url = `https://api.aladhan.com/v1/timings/${date_now}`;
        let datasent = {
            latitude: lat,
            longitude: lon,
            altitude: alt,
            method: 4,
            school: 0
        };

        if ('waktu_shalat' in update_time){
            if (date_now = update_time['waktu_shalat'].toISOString().split('T')[0]){
                return;
            }
        }

        $.ajax({
            type: "get",
            url: url,
            dataType: "json",
            data: datasent,
            timeout: 15000,
            success: function (data) {
                saveVariable('waktu_shalat', data);

                $('#waktu-subuh').html(data.data.timings.Fajr);
                $('#waktu-dhuhur').html(data.data.timings.Dhuhr);
                $('#waktu-ashar').html(data.data.timings.Asr);
                $('#waktu-maghrib').html(data.data.timings.Maghrib);
                $('#waktu-isya').html(data.data.timings.Isha);

                update_time['waktu_shalat'] = new Date();
                refreshTabelShalat();
            },
            error: function (jqXHR, status, errorThrown) {
                console.log(`Error: `, jqXHR, errorThrown);

                var data = loadVariable('waktu_shalat');
                
                $('#waktu-subuh').html(data.data.timings.Fajr);
                $('#waktu-dhuhur').html(data.data.timings.Dhuhr);
                $('#waktu-ashar').html(data.data.timings.Asr);
                $('#waktu-maghrib').html(data.data.timings.Maghrib);
                $('#waktu-isya').html(data.data.timings.Isha);
            },
        });
    }
    catch (error) {
        console.log(`Error executing getWaktuShalat(): `, error);
    }
}

function getQuranMotivation() {
    try {
        var r, surah, ayah, edition, url;
        if ('quran_motivation' in update_time){
            if ((now - update_time['quran_motivation']) < 3600){
                return;
            }
        }

        r = Math.floor(Math.random() * surah_motivations.length);
        surah = surah_motivations[r][0];
        ayah = surah_motivations[r][1];
        edition = 'id.indonesian';

        url = `https://api.alquran.cloud/v1/ayah/${surah}:${ayah}`;

        $.ajax({
            type: "get",
            url: url,
            dataType: "json",
            timeout: 15000,
            success: function (data) {
                $(".motivation-arabic").html(data.data.text);
            },
            error: function (jqXHR, status, errorThrown) {
                console.log(`Error getQuranMotivation(): ${jqXHR} - ${errorThrown}`);
            },
        });

        $.ajax({
            type: "get",
            url: `${url}/${edition}`,
            dataType: "json",
            timeout: 15000,
            success: function (data) {
                $(".motivation-indonesia").html(data.data.text + ` (${data.data.surah.englishName} : ${data.data.numberInSurah})`);
            },
            error: function (jqXHR, status, errorThrown) {
                console.log(`Error getQuranMotivation(): ${jqXHR} - ${errorThrown}`);
            },
        });
    } catch(error) {
        console.log(`Error executing getQuranMotivation(): `, error);
    }
}

function ubah_str_waktu(number) {
    var number_str = '';
    number_str = String(number);

    if (number_str.length == 1) {
        number_str = '0' + number_str;
    }
    return number_str
}

function refreshTabelShalat() {
    var current_date = now.toISOString().split('T')[0];
    var param_shalat = {}, waktu_shalat_terdekat=10e10, shalat_terdekat;
    for (shalat of ['isya','maghrib','ashar','dhuhur','subuh']) {
        var params = {};
        params['waktu'] = $(`#waktu-${shalat}`).html();
        params['waktu_terdekat'] = new Date(`${current_date}T${params['waktu']}`);
        
        while ((params['waktu_terdekat'] - now) > 86400000){
            params['waktu_terdekat'].setDate(params['waktu_terdekat'].getDate() - 1);
        }
        while ((params['waktu_terdekat'] - now) < 0){
            params['waktu_terdekat'].setDate(params['waktu_terdekat'].getDate() + 1);
        }
        params['jarak'] = params['waktu_terdekat'] - now;
        if (params['jarak'] < waktu_shalat_terdekat){
            waktu_shalat_terdekat = params['jarak'];
            shalat_terdekat = shalat;
        }

        param_shalat[shalat] = params;
    }

    let time_diff = {
        'jam': Math.floor(waktu_shalat_terdekat / 1000 / 60 / 60),
        'min': Math.floor(waktu_shalat_terdekat / 1000 / 60) % 60,
        'det': Math.floor(waktu_shalat_terdekat / 1000) % 60
    };

    var message = `Waktu ${shalat_terdekat.at(0).toUpperCase()}${shalat_terdekat.slice(1)} kurang <b>`;
    var msgcount = 0;
    for (satuan in time_diff){
        if (msgcount > 1){break}
        msgcount += 1
        message += `${time_diff[satuan]} ${satuan} `;
    }
    message += '</b>';
    
    $('#shalat-message').html(message);
    $('.table-shalat tr').removeClass('active');
    $(`#waktu-${shalat_terdekat}`).parent().parent().addClass('active');
}

setInterval(() => {
    now = new Date();

    $('#hour').html(ubah_str_waktu(now.getHours()));
    $('#minute').html(ubah_str_waktu(now.getMinutes()));

    var calendar_date = '', hijri_date;
    var timezone;

    calendar_date = days[now.getDay()] + ', ' + ubah_str_waktu(now.getDate()) + ' ' + months[now.getMonth()] + ' ' + ubah_str_waktu(now.getFullYear());
    calendar_date += ' ' + ubah_str_waktu(now.getHours()) + ':' + ubah_str_waktu(now.getMinutes()) + ':' + ubah_str_waktu(now.getSeconds());
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    hijri_date = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn',{dateStyle:'long'}).format(now);

    switch (timezone) {
        case 'Asia/Jayapura':
            timezone = 'WIT';
            break;
        case 'Asia/Makassar':
            timezone = 'WITA';
            break;
        case 'Asia/Jakarta':
            timezone = 'WIB';
            break;
        default:
            break;
    }

    $('#day').html(calendar_date);
    $('#hijri-day').html(hijri_date);
    $('.timezone').html(timezone);
}, 1000);

setInterval(() => {
    refreshTabelShalat();
}, 60000);

setInterval(() => {
    getWaktuShalat();
    getQuranMotivation();
}, 600000);

getLocation();