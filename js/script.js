function adjustLine(from, to, line, horizontal=false){
    if(horizontal) {
        var fT = from.offsetTop  + from.offsetHeight/2;
        var tT = to.offsetTop + to.offsetHeight/2;
        var fL = from.offsetLeft - 8;
        var tL = to.offsetLeft + to.offsetWidth + 8;
    } else {
        var fT = from.offsetTop  + from.offsetHeight;
        var tT = to.offsetTop;
        var fL = from.offsetLeft + from.offsetWidth/2;
        var tL = to.offsetLeft   + to.offsetWidth/2;
    }
    var CA   = Math.abs(tT - fT);
    var CO   = Math.abs(tL - fL);
    var H    = Math.sqrt(CA*CA + CO*CO);
    var ANG  = 180 / Math.PI * Math.acos( CA/H );

    if(tT > fT){
        var top  = (tT-fT)/2 + fT;
    }else{
        var top  = (fT-tT)/2 + tT;
    }
    if(tL > fL){
        var left = (tL-fL)/2 + fL;
    }else{
        var left = (fL-tL)/2 + tL;
    }

    if(( fT < tT && fL < tL) || ( tT < fT && tL < fL) || (fT > tT && fL > tL) || (tT > fT && tL > fL)){
        ANG *= -1;
    }
    top -= H/2;

    line.style["-webkit-transform"] = 'rotate('+ ANG +'deg)';
    line.style["-moz-transform"] = 'rotate('+ ANG +'deg)';
    line.style["-ms-transform"] = 'rotate('+ ANG +'deg)';
    line.style["-o-transform"] = 'rotate('+ ANG +'deg)';
    line.style["-transform"] = 'rotate('+ ANG +'deg)';
    line.style.top    = top + 'px';
    line.style.left   = left + 'px';
    line.style.height = H + 'px';
}

let r = [
    [[6], 3, "Some of Russian"], 
    [[], 2, "space agency's"], 
    [[7], 1, 'launching missions'], 
    [[1], 1, 'used'], 
    [[0], 0, 'hydranize'], 
    [[2], 1, 'as fuel for'], 
    [[3], 0, 'the'], 
    [[4], 1, 'initial'], 
    [[], 2, 'few'], 
    [[5], 0, 'stages']
];
let o = [
    [0, 0, 'Hydranize'], 
    [1, 1, 'is used'],
    [2, 1, 'to power'], 
    [3, 0, 'the'], 
    [4, 1, 'early'], 
    [5, 0, 'stages'], 
    [6, 3, 'of some Russian'], 
    [7, 1, 'launchers']
];

function highlightWord(sent, i, holder_id) {
    if (sent[i][1] == 1) {
        $('#' + i + holder_id).addClass('rp')
    } else if (sent[i][1] == 2) {
        $('#' + i + holder_id).addClass('del')
    } else if (sent[i][1] == 3) {
        $('#' + i + holder_id).addClass('reword')
    } else if (sent[i][1] == 4) {
        $('#' + i + holder_id).addClass('add')
    }
}

function getColor(id) {
    if (id == 1) {
        return 'rp'
    } else if (id == 2) {
        return 'del'
    } else if (id == 3) {
        return 'reword'
    } else if (id == 4) {
        return 'add'
    }
}

// Generate and highlight sentences
for(var i = 0; i < r.length; i++) {
    $('#in-container').append('<span ' + 'id="' + i + 'b"' + ' >' + r[i][2] + '</span> ');
    highlightWord(r, i, 'b');
}

for(var i = 0; i < o.length; i++) {
    $('#out-container').append('<span ' + 'id="' + i + 'e"' + ' >' + o[i][2] + '</span> ');
    highlightWord(o, i, 'e');
}

var a_counter = 0;

// Draws lines and creates :hover between types of edits
for(var i = 0; i < r.length; i++) { // This should loop for the amount of lines, which could be more if some phrases have multiple lines
    $('#line-container').append("<div class='line' id='" + i + "l'></div>");
    if(r[i][0].length > 0) {
        let elem = r[i][0][0];
        let ielem = i;
        $('#' + ielem + 'b, #' + elem + 'e, #' + ielem + 'l').hover(function() {
            $('#' + ielem + 'b').addClass('bolded');
            $('#' + elem + 'e').addClass('bolded');
            $('#' + ielem + 'l').addClass('bolded-line');
        }, function() {
            if (a_counter != ielem) {
                $('#' + ielem + 'b').removeClass('bolded');
                $('#' + elem + 'e').removeClass('bolded');
                $('#' + ielem + 'l').removeClass('bolded-line');
            }
        });

        $('#' + ielem + 'b, #' + elem + 'e, #' + ielem + 'l').click(function () {
            highlihgtNextLine(amt=ielem, inc=false);
        });

        adjustLine(
            document.getElementById(i + 'b'), 
            document.getElementById(r[i][0][0] + 'e'),
            document.getElementById(i + 'l')
        );
    } else {
        let ielem = i;
        $('#' + ielem + 'b').hover(function() {
            $('#' + ielem + 'b').addClass('bolded');
        }, function() {
            if (a_counter != ielem) {
                $('#' + ielem + 'b').removeClass('bolded');
            }
        });

        $('#' + ielem + 'b').click(function () {
            highlihgtNextLine(amt=ielem, inc=false);
        });
    }
}

function displayAnnotation(i) {
    $('#left-a').html('<span class=' + getColor(r[i][1]) + '>' + r[i][2] + '</span>');
    if (r[i][0].length > 0) {
        $('#right-a').html('<span class=' + getColor(o[r[i][0][0]][1]) + '>' + o[r[i][0][0]][2] + '</span>');
        $('#line-a').removeClass('radio-hide');
        adjustLine(
            document.getElementById('right-a'), 
            document.getElementById('left-a'),
            document.getElementById('line-a'),
            horizontal=true
        );

        $('#' + i + 'b').addClass('bolded');
        $('#' + r[i][0][0] + 'e').addClass('bolded');
        $('#' + i + 'l').addClass('bolded-line');
    } else {
        $('#' + i + 'b').addClass('bolded');
        $('#right-a').html('');
        $('#line-a').addClass('radio-hide');
    }

    // Controls toggling
    $('.btn-outline-success, .btn-outline-danger').removeClass('active');
}
displayAnnotation(a_counter);

$('#submit').click(function() {
    highlihgtNextLine();
});

function highlihgtNextLine(amt=-1, inc=true) {
    $('#' + a_counter + 'b').removeClass('bolded');
    $('#' + r[a_counter][0][0] + 'e').removeClass('bolded');
    $('#' + a_counter + 'l').removeClass('bolded-line');
    if (inc) {
        a_counter++;
    } else {
        a_counter = amt;
    }
    
    displayAnnotation(a_counter);
}

// Generate Y/N box for each question
var questions = document.getElementsByClassName('question');
for (var i = 0; i < questions.length; i++) {
    var qhtml = "<div class='btn-group btn-group-toggle' data-toggle='buttons'><label class='btn btn-outline-success'><input type='radio' name='options' id='option1' class='radio-hide' autocomplete='off' checked>Yes</label><label class='btn btn-outline-danger'><input type='radio' name='options' id='option2' class='radio-hide' autocomplete='off'>No</label></div>"
    questions[i].innerHTML = qhtml + questions[i].innerHTML;
}

// Controls toggling
$('.btn-outline-success, .btn-outline-danger').click(function() {
    $(this).addClass('active');
})