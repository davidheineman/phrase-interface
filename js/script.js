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

// Key: 
// 0 = No edit
// 1 = Rephrase
// 2 = Deletion
// 3 = Re-order of Wording
// 4 = Addition

function getSentence(id) {
    // Newsela Gold Example
    if (id == 0) {
        var r = [
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
        var o = [
            [0, 0, 'Hydranize'], 
            [1, 1, 'is used'],
            [2, 1, 'to power'], 
            [3, 0, 'the'], 
            [4, 1, 'early'], 
            [5, 0, 'stages'], 
            [6, 3, 'of some Russian'], 
            [7, 1, 'launchers']
        ];
    }

    if (id == 1) {
        // Good
        var r = [[[0], 0, 'The Seattle kids'], [[1], 1, 'petitioned'], [[2], 1, 'Washington state'], [[3], 0, 'last year to'], [[4], 1, 'adopt stricter'], [[5], 1, 'science-based regulations'], [[], 2, 'to protect them'], [[6], 0, 'against climate change.']]; var o = [[0, 0, 'The Seattle kids'], [1, 1, 'asked'], [2, 1, 'the Washington state'], [3, 0, 'last year to'], [4, 1, 'take tougher'], [5, 1, 'rules'], [6, 0, 'against climate change']];
    }

    if (id == 2) {
        // Hallucination
        var r = [[[0], 0, '“It’s more of a family than living outside,” said Jessica Konczal,'], [[1], 1, '33, whose husband is Sgt. Matthew Konczal.']]; var o = [[0, 0, '“It’s more of a family than living outside,” said Jessica Konczal,'], [1, 1, 'one of the protesters.']];
    }
    
    if (id == 3) {
        // Fluency Error
        var r = [[[1], 1, 'Parental feedback'], [[2], 0, 'on the menu'], [[3], 1, 'additions'], [[0], 0, 'so far,'], [[], 2, 'from some of the early adopter markets,'], [[4], 1, 'has been “phenomenal,”'], [[5], 1, 'Leverton said.']]; var o = [[0, 0, 'So far,'], [1, 1, 'parents parents have feedback'], [2, 0, 'on the menu'], [3, 1, 'changes'], [4, 1, 'has been a great deal,'], [5, 1, 'he added']];
    }
    
    if (id == 4) {
        // Bad Substitution
        var r = [[[0], 0, 'One of the'], [[1], 1, 'device’s inventors'], [[2], 1, 'explained to'], [[3], 0, 'the president that the'], [[4], 1, 'machine was a prototype.']]; var o = [[0, 0, 'One of the'], [1, 1, 'inventors'], [2, 1, 'told'], [3, 0, 'the president that the'], [4, 1, 'first design was a design.']];
    }
    
    if (id == 5) {
        // Anaphora Resolution & Entailment
        var r = [[[1], 1, 'Complex Sea slugs'], [[], 2, 'dubbed sacoglossans'], [[2], 0, 'are some of the most'], [[3], 1, 'remarkable'], [[4], 1, 'biological burglars'], [[5], 0, 'on the planet.']]; var o = [[0, 4, 'Scientists say'], [1, 1, 'these'], [2, 0, 'are some of the most'], [3, 1, 'interesting'], [4, 1, 'creatures'], [5, 0, 'on the planet']];
    }
    
    if (id == 6) {
        // Human Reference Error
        var r = [[[0], 0, 'They float in and out of'], [[1], 1, 'formations'], [[2], 0, 'that combine'], [[3], 1, 'the underwater world with the stage.']]; var o = [[0, 0, 'They float in and out of'], [1, 0, 'places'], [2, 0, 'that combine'], [3, 0, 'stage with the underwater.']];
    }

    return [r, o];
}


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

function initializeInterface() {
    // Reset Containers
    $('#in-container').html("");
    $('#out-container').html("");
    $('#line-container').html("");

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
}

function displayAnnotation(i) {
    $(".question").removeClass("question-hide");
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

        // If the edit needs questions hidden, hide them
        if (r[i][1] == 3) {
            $('#q5, #q6, #q7, #q8').addClass('question-hide')
        } else if (r[i][1] == 4) {
            $('#q7, #q8').addClass('question-hide')
        } else if (r[i][1] == 0) {
            $('.question').addClass('question-hide')
        }
    } else {
        // Only happens on deletions
        $('#q5, #q6').addClass('question-hide')
        $('#' + i + 'b').addClass('bolded');
        $('#right-a').html('');
        $('#line-a').addClass('radio-hide');
    }

    // Hides highlight for other annotations
    if ($("#highlight-toggle").is(':checked')){
        $('#in-container > span, #out-container > span').each(function () { $(this).addClass('hide-highlight') });
        $('#' + i + 'b').removeClass('hide-highlight');
        $('#' + r[i][0][0] + 'e').removeClass('hide-highlight');
    }

    // Controls toggling
    $('.btn-outline-success, .btn-outline-danger, .btn-outline-warning').removeClass('active');
}

$("#highlight-toggle").click(function() {
    if ($("#highlight-toggle").is(':checked')){
        $('#in-container > span, #out-container > span').each(function () { $(this).addClass('hide-highlight') });
        $('#' + a_counter + 'b').removeClass('hide-highlight');
        $('#' + r[a_counter][0][0] + 'e').removeClass('hide-highlight');
    } else {
        $('#in-container > span, #out-container > span').each(function () { $(this).removeClass('hide-highlight') });
    }
});

// Initialize the annotation interface
var sentID = 1;
var out = getSentence(sentID);
var r = out[0];
var o = out[1];
var a_counter = 0;
initializeInterface();
displayAnnotation(a_counter);

// Generate Y/N box for each question
var questions = document.getElementsByClassName('question');
for (var i = 0; i < questions.length; i++) {
    var qhtml = "<div class='btn-group btn-group-toggle' data-toggle='buttons'><label class='btn btn-outline-success'><input type='radio' name='options' id='option1' class='radio-hide' autocomplete='off' checked>YES</label><label class='btn btn-outline-danger'><input type='radio' name='options' id='option2' class='radio-hide' autocomplete='off'>NO</label></div>"
    
    // Contains NA option \/
    // var qhtml = "<div class='btn-group btn-group-toggle' data-toggle='buttons'><label class='btn btn-outline-success'><input type='radio' name='options' id='option1' class='radio-hide' autocomplete='off' checked>YES</label><label class='btn btn-outline-warning'><input type='radio' name='options' id='option1' class='radio-hide' autocomplete='off' checked=''>NA</label><label class='btn btn-outline-danger'><input type='radio' name='options' id='option2' class='radio-hide' autocomplete='off'>NO</label></div>"
    
    questions[i].innerHTML = qhtml + questions[i].innerHTML;
}

// Controls toggling
$('.btn-outline-success, .btn-outline-danger, .btn-outline-warning').click(function() {
    $(this).addClass('active');
})

$('#submit').click(function() {
    // Doesn't allow clicking for the next once we're done annotating
    if (a_counter < r.length - 1){
        highlihgtNextLine();
    } else {
        sentID++;
        out = getSentence(sentID);
        r = out[0];
        o = out[1];
        a_counter = 0;
        initializeInterface();
        displayAnnotation(a_counter);
    }
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

