const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

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
    [hijri_day, hijri_month, hijri_year,_] = hijri_date.split(' ');
    [hijri_en_day, hijri_en_month, hijri_en_year,_] = hijri_en_date.split(' ');
    

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
}

function shalatTime() {
    var date = new Date(); // today
    var PT = new PrayTimes('Egypt');
	var times = PT.getTimes(date, [mylocation['latitude'], mylocation['longitude']]);
	var list = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Midnight'];

    console.log(times);
	for(var i in list)	{
        $(`.shalat-time.shalat-${list[i].toLowerCase()}`).html(times[list[i].toLowerCase()]);
	}
}

function reloadLocation() {
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
reloadLocation();
shalatTime();

setInterval(() => {
    perSecond();
}, 1000);

// setInterval(() => {
//     location.reload(true);
// }, 10000);