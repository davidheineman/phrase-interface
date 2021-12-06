// TODO FIX ADJUST LINE ALGO TO SUPPORT WHEN TEXT GOES TO NEW LINE

function adjustLine(from, to, line, horizontal=false){
    // We assume we're making a horizontal line
    var fT = from.offsetTop  + from.offsetHeight/2;
    var tT = to.offsetTop + to.offsetHeight/2;
    var fL = from.offsetLeft - 8;
    var tL = to.offsetLeft + to.offsetWidth + 8;
    
    if (!horizontal || fT != tT) {
        // This is saying if we're trying to draw a horizontal line
        // and the elements aren't actually horizontal, then we'll draw
        // a line from the first element to the second assuming the first
        // is above the second
        if (horizontal && fT != tT) {
            var temp = from;
            from = to;
            to = temp;
        }

        // Calculates bounding box for line
        var fT = from.offsetTop  + from.offsetHeight;
        var tT = to.offsetTop;
        var fL = from.offsetLeft + from.offsetWidth/2;
        var tL = to.offsetLeft   + to.offsetWidth/2;

        // Check for edge case of an element being on multiple lines
        if (from.offsetHeight > 30) {
            var fL = from.offsetLeft + 8;
            var fT = from.offsetTop  + from.offsetHeight / 2;
        }
        if (to.offsetHeight > 30) {
            var tT = to.offsetTop;
            var tL = to.offsetLeft + 8;
        }
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

function getSentence(id, data) {
    return [data[id].Original, data[id].Simplified]
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

// Called each time a new sentence is displayed
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

    // a_counter = How many annotations have been submitted
    var a_counter = 0;

    // Draws lines and creates :hover between types of edits
    for(var i = 0; i < r.length; i++) {
        $('#line-container').append("<div class='line' id='" + i + "l'></div>");

        // Only draws lines for rephrases
        if(r[i][0].length > 0 && r[i][1] != 0) {
            let elem = r[i][0][0];
            let ielem = i;

            // Highlight on hover logic
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

            // Switch to this rephrase on click
            $('#' + ielem + 'b, #' + elem + 'e, #' + ielem + 'l').click(function () {
                highlihgtNextLine(amt=ielem, inc=false);
            });

            // Draw the line between two rephrases
            adjustLine(
                document.getElementById(i + 'b'), 
                document.getElementById(r[i][0][0] + 'e'),
                document.getElementById(i + 'l')
            );
        } else if (r[i][1] != 0) {
            // Add ability to hover over deletions & additions
            let ielem = i;
            $('#' + ielem + 'b').hover(function() {
                $('#' + ielem + 'b').addClass('bolded');
            }, function() {
                if (a_counter != ielem) {
                    $('#' + ielem + 'b').removeClass('bolded');
                }
            });

            // Add ability to click deletions / additions
            $('#' + ielem + 'b').click(function () {
                highlihgtNextLine(amt=ielem, inc=false);
            });
        }
    }
}

function displayAnnotation(i) {
    // Remove permanent bolding everywhere
    $('.bolded-perm').removeClass('bolded-perm');
    $('.bolded-line-perm').removeClass('bolded-line-perm');

    $(".question").removeClass("question-hide");
    $('#left-a').html('<span class=' + getColor(r[i][1]) + '>' + r[i][2] + '</span>');
    if (r[i][0].length > 0) {
        // On a rephrase, display both phrases and a line connecting them
        $('#right-a').html('<span class=' + getColor(o[r[i][0][0]][1]) + '>' + o[r[i][0][0]][2] + '</span>');
        $('#line-a').removeClass('radio-hide');
        adjustLine(
            document.getElementById('right-a'), 
            document.getElementById('left-a'),
            document.getElementById('line-a'),
            horizontal=true
        );

        // Add permanent bolding for the line connecting
        $('#' + i + 'b').addClass('bolded-perm');
        $('#' + r[i][0][0] + 'e').addClass('bolded-perm');
        $('#' + i + 'l').addClass('bolded-line-perm');

        // If the edit needs questions hidden, hide them
        if (r[i][1] == 3) {
            $('#q5, #q6, #q7, #q8').addClass('question-hide')
        } else if (r[i][1] == 4) {
            $('#q7, #q8').addClass('question-hide')
        } else if (r[i][1] == 0) {
            $('.question').addClass('question-hide')
        }
    } else {
        // On an addition / deletion, only display that one phrase
        $('#q5, #q6').addClass('question-hide')
        $('#' + i + 'b').addClass('bolded');
        $('#right-a').html('');
        $('#line-a').addClass('radio-hide');
    }

    // Hides highlight for other annotations
    let enableHighlightToggle = false;
    if ($("#highlight-toggle").is(':checked') || !enableHighlightToggle){
        $('#in-container > span, #out-container > span').each(function () { $(this).addClass('hide-highlight') });
        $('#' + i + 'b').removeClass('hide-highlight');
        $('#' + r[i][0][0] + 'e').removeClass('hide-highlight');
    }

    // Controls toggling
    $('.btn-outline-success, .btn-outline-danger, .btn-outline-warning').removeClass('active');
    $('.btn-outline-success, .btn-outline-danger, .btn-outline-warning').click(function() {
        if ($($(this).siblings()[0]).hasClass('active')) {
            $($($(this).siblings()[0])).removeClass('active');
        }
        $(this).addClass('active');
    });

    // If there's no change, skip annotation
    if (r[i][1] == 0) {
        moveToNextAnnotation();
    }
}

function moveToNextAnnotation() {
    // Doesn't allow clicking for the next once we're done annotating
    if (a_counter < r.length - 1){
        highlihgtNextLine();
    } else if (sentID < data.length) {
        // store answers to sentence before moving on to next sentence
        answersForAllSent.push(answers);
        answers = [];

        console.log(answersForAllSent);

        // Reset interface
        sentID++;
        out = getSentence(sentID, data);
        r = out[0];
        o = out[1];
        a_counter = 0;
        initializeInterface();
        displayAnnotation(a_counter);

        if (sentID == data.length) {
            
        }
    } else {
        // Done with annotations, download data

    }
}

function highlihgtNextLine(amt=-1, inc=true) {
    // Store current answers before moving on (unless we've just initialized the sent)
    // $($('#q1').children()[0]).children()
    let questions = $($('.question-container')[0]).children();
    let scores = []
    for (let i = 0; i < questions.length; i++) {
        let a = null
        if ($($($(questions[i]).children()[0]).children()[0]).hasClass('active')) {
            // Get YES button value 
            a = 1
        } else if ($($($(questions[i]).children()[0]).children()[1]).hasClass('active')) {
            // Get NO button value
            a = 0
        }
        scores.push(a);
    }

    currDict[a_counter] = [scores, r[a_counter], o[a_counter]];
    answers.push(currDict);

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

function getJSON() {
    var resp = [];
    $.ajax({
        url: 'data/input.json',
        type: 'GET',
        dataType: 'json',
        async: false,
        success : function(data) {
            resp.push(data);
        }
    })
    return resp[0];
}

$('#submit').click(function() {
    moveToNextAnnotation();
});

$("#highlight-toggle").click(function() {
    if ($("#highlight-toggle").is(':checked')){
        $('#in-container > span, #out-container > span').each(function () { $(this).addClass('hide-highlight') });
        $('#' + a_counter + 'b').removeClass('hide-highlight');
        $('#' + r[a_counter][0][0] + 'e').removeClass('hide-highlight');
    } else {
        $('#in-container > span, #out-container > span').each(function () { $(this).removeClass('hide-highlight') });
    }
});



// Readjust lines on window resize
$( window ).resize(function() {
    initializeInterface();
    displayAnnotation(a_counter);
});

// Generate Y/N box for each question
var questions = document.getElementsByClassName('question');
for (var i = 0; i < questions.length; i++) {
    var qhtml = "<div class='btn-group btn-group-toggle' data-toggle='buttons'><label class='btn btn-outline-success'><input type='radio' name='options' id='option1' class='radio-hide' autocomplete='off' checked>YES</label><label class='btn btn-outline-danger'><input type='radio' name='options' id='option2' class='radio-hide' autocomplete='off'>NO</label></div>"
    
    // Contains NA option \/
    // var qhtml = "<div class='btn-group btn-group-toggle' data-toggle='buttons'><label class='btn btn-outline-success'><input type='radio' name='options' id='option1' class='radio-hide' autocomplete='off' checked>YES</label><label class='btn btn-outline-warning'><input type='radio' name='options' id='option1' class='radio-hide' autocomplete='off' checked=''>NA</label><label class='btn btn-outline-danger'><input type='radio' name='options' id='option2' class='radio-hide' autocomplete='off'>NO</label></div>"
    
    questions[i].innerHTML = qhtml + questions[i].innerHTML;
}


var answersForAllSent = []; // Stores outputs over all sentences
var answers = [];           // Stores outputs over sentences
var currDict = {}           // Store outputs for each edit

// Initialize the annotation interface
var sentID = 1;
var data = getJSON();
var out = getSentence(sentID, data); 
var r = out[0];
var o = out[1];
var a_counter = 0;
initializeInterface();
displayAnnotation(a_counter);