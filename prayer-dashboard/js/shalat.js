class Shalat {
    constructor(location, method="Egypt"){
        this.date = new Date();
        this.location = location;
        this.method = method;
        this.praytimes = new PrayTimes(this.method);
        this.shalat_time = this.praytimes.getTimes(this.date, [location['latitude'], location['longitude']]);

        // force
        this.force_shalat_time();

        this.shalat_time_left = {};
        this.shalat_names = {
            Fajr: {id: 'Subuh', ar: 'الصبح', is_shalat: true},
            Sunrise: {id: 'Sunrise', ar: 'شروق', is_shalat: false},
            Dhuhr: {id: 'Dhuhur', ar: 'الظهر', is_shalat: true},
            Asr: {id: 'Ashar', ar: 'عصر', is_shalat: true},
            Maghrib: {id: 'Maghrib', ar: 'المغرب', is_shalat: true},
            Isha: {id: 'Isya', ar: 'العشاء', is_shalat: true},
            Midnight: {id: 'Midnight', ar: 'منتصف الليل', is_shalat: false}
        }
    }

    _convert_number_to_n_digit_(number, n_digit){
        number = parseFloat(number);
        let ret = String(number);
        if (number < 0){
            number = number * -1;    
        }
        while (ret.length < n_digit){
            ret = '0' + ret;
        }
        return ret
    }

    _convert_moment_to_time_(moment_time) {
        return `${this._convert_number_to_n_digit_(moment_time.hours(),2)}:${this._convert_number_to_n_digit_(moment_time.minutes(),2)}:${this._convert_number_to_n_digit_(moment_time.seconds(),2)}`
    }

    force_shalat_time () {
        // this.shalat_time['asr'] = '16:56';
        return null;
    }

    update_shalat_time() {
        this.date = new Date();
        this.praytimes = new PrayTimes(this.method);
        this.shalat_time = this.praytimes.getTimes(this.date, [this.location['latitude'], this.location['longitude']]);

        this.force_shalat_time();
    }

    show_shalat_time(){
        for(var i in this.shalat_names)	{
            var tl = this.get_shalat_time_left(i);
            $(`.shalat-${i.toLowerCase()} .shalat-name`).html(this.shalat_names[i]['ar']);
            $(`.shalat-${i.toLowerCase()} .shalat-name-en`).html(i);
            $(`.shalat-${i.toLowerCase()} .shalat-time`).html(this.shalat_time[i.toLowerCase()]);
            $(`.shalat-${i.toLowerCase()} .shalat-time-left`).html(`${tl}`);
        }
    }

    show_shalat_time_left() {
        for (var i in this.shalat_names) {
            var tl = this.get_shalat_time_left(i);
            $(`.shalat-${i.toLowerCase()} .shalat-time-left`).html(`${tl}`);
        }
    }

    show_current_shalat() {
        $(`.shalat-card.slick-current`).removeClass('slick-current');

        var ordered_time_shalat = this.get_ordered_shalat_time_left();
        var least_time = ordered_time_shalat[0];
        var least_shalat = this.shalat_time_left[least_time].name;
        $(`.shalat-${least_shalat.toLowerCase()}`).addClass('slick-current');
        $(`.shalat-slick`).slick('slickGoTo', this.shalat_time_left[least_time].index);
    }

    get_shalat_time_left(shalat_name){
        if (Object.keys(this.shalat_names).includes(shalat_name)){
            let now = moment();
            let stime = moment(this.shalat_time[shalat_name.toLowerCase()], "HH:mm");
            if (stime < now){
                stime = stime.add(1, 'day');
            }
            return '-' + this._convert_moment_to_time_(moment.duration(stime.diff(now)));
        }
        else {
            return console.error(`Please provide one of the following shalat name: ${Object.keys(this.shalat_names)}`);
        }
    }

    get_ordered_shalat_time_left() {
        var i = 0;
        this.shalat_time_left = {};
        for (var s in this.shalat_names){
            var time = this.get_shalat_time_left(s);
            this.shalat_time_left[time] = {index: i, name: s, time: time};
            i += 1;
        }
        var ret = Object.keys(this.shalat_time_left);
        ret.sort();
        return ret
    }
}
