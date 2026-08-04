var counter = 0;
var timeout = 60000;

var getJSON = function (url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function () {
        var status = xhr.status;
        if (status === 200) {
            callback(null, xhr.response);
        } else {
            callback(status, xhr.response);
        }
    };
    xhr.send();
};

function dict_to_table(data, Element) {
    let col = data.columns;
    let content = data.content;
    let page = 0;
    let limit = 0;
    let total = 0;

    if ('pagination' in data){
        if ('page' in data.pagination) {
            page = data.pagination.page;
        }
        if ('limit' in data.pagination) {
            limit = data.pagination.limit;
        }
        if ('total' in data.pagination) {
            total = data.pagination.total;
        }
    }

    // Create table.
    const table = document.createElement("table");
    table.className = 'table table-hover table-sm table-borderless';

    // Create table header row using the extracted headers above.
    let tr = table.insertRow(-1);                   // table row.

    for (let i = 0; i < col.length; i++) {
        let th = document.createElement("th");      // table header.
        th.innerHTML = col[i];
        tr.appendChild(th);
    }

    // add json data to the table as rows.
    if (content.length == 0) {
        tr = table.insertRow(-1);
        cell = tr.insertCell(-1);
        cell.setAttribute('colspan', col.length);
        cell.className = 'text-center';
        cell.innerHTML = "No updates";

    } else {
        for (let i = 0; i < content.length; i++) {
            tr = table.insertRow(-1);
            for (let j = 0; j < col.length; j++) {
                let tabCell = tr.insertCell(-1);
                tabCell.innerHTML = content[i][col[j]];
            }
        }
    }

    // Create number of pages
    for (let i = 0; i < parseInt(total / limit); i++) {
        const element = parseInt(total / limit);
    }

    // Create pagination elements
    const nav = document.createElement('nav');
    let ul = document.createElement('ul');
    ul.className = "pagination justify-content-center";


    // Now, add the newly created table with json data, to a container.
    Element.innerHTML = "";
    Element.appendChild(table);
}

async function refreshInformation() {
    var unitname = document.getElementById('unitselect').value;    
    document.getElementById('btn-unitselect').children[0].classList.add('fa-spin');
    $("#informations .filter .icon").html(`<i class="fas fa-pulse fa-spinner"></i>`);

    // try {
    //     $.getJSON("/service/dashboard/bat-information/" + unitname, {kind: 'informations'},
    //     function (data, textStatus, jqXHR) {

    var data = {"limit":1,"message":"","object":{"informations":[{"actions":[],"name":"Data Stream","status":true,"subname":"TJA1","subtitle":"of 578 updated &#60 <span class=\"text-success fw-bold\"> 8s </span> ","title":"578"},{"actions":[],"name":"Watchdog Status","status":true,"subname":"TJA1","subtitle":"No issue last <span class=\"text-success fw-bold\">6d 7h</span>","title":"Connected"},{"actions":[],"name":"Writing Data","status":true,"subname":"TJA1","subtitle":"No history","title":"0"}]},"page":0,"sent":{"unit":"TJA1"},"status":true,"total":1};
    if (data.status == false){ toastAlert(`${data.message}`); }
    
    document.getElementById('btn-unitselect').children[0].classList.remove('fa-spin');
    $("#informations .filter .icon").html(`<i class="fas fa-ellipsis-vertical"></i>`);
    document.getElementById('informations').innerHTML = '';

    if ('object' in data) {
        var informations = data.object.informations;
        
        try {
            htmlcontent = '';
            for (const i in informations) {
                var information = informations[i];
                information.color = 'danger';
                information.fa = 'fa-unlink';
                if (information.status){
                    information.color = 'success';
                    information.fa = 'fa-link';
                }

                var information_actions = ``;
                for (const action in information.actions){
                    information_actions += `<li><a class="dropdown-item" href="#">${ action }</a></li>`;
                }

                htmlcontent += `
                    <div class="col-lg-6 col-xxl-4">
                        <div class="card info-card sales-card">
                            <div class="filter">
                                <a class="icon" href="#" data-bs-toggle="dropdown"><i class="fas fa-ellipsis-vertical"></i></a>
                                <ul class="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
                                    <li><a class="dropdown-item" href="#" onclick="refreshInformation();">Refresh</a></li>
                                ${ information_actions }
                                </ul>
                            </div>
                            <div class="card-body">
                                <h5 class="card-title">${ information.name } <span>| ${ information.subname }</span></h5>
                                <div class="d-flex align-items-center">
                                    <div class="card-icon rounded-circle d-flex align-items-center justify-content-center text-${information.color}">
                                        <i class="fas ${information.fa}"></i>
                                    </div>
                                    <div class="ps-3">
                                        <h6>${ information.title }</h6>
                                        <span class="text-muted small pt-2 ps-1">${ information.subtitle }</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
            }
            document.getElementById('informations').innerHTML = htmlcontent;
        } catch (error) {
            console.log(error);
        }
    }
    //     }
    //     );
    // } catch (error) {
    //     document.getElementById('btn-unitselect').children[0].classList.remove('fa-spin');
    //     $("#informations .filter .icon").html(`<i class="fas fa-ellipsis-vertical"></i>`);
    // }
}

async function refreshAlarmHistory() {
    var unitname = document.getElementById('unitselect').value;    
    document.getElementById('btn-unitselect').children[0].classList.add('fa-spin');
    $("#alarm-history .filter .icon").html(`<i class="fas fa-pulse fa-spinner"></i>`);

    // try {
    //     $.getJSON("/service/dashboard/bat-information/" + unitname, {kind: 'alarm_history'},
    //         function (data, textStatus, jqXHR) {
    
    var data = {"limit":1,"message":"","object":{"alarm_history":[{"description":"SYSFAULT","module":"SOPT","timedelta":"5d 1h","timestamp":"Wed, 20 Mar 2024 08:32:36 GMT"},{"description":"SYSFAULT","module":"SOPT","timedelta":"6d 14h","timestamp":"Mon, 18 Mar 2024 19:27:22 GMT"},{"description":"SYSFAULT","module":"SOPT","timedelta":"10d","timestamp":"Fri, 15 Mar 2024 09:18:13 GMT"},{"description":"SYSFAULT","module":"SOPT","timedelta":"12d 20h","timestamp":"Tue, 12 Mar 2024 13:50:56 GMT"},{"description":"SYSFAULT","module":"SOPT","timedelta":"12d 20h","timestamp":"Tue, 12 Mar 2024 13:49:20 GMT"},{"description":"SYSFAULT","module":"SOPT","timedelta":"12d 20h","timestamp":"Tue, 12 Mar 2024 13:42:36 GMT"},{"description":"SYSFAULT","module":"SOPT","timedelta":"14d 12h","timestamp":"Sun, 10 Mar 2024 21:20:02 GMT"},{"description":"SYSFAULT","module":"SOPT","timedelta":"14d 17h","timestamp":"Sun, 10 Mar 2024 17:09:12 GMT"},{"description":"SYSFAULT","module":"SOPT","timedelta":"14d 17h","timestamp":"Sun, 10 Mar 2024 17:07:32 GMT"},{"description":"Sootblow not response 902","module":"SOPT","timedelta":"14d 17h","timestamp":"Sun, 10 Mar 2024 17:01:29 GMT"},{"description":"Sootblow not response 902","module":"SOPT","timedelta":"14d 18h","timestamp":"Sun, 10 Mar 2024 15:17:03 GMT"},{"description":"Sootblow not response 902","module":"SOPT","timedelta":"14d 19h","timestamp":"Sun, 10 Mar 2024 15:10:09 GMT"},{"description":"Sootblow not response 902","module":"SOPT","timedelta":"14d 20h","timestamp":"Sun, 10 Mar 2024 14:08:49 GMT"},{"description":"Sootblow not response 901","module":"SOPT","timedelta":"14d 20h","timestamp":"Sun, 10 Mar 2024 13:51:08 GMT"},{"description":"Sootblow not response 901","module":"SOPT","timedelta":"14d 21h","timestamp":"Sun, 10 Mar 2024 13:14:59 GMT"},{"description":"Sootblow not response 901","module":"SOPT","timedelta":"14d 21h","timestamp":"Sun, 10 Mar 2024 12:58:09 GMT"},{"description":"Sootblow not response 901","module":"SOPT","timedelta":"14d 21h","timestamp":"Sun, 10 Mar 2024 12:32:05 GMT"},{"description":"SB TEMP CTRL V Fault","module":"SOPT","timedelta":"14d 21h","timestamp":"Sun, 10 Mar 2024 12:23:26 GMT"},{"description":"SYSFAULT","module":"SOPT","timedelta":"15d 3h","timestamp":"Sun, 10 Mar 2024 06:59:50 GMT"},{"description":"SYSFAULT","module":"SOPT","timedelta":"15d 18h","timestamp":"Sat, 09 Mar 2024 15:26:30 GMT"},{"description":"SYSFAULT","module":"SOPT","timedelta":"15d 18h","timestamp":"Sat, 09 Mar 2024 15:20:16 GMT"},{"description":"SYSFAULT","module":"SOPT","timedelta":"15d 19h","timestamp":"Sat, 09 Mar 2024 15:15:41 GMT"},{"description":"SYSFAULT","module":"SOPT","timedelta":"15d 19h","timestamp":"Sat, 09 Mar 2024 15:10:30 GMT"},{"description":"SYSFAULT","module":"SOPT","timedelta":"15d 19h","timestamp":"Sat, 09 Mar 2024 14:52:12 GMT"},{"description":"Sootblow not response 813","module":"SOPT","timedelta":"15d 20h","timestamp":"Sat, 09 Mar 2024 13:35:17 GMT"},{"description":"Sootblow not response 401","module":"SOPT","timedelta":"15d 20h","timestamp":"Sat, 09 Mar 2024 13:19:11 GMT"},{"description":"Sootblow not response 401","module":"SOPT","timedelta":"15d 21h","timestamp":"Sat, 09 Mar 2024 13:13:16 GMT"},{"description":"Sootblow not response 401","module":"SOPT","timedelta":"15d 21h","timestamp":"Sat, 09 Mar 2024 13:04:01 GMT"},{"description":"Sootblow not response 207","module":"SOPT","timedelta":"15d 21h","timestamp":"Sat, 09 Mar 2024 12:34:54 GMT"},{"description":"Sootblow not response 106","module":"SOPT","timedelta":"15d 21h","timestamp":"Sat, 09 Mar 2024 12:19:18 GMT"},{"description":"Sootblow not response 206","module":"SOPT","timedelta":"15d 22h","timestamp":"Sat, 09 Mar 2024 12:12:44 GMT"},{"description":"No.3 Drain V Fault","module":"SOPT","timedelta":"15d 22h","timestamp":"Sat, 09 Mar 2024 12:03:02 GMT"},{"description":"SB Press V Fault","module":"SOPT","timedelta":"15d 23h","timestamp":"Sat, 09 Mar 2024 10:39:34 GMT"},{"description":"SYSFAULT","module":"SOPT","timedelta":"16d","timestamp":"Sat, 09 Mar 2024 09:27:41 GMT"},{"description":"SYSFAULT","module":"SOPT","timedelta":"16d","timestamp":"Sat, 09 Mar 2024 09:23:59 GMT"},{"description":"SYSFAULT","module":"SOPT","timedelta":"16d","timestamp":"Sat, 09 Mar 2024 09:22:34 GMT"},{"description":"SYSFAULT","module":"SOPT","timedelta":"16d","timestamp":"Sat, 09 Mar 2024 09:22:30 GMT"},{"description":"SYSFAULT","module":"SOPT","timedelta":"16d","timestamp":"Sat, 09 Mar 2024 09:22:02 GMT"},{"description":"SYSFAULT","module":"SOPT","timedelta":"16d 1h","timestamp":"Sat, 09 Mar 2024 08:52:23 GMT"},{"description":"Sootblow not response 214","module":"SOPT","timedelta":"16d 15h","timestamp":"Fri, 08 Mar 2024 18:24:50 GMT"},{"description":"Sootblow not response 214","module":"SOPT","timedelta":"16d 15h","timestamp":"Fri, 08 Mar 2024 18:15:53 GMT"},{"description":"Sootblow not response 313","module":"SOPT","timedelta":"16d 16h","timestamp":"Fri, 08 Mar 2024 18:00:58 GMT"},{"description":"SYSFAULT","module":"SOPT","timedelta":"16d 22h","timestamp":"Fri, 08 Mar 2024 11:17:11 GMT"},{"description":"No.3 Drain V Fault","module":"SOPT","timedelta":"17d 4h","timestamp":"Fri, 08 Mar 2024 05:43:19 GMT"},{"description":"SB Press V Fault","module":"SOPT","timedelta":"17d 8h","timestamp":"Fri, 08 Mar 2024 01:45:55 GMT"},{"description":"SYSFAULT","module":"SOPT","timedelta":"17d 16h","timestamp":"Thu, 07 Mar 2024 17:21:08 GMT"},{"description":"SYSFAULT","module":"SOPT","timedelta":"17d 16h","timestamp":"Thu, 07 Mar 2024 17:16:57 GMT"},{"description":"SYSFAULT","module":"SOPT","timedelta":"17d 18h","timestamp":"Thu, 07 Mar 2024 16:03:07 GMT"},{"description":"Safeguard not Enable [FURNACE PRESSURE]","module":"SOPT","timedelta":"17d 20h","timestamp":"Thu, 07 Mar 2024 13:21:00 GMT"},{"description":"SB Press V Fault","module":"SOPT","timedelta":"17d 23h","timestamp":"Thu, 07 Mar 2024 10:24:49 GMT"}]},"page":0,"sent":{"unit":"TJA1"},"status":true,"total":1};

    if (data.status == false){ toastAlert(`${data.message}`); }
    
    document.getElementById('btn-unitselect').children[0].classList.remove('fa-spin');
    $("#alarm-history .filter .icon").html(`<i class="fas fa-ellipsis-vertical"></i>`);

    if ('object' in data) {
        var alarm_history = data.object.alarm_history;
        try {
            
            htmlcontent = '';
            for (const i in alarm_history) {
                var date = alarm_history[i]['timedelta'];
                var event = alarm_history[i]['description'];
                var color = 'text-info';
                if (alarm_history[i]['module'] == "SOPT"){
                    color = 'text-warning';
                }
                
                htmlcontent += `
                    <div class="activity-item d-flex"> 
                        <div class="activite-label text-end">${date}</div> 
                        <i class="fas fa-xs fa-circle me-2 activity-badge ${color} align-self-start"></i> 
                        <div class="activity-content"> ${event} </div> 
                    </div>`;
            }
            document.getElementById('alarmHistory').innerHTML = htmlcontent;
        } catch (error) {
            console.log(error);
        }
    }
    //         }
    //     );
    // } catch (error) {
    //     document.getElementById('btn-unitselect').children[0].classList.remove('fa-spin');
    //     $("#alarm-history .filter .icon").html(`<i class="fas fa-ellipsis-vertical"></i>`);
    // }
}

async function refreshBATStatus() {
    var unitname = document.getElementById('unitselect').value;
    document.getElementById('btn-unitselect').children[0].classList.add('fa-spin');
    $("#bat-status .filter .icon").html(`<i class="fas fa-pulse fa-spinner"></i>`);

    // try {
    //     $.getJSON("/service/dashboard/bat-information/" + unitname, {kind: 'bat_status'},
    //         function (data, textStatus, jqXHR) {

    var data = {"limit":1,"message":"","object":{"bat_status":{"columns":["No.","Module","Status","Note"],"content":[{"Module":"COPT","No.":1,"Note":"Disabled since 96d 11h ago.","Status":"<span class='badge bg-danger'>Disabled</span>"},{"Module":"SOPT","No.":2,"Note":"Disabled since 14d 17h ago.","Status":"<span class='badge bg-danger'>Disabled</span>"}],"subtitle":"PLTU Tanjung Awar-Awar 1","title":"BAT Module Status"}},"page":0,"sent":{"unit":"TJA1"},"status":true,"total":1};

    if (data.status == false){ toastAlert(`${data.message}`); }
    
    document.getElementById('btn-unitselect').children[0].classList.remove('fa-spin');
    $("#bat-status .filter .icon").html(`<i class="fas fa-ellipsis-vertical"></i>`);

    if ('object' in data) {
        var bat_status = data.object.bat_status;
        try {
            var Element = document.getElementById('BATModuleStatus')
            dict_to_table(bat_status, Element);
        } catch (error) {
            console.log(error);
        }

        document.getElementById('BATModuleStatus-title').innerHTML = `${bat_status.title} <span> / ${bat_status.subtitle}</span>`
    }
    //         }
    //     );
    // } catch (error) {
    //     document.getElementById('btn-unitselect').children[0].classList.remove('fa-spin');
    //     $("#bat-status .filter .icon").html(`<i class="fas fa-ellipsis-vertical"></i>`);
    // }
}

function refreshHome(){
    refreshAlarmHistory();
    refreshBATStatus();
    refreshInformation();
}

$(document).ready(function () {
    console.log('Ready!');
    refreshHome();

    $(function(){
        setInterval(refreshHome, timeout);
    });
});