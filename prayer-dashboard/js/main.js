const debug_mode = false;
const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const shalats = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const settingsModal = new bootstrap.Modal('#settingsModal');
const toastSuccess = new bootstrap.Toast('#toastAlert');
const update_time = {
    'shalat_time': {
        last_update: new Date('2001-01-01 00:00'),
        interval: 600000
    }
}

let S = new Shalat(mylocation);
let is_iqamah = false;
let is_beeping = false;

function toastAlert(text){
    $('#toast-message').html(text);
    toastSuccess.show();
}

function time2str(angka) {
    angka = String(angka);
    while (angka.length < 2) {
        angka = `0${angka}`;
    }
    return angka
}

function beep1x(duration=500) {
    let audioCtx = new(window.AudioContext || window.webkitAudioContext)();
    let oscillator = audioCtx.createOscillator();
    let gainNode = audioCtx.createGain();
  
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
  
    gainNode.gain.value = 0.5;
    oscillator.frequency.value = 1200;
    oscillator.type = 'sine';
  
    oscillator.start();
  
    setTimeout(
        function() {
            oscillator.stop();
        },
        duration
    );
};

function beep3x() {
    beep1x();
    setTimeout(function() {beep1x();},1000);
    setTimeout(function() {beep1x();},2000);
    setTimeout(function() {beep1x();},3000);
    setTimeout(function() {beep1x(1400);},4000);
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

    if (!debug_mode){
        for (var name in S.shalat_names){
            var s = S.shalat_names[name];
            if (s['is_shalat']){
                var c = S.shalat_time[name.toLowerCase()];
                var iq = parseFloat($(`#interval-iqamah-${name.toLowerCase()}`).val())
                if ((moment.duration(moment().diff(moment(c, 'HH:mm'))) < moment.duration(iq, 'm')) &
                    (moment().diff(moment(c, 'HH:mm')) > 0) ){
                    is_iqamah = true;
                    break;
                }
            }
            is_iqamah = false;
        }
    }

    if (is_iqamah){
        var least_time = S.get_ordered_shalat_time_left().pop();
        var least_shalat = S.shalat_time_left[least_time]['name'];
        var next_shalat_time = moment(S.shalat_time[least_shalat.toLowerCase()], 'HH:mm');
        // var iqamah_time = next_shalat_time.add(10,'m');
        var iqamah_time = next_shalat_time.add(parseFloat($(`#interval-iqamah-${least_shalat.toLowerCase()}`).val()), 'm');
        var iqamah_time_left = moment.duration(iqamah_time.diff());
        
        if (!$(`#iqamah-board`).hasClass('active')){
            $(`#iqamah-board`).addClass('transition');

            window.setTimeout(function(){
                $(`#iqamah-board`).addClass('active');
                $(`#iqamah-board`).removeClass('transition');
            }, 200);
        }
        $(`.shalat-current`).html(`${least_shalat}`);
        $(`.iqamah-time-left`).html(`${S._convert_number_to_n_digit_(iqamah_time_left.minutes(),2)}:${S._convert_number_to_n_digit_(iqamah_time_left.seconds(),2)}`);

        if ((iqamah_time_left.asSeconds() < 6) & (!is_beeping)){
            is_beeping = true;
            beep3x();
        }
    }
    else {
        $(`#iqamah-board`).removeClass('transition');
        $(`#iqamah-board`).removeClass('active');
        is_beeping = false;
    }

    // Update shalat time
    if (mylocation.status & ((now - update_time['shalat_time']['last_update']) > update_time['shalat_time']['interval'])){
        console.log('Updating shalat time ... ', moment(now).format('HH:mm:ss'));
        S.location = mylocation;
        S.update_shalat_time();
        S.show_shalat_time();
        S.show_current_shalat();
        update_time['shalat_time']['last_update'] = now;
    }
    else if (!mylocation.status) {
        console.log('Waiting to mylocation change to true ...');
    }
}

if (debug_mode){
    document.addEventListener('keydown', function(e) {
        if (e.key === "Escape") {
            is_iqamah = false;
        } 
        if (e.key === "I") {
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
}

$('#update-settings').click( function() {
    var position = {
        coords: {
            latitude: parseFloat($('#latitude').val()),
            longitude: parseFloat($('#longitude').val())
        }
    };
    savePreciseLocation(position);
    S.location = mylocation;
    S.method = $('#shalat-time-method').val();
    S.update_shalat_time();
    S.show_shalat_time();

    settingsModal.hide();
    window.setTimeout(function(){
        toastAlert('Settings has been saved!');
    }, 200);
})

perSecond();
detectPreciseLocation();

setInterval(() => {
    perSecond();
}, 1000);

// setInterval(() => {
//     location.reload(true);
// }, 10000);