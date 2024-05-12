const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const shalats = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Midnight'];

var mylocation = {
    city: null,
    region: null,
    country: null,
    latitude: -4,
    longitude: 103
}

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

    test();
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
                longitude: data.longitude
            }
            $('.location').html(`${mylocation['city']}, ${mylocation['country']}`);
            shalatTime();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

perSecond();
detectLocation();
shalatTime();

setInterval(() => {
    perSecond();
}, 1000);

// setInterval(() => {
//     location.reload(true);
// }, 10000);