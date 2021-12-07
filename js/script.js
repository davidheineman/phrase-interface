// TODO: ALLOW FOR ANNOTATING ADDITIONS
// Edit displayPhrase to allow for this
// After all the phrases from input -> output have been annotated, annotate additions

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
    $('#' + i + holder_id).addClass(getColor(sent[i][1]));
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
    // Reset variables
    out = getSentence(sent_id, data);
    r = out[0];
    o = out[1];
    phrase_idx = 0;     // phrase_idx = How many annotations have been submitted
    sentence_answers = {};

    // Draw interface
    drawInterface();
}

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

function drawInterface() {
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
                if (phrase_idx != ielem) {
                    $('#' + ielem + 'b').removeClass('bolded');
                    $('#' + elem + 'e').removeClass('bolded');
                    $('#' + ielem + 'l').removeClass('bolded-line');
                }
            });

            // Switch to this rephrase on click
            $('#' + ielem + 'b, #' + elem + 'e, #' + ielem + 'l').click(function () {
                highlightNextPhrase(amt=ielem);
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
                if (phrase_idx != ielem) {
                    $('#' + ielem + 'b').removeClass('bolded');
                }
            });

            // Add ability to click deletions / additions
            $('#' + ielem + 'b').click(function () {
                highlightNextPhrase(amt=ielem);
            });
        }
    }
}

function displayPhrase(i) {
    let phrase_mapping = r[i][0], phrase_type = r[i][1], phrase_content = r[i][2];

    // Remove permanent bolding everywhere
    $('.bolded-perm').removeClass('bolded-perm');
    $('.bolded-line-perm').removeClass('bolded-line-perm');

    $(".question").removeClass("question-hide");
    $('#left-a').html('<span class=' + getColor(phrase_type) + '>' + phrase_content + '</span>');
    if (phrase_mapping.length > 0) {
        // On a rephrase, display both phrases and a line connecting them
        $('#right-a').html('<span class=' + getColor(o[phrase_mapping[0]][1]) + '>' + o[phrase_mapping[0]][2] + '</span>');
        $('#line-a').removeClass('radio-hide');
        adjustLine(
            document.getElementById('right-a'), 
            document.getElementById('left-a'),
            document.getElementById('line-a'),
            horizontal=true
        );

        // Add permanent bolding for the line connecting
        $('#' + i + 'b').addClass('bolded-perm');
        $('#' + phrase_mapping[0] + 'e').addClass('bolded-perm');
        $('#' + i + 'l').addClass('bolded-line-perm');

        // If the edit needs questions hidden, hide them
        if (phrase_type == 3) {
            $('#q5, #q6, #q7, #q8').addClass('question-hide')
        } else if (phrase_type == 4) {
            $('#q7, #q8').addClass('question-hide')
        } else if (phrase_type == 0) {
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
        $('#' + phrase_mapping[0] + 'e').removeClass('hide-highlight');
    }

    // Controls toggling
    $('.btn-outline-success, .btn-outline-danger, .btn-outline-warning').removeClass('active');
    $('.btn-outline-success, .btn-outline-danger, .btn-outline-warning').click(function() {
        if ($($(this).siblings()[0]).hasClass('active')) {
            $($($(this).siblings()[0])).removeClass('active');
        }
        $(this).addClass('active');

        // Remove invalid warning on the group of buttons
        $($(this).parents()[0]).removeClass('btn-group-invalid');
    });

    // If there's no change, skip annotation
    if (phrase_type == 0) {
        moveToNextAnnotation();
    }
}

function moveToNextAnnotation() {
    // Store answers to current phrase
    sentence_answers[phrase_idx] = getPhraseAnswers();

    // Either we move to the next phrase, the next sentence, or we download data
    if (phrase_idx < r.length - 1){
        highlightNextPhrase();

        // On the phrase in the last sentence, change the "next" button text to submit
        if (sent_id == data.length - 1 && phrase_idx == r.length - 1) {
            $('#submit')[0].innerText = 'SUBMIT ALL';
        }
    } else if (sent_id < data.length - 1) {
        // Store answers to sentence before moving on to next sentence
        all_answers[sent_id] = sentence_answers;

        // Reset interface
        sent_id++;
        initializeInterface();
        displayPhrase(phrase_idx);
    } else {
        // Done with annotations, download data
        downloadData();
    }
}

// Store current answers
function getPhraseAnswers() {
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

    return [scores, r[phrase_idx], o[phrase_idx]];
}

function highlightNextPhrase(amt=-1) {
    $('#' + phrase_idx + 'b').removeClass('bolded');
    $('#' + r[phrase_idx][0][0] + 'e').removeClass('bolded');
    $('#' + phrase_idx + 'l').removeClass('bolded-line');

    if (amt == -1) {
        phrase_idx++;
    } else {
        phrase_idx = amt;
    }
    
    displayPhrase(phrase_idx);
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

// Downloads output as .json file
function downloadData() {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(all_answers));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "output.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

$('#submit').click(function() {
    // Check to see if every questioned is answered
    let valid = true;

    if (checkInvalid) {
        $('.btn-group').each(function() {
            // It's invalid if: (1) the question isn't hidden, (2) "YES" has not been selected, and (3) "NO" has not been selected
            if (!$($(this).parent()[0]).hasClass('question-hide') && !($(this.children[0]).hasClass('active') || $(this.children[1]).hasClass('active'))) {
                valid = false;
                $(this).addClass('btn-group-invalid');
            }
        });
    }

    if (valid) {
        moveToNextAnnotation();
    }
});

$("#highlight-toggle").click(function() {
    if ($("#highlight-toggle").is(':checked')){
        $('#in-container > span, #out-container > span').each(function () { $(this).addClass('hide-highlight') });
        $('#' + phrase_idx + 'b').removeClass('hide-highlight');
        $('#' + r[phrase_idx][0][0] + 'e').removeClass('hide-highlight');
    } else {
        $('#in-container > span, #out-container > span').each(function () { $(this).removeClass('hide-highlight') });
    }
});

// Readjust lines on window resize
$(window).resize(function() {
    drawInterface();
    displayPhrase(phrase_idx);
});

// Generate Y/N box for each question
var questions = document.getElementsByClassName('question');
for (var i = 0; i < questions.length; i++) {
    var qhtml = "<div class='btn-group btn-group-toggle' data-toggle='buttons'><label class='btn btn-outline-success'><input type='radio' name='options' id='option1' class='radio-hide' autocomplete='off' checked>YES</label><label class='btn btn-outline-danger'><input type='radio' name='options' id='option2' class='radio-hide' autocomplete='off'>NO</label></div>"
    
    // Contains NA option \/
    // var qhtml = "<div class='btn-group btn-group-toggle' data-toggle='buttons'><label class='btn btn-outline-success'><input type='radio' name='options' id='option1' class='radio-hide' autocomplete='off' checked>YES</label><label class='btn btn-outline-warning'><input type='radio' name='options' id='option1' class='radio-hide' autocomplete='off' checked=''>NA</label><label class='btn btn-outline-danger'><input type='radio' name='options' id='option2' class='radio-hide' autocomplete='off'>NO</label></div>"
    
    questions[i].innerHTML = qhtml + questions[i].innerHTML;
}


// Initialize the annotation interface
var sent_id = 0;
var data = getJSON();
var all_answers = {};             // Stores outputs over all sentences
var out, r, o, phrase_idx, sentence_answers;    // Stores answers, reference sent, generated sent, current phrase index and current sentence's annotations

var checkInvalid = false;

initializeInterface();
displayPhrase(phrase_idx);