class SunImage {
    constructor(selector) {
        this.svg = SVG(selector);
        this.viewbox = this.svg.viewBox;
        this.w = 1000; //this.viewbox['w'];
        this.h = 300; //this.viewbox['h'];
        this.shift = -300;
        this.horizon_line = 125;
        this.praytimes = new PrayTimes();

        this.now = moment();
        this.pos = (3600 * this.now.hours() + 60 * this.now.minutes() + this.now.seconds()) / 86.4;

        this.day_poly = this.svg.polyline('0,0').fill('#fec').stroke('none');
        this.night_poly = this.svg.polyline('0,0').fill('#1355').stroke('none');
        this.sunpath = this.svg.polyline('0,0').fill('none').stroke({ width: 2, color: '#679' });
        this.horizon = this.svg.line([[0, this.horizon_line], [1000, this.horizon_line]]).stroke({ width: 2, color: '#89a' });
        this.sun = this.svg.circle(20).fill('#fe7').stroke({ width: 3, color: '#eca' }).move(500,12.5);
        
        this.sunrise_text = this.svg.text('Sunrise').move(240, this.horizon_line);
        this.sunset_text = this.svg.text('Sunset').move(700, this.horizon_line);
    };

    sun_y_function(x) {
        return (Math.sin((x * 2 * Math.PI / this.w) + this.shift) * 100) + 120;
    }

    update() {
        var line = [];
        var poly1 = [[0, this.horizon_line]];
        var poly2 = [];

        this.now = moment();
        this.pos = (3600 * this.now.hours() + 60 * this.now.minutes() + this.now.seconds()) / 86.4;

        var x = 0;
        for (x = 0; x < this.w; x++) {
            var y = this.sun_y_function(x);

            line.push([x, y]);
            if ((y >= this.horizon_line) & (x < this.pos)) { poly1.push([x, y]); }
            if ((y <= this.horizon_line) & (x < this.pos)) { poly2.push([x, y]); }
        }
        var y = this.sun_y_function(this.pos);

        poly1.push([this.pos, this.horizon_line]);
        poly2.push([this.pos, this.horizon_line]);

        this.sunpath.plot(line);
        this.night_poly.plot(poly1);
        this.day_poly.plot(poly2);

        this.sun.animate(200).move(this.pos - (this.sun.bbox()['w'] / 2), y - (this.sun.bbox()['h'] / 2));
    }
}
