const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const shalats = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const update_time = {
    'shalat_time': new Date('2001-01-01 00:00'),
}

let mylocation = {
    city: null,
    region: null,
    country: null,
    latitude: -4,
    longitude: 103,
    status: false
}

let S = new Shalat(mylocation);
let is_iqamah = true;

function time2str(angka) {
    angka = String(angka);
    while (angka.length < 2) {
        angka = `0${angka}`;
    }
    return angka
}

function perSecond() {
    let now = new Date();
    let latin_date = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`
    let hijri_formatter = new Intl.DateTimeFormat('ar', {
        year: 'numeric',
        month: 'long', // Bulan dalam bahasa Arab
        day: 'numeric',
        calendar: 'islamic-civil' // Gunakan kalender Hijriyah
    });
    // let hijri_date = hijri_formatter.format(now);
    let hijri_day, hijri_month, hijri_year, hijri_en_day, hijri_en_month, hijri_en_year;
    let hijri_date = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { dateStyle: 'long' }).format(now);
    let hijri_en_date = new Intl.DateTimeFormat('id-SA-u-ca-islamic', { dateStyle: 'long' }).format(now);

    // Mode: splitting
    [hijri_day, hijri_month, hijri_year,_] = hijri_date.split(' ');
    [hijri_en_day, hijri_en_month, hijri_en_year,_] = hijri_en_date.split(' ');

    // Mode: regex
    hijri_year = hijri_date.match("[\u0660-\u0669]{3,4}")[0];
    hijri_month = hijri_date.match("[\u0591-\u0660\s ]{4,100}")[0];
    hijri_day = hijri_date.match("^[\u0660-\u0669]{1,2}")[0];

    $('.hour').html(`${time2str(now.getHours())}:${time2str(now.getMinutes())}`);
    $('.second').html(`${time2str(now.getSeconds())}`);
    // $('.tz').html(`${time2str(now.getTimezoneOffset())}`);
    // $('.date-ar').html(`${hijri_date}`);
    $('.ar-ar-year').html(`${hijri_year}`);
    $('.ar-ar-month').html(`${hijri_month}`);
    $('.ar-ar-date').html(`${hijri_day}`);
    $('.ar-en-year').html(`${hijri_en_year}`);
    $('.ar-en-month').html(`${hijri_en_month}`);
    $('.ar-en-date').html(`${hijri_en_day}`);
    
    if (mylocation.status){ 
        S.show_shalat_time_left();
    }

    for (var name in S.shalat_names){
        var s = S.shalat_names[name];
        if (s['is_shalat']){
            var c = S.shalat_time[name.toLowerCase()];
            if ((moment.duration(moment().diff(moment(c, 'HH:mm'))) < moment.duration(10, 'm')) &
                (moment().diff(moment(c, 'HH:mm')) > 0) ){
                is_iqamah = true;
                break;
            }
        }
        is_iqamah = false;
    }

    if (is_iqamah){
        var least_time = S.get_ordered_shalat_time_left().pop();
        var least_shalat = S.shalat_time_left[least_time]['name'];
        var next_shalat_time = moment(S.shalat_time[least_shalat.toLowerCase()], 'HH:mm');
        var iqamah_time = next_shalat_time.add(10,'m');
        var iqamah_time_left = moment.duration(iqamah_time.diff());
        
        if (!$(`#iqamah-board`).hasClass('active')){
            $(`#iqamah-board`).addClass('transition');
        }
        window.setTimeout(function(){
            $(`#iqamah-board`).addClass('active');
            $(`#iqamah-board`).removeClass('transition');
        }, 200);
        $(`.shalat-current`).html(`${least_shalat}`);
        $(`.iqamah-time-left`).html(`${S._convert_number_to_n_digit_(iqamah_time_left.minutes(),2)}:${S._convert_number_to_n_digit_(iqamah_time_left.seconds(),2)}`);
    }
    else {
        $(`#iqamah-board`).removeClass('transition');
        $(`#iqamah-board`).removeClass('active');
        
        console.log('remove transition & active ...');
    }

    // Update shalat time
    if (mylocation.status & ((now - update_time['shalat_time']) > 60000)){
        console.log('Updating shalat time ... ', moment(now).format('HH:mm:ss'));
        S.location = mylocation;
        S.update_shalat_time();
        S.show_shalat_time();
        S.show_current_shalat();
        update_time['shalat_time'] = now;
    }
    else if (!mylocation.status) {
        console.log('Waiting to mylocation change to true ...');
    }
}

function test(){
    now = moment();

    for (let i = 0; i < shalats.length; i++) {
        let shalat, shalat_time, duration;
        shalat = shalats[i];
        shalat_time = $(`.shalat-${shalat.toLowerCase()} .shalat-time`).html();
        shalat_time = moment(shalat_time, "HH:mm");

        if ((shalat_time != undefined) & (shalat != undefined)){
            while (now.isAfter(shalat_time)){
                shalat_time = shalat_time.add(1,'d');
            }
            duration = moment.duration(shalat_time.diff(now));
            
            $(`.shalat-${shalat.toLowerCase()} .shalat-time-left`).html(`- ${duration.hours()}:${duration.minutes()}:${duration.seconds()}`);
        }
    }
}

function shalatTime() {
    var date = new Date(); // today
    var PT = new PrayTimes('Egypt');
	var times = PT.getTimes(date, [mylocation['latitude'], mylocation['longitude']]);
	
    let shalat_name = {
        Fajr: {id: 'Subuh', ar: 'الصبح'},
        Sunrise: {id: 'Syuruq', ar: 'شروق'},
        Dhuhr: {id: 'Dhuhur', ar: 'الظهر'},
        Asr: {id: 'Ashar', ar: 'عصر'},
        Maghrib: {id: 'Maghrib', ar: 'المغرب'},
        Isha: {id: 'Isya', ar: 'العشاء'},
        Midnight: {id: 'Tengah Malam', ar: 'منتصف الليل'},
    }

    console.log(times);
	for(var i in shalats)	{
        $(`.shalat-${shalats[i].toLowerCase()} .shalat-name`).html(shalat_name[shalats[i]]['ar']);
        $(`.shalat-${shalats[i].toLowerCase()} .shalat-name-en`).html(shalats[i]);
        $(`.shalat-${shalats[i].toLowerCase()} .shalat-time`).html(times[shalats[i].toLowerCase()]);
	}
}

function detectLocation() {
    // URL endpoint GeoIP API
    var apiUrl = 'https://api.ipbase.com/v1/json/';

    // Mengirimkan permintaan HTTP GET ke API
    fetch(apiUrl)
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
            // shalatTime();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

document.addEventListener('keydown', function(e) {
    if (e.key === "Escape") {
        is_iqamah = false;
    } 
    if (e.key === "A") {
        if (is_iqamah){
            console.log('Turn off iqamah mode ...');
            is_iqamah = false;
        }
        else {
            console.log('Turn on iqamah mode ...');
            is_iqamah = true;
        }
    }
    if (e.key === 'T') {
        $("#iqamah-board").toggleClass('transition');
    }
})

perSecond();
detectLocation();

setInterval(() => {
    perSecond();
}, 1000);

// setInterval(() => {
//     location.reload(true);
// }, 10000);