var now = moment();
let SI = new SunImage('#sunrise-set-image');
let Sh = null;

function showShalatTime(){
    Sh = new Shalat(mylocation);
    console.log(Sh);
}

$('#dateinput').val(now.format('yyyy-MM-DD'));

$('.btn-sidebar-hide').click(function () {
    $('.sidebar').toggleClass('show');
})

SI.update();

setInterval(() => {
    SI.update();
}, 60000);