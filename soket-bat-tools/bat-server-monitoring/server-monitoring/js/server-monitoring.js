var update_rate = 30000;

function updateTable() {
    console.log('Updating ...');
    var data = { server: $('#server').val(), hostname: $('#hostname').val() };
    $('#card-title').html(`Server Details - ${data['server']}`);

    // $.get("/service/bat-server-monitoring/server-information", data,
    //     function (data, textStatus, jqXHR) {

    var data = {"limit":1,"message":"","object":{"details":{"disk_usage":[{"name":"Total","percentage":61.05,"text":"717.35G of 1.15T","total":1.15,"unit":"TB"},{"name":"devtmpfs","percentage":20.13,"text":"3.11G of 15.51G","total":15.51,"unit":"GB"},{"name":"tmpfs","percentage":0,"text":"0 of 15.54G","total":15.54,"unit":"GB"},{"name":"tmpfs","percentage":10.01,"text":"1.56G of 15.54G","total":15.54,"unit":"GB"},{"name":"tmpfs","percentage":0,"text":"0 of 15.54G","total":15.54,"unit":"GB"},{"name":"/dev/mapper/cl_dgateway-root","percentage":14.05,"text":"14.04G of 99.95G","total":99.95,"unit":"GB"},{"name":"/dev/sda2","percentage":33.88,"text":"340.12M of 1004.0M","total":1004,"unit":"MB"},{"name":"/dev/mapper/cl_dgateway-home","percentage":68.63,"text":"685.91G of 999.5G","total":999.5,"unit":"GB"},{"name":"tmpfs","percentage":0,"text":"0 of 3.11G","total":3.11,"unit":"GB"},{"name":"tmpfs","percentage":0,"text":"4.0K of 3.11G","total":3.11,"unit":"GB"},{"name":"tmpfs","percentage":0,"text":"0 of 3.11G","total":3.11,"unit":"GB"},{"name":"tmpfs","percentage":0,"text":"0 of 3.11G","total":3.11,"unit":"GB"}],"memory_usage":[{"name":"Mem:","percentage":7.45,"text":"2.32G of 31.08G","total":31.08,"unit":"GB"},{"name":"Swap:","percentage":2.32,"text":"373.35M of 15.7G","total":15.7,"unit":"GB"}]},"server_lists":["Gateway","BAT1","BAT2","OPC Unit 1","OPC Unit 2"]},"page":0,"sent":{"hostname":"","server":"Gateway"},"status":true,"total":1};

    var table = document.getElementById('table-server-details');
    table.innerHTML = '';

    for (const label of ['disk_usage', 'memory_usage']) {
        var contents = `
        <table class="table table-hover table-borderless">
            <thead>
            <tr>
                <th scope="col" style="width: 40%;">${label.toUpperCase().replace('_', ' ')}</th>
                <th scope="col"></th>
            </tr>
            </thead>
            <tbody>`;
        for (const i in data.object.details[label]) {
            var line = data.object.details[label][i];
            var color = 'success';

            if (line.percentage > 99){ color = "dark";}
            else if (line.percentage > 90){ color = "danger";}
            else if (line.percentage > 60){ color = "warning";}

            contents += `<tr class="">
                <td scope="row">${line.name} (${line.percentage}%)</td>
                <td>
                <div class="progress">
                    <div class="progress-bar bg-${color}" role="progressbar" title="${line.text}"
                        aria-label="Animated striped example" aria-valuenow="${line.percentage}" aria-valuemin="0" aria-valuemax="100" style="width: ${line.percentage}%">
                    ${line.text}
                    </div>
                </div>
                </td>
            </tr>`;
        }
        contents += `</tbody></table>`;
        table.innerHTML += contents;
    }
    //     }
    // );
}
$('#server').change(function (e) {
    e.preventDefault();

    updateTable();
});

updateTable();
var t = setInterval(updateTable, update_rate);

function change_update_rate(obj, number) {
    update_rate = number;
    $(obj.parentElement.parentElement).find(".dropdown-item").removeClass('active');
    $(obj).addClass('active');
    
    clearInterval(t);
    t = setInterval(updateTable, update_rate);
}