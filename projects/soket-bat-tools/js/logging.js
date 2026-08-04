function getFormattedDateTime() {
    var now = new Date();

    var year = now.getFullYear();
    var month = (now.getMonth() + 1).toString().padStart(2, '0'); // Menambahkan leading zero jika diperlukan
    var day = now.getDate().toString().padStart(2, '0');
    var hours = now.getHours().toString().padStart(2, '0');
    var minutes = now.getMinutes().toString().padStart(2, '0');
    var seconds = now.getSeconds().toString().padStart(2, '0');

    var formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedDateTime;
}

$(document).ready(() => {
    var datasend = { };

    datasend['endpoint'] = window.location.pathname;
    datasend['user_agent'] = window.navigator.userAgent;
    datasend['lang_id'] = window.navigator.language;
    datasend['screen'] = `${window.screen.width}x${window.screen.height}`;
    datasend['local_time'] = getFormattedDateTime();

    $.getJSON("https://geolocation-db.com/json/",
        function (data) {
            var location = '';
            if (data.city) { location += `${data.city}, `; }
            if (data.state) { location += `${data.state}, `; }
            if (data.country_name) { location += `${data.country_name}`; }

            datasend['ip_address'] = data.IPv4;
            datasend['location'] = location;

            $.get("https://35.199.162.129:5001/savelog", datasend)
        })
});