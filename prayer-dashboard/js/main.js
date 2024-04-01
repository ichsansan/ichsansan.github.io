const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

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
    let hijri_date = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { dateStyle: 'long' }).format(now);

    $('.hour').html(`${time2str(now.getHours())}:${time2str(now.getMinutes())}`);
    $('.second').html(`${time2str(now.getSeconds())}`);
    $('.date-ar').html(`${hijri_date}`);
    $('.date-la').html(`${latin_date}`);
}

function shalatTime() {
    var date = new Date(); // today
    var PT = new PrayTimes('Eqypt');
	var times = PT.getTimes(date, [-4.141395864415774, 137.09345057257082], 9);
	var list = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Midnight'];

    console.log(times);
	for(var i in list)	{
        $(`.shalat-time.shalat-${list[i].toLowerCase()}`).html(times[list[i].toLowerCase()]);
	}
}

shalatTime();

perSecond();
setInterval(() => {
    perSecond();
}, 1000);

// setInterval(() => {
//     location.reload(true);
// }, 10000);