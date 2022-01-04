const add = Symbol('add'), del = Symbol('del'), par = Symbol('rp')

function getAlignmentType (edit) {
    if (edit[0] === null)
        return add
    else if (edit[1] === null)
        return del
    else
        return par
}

// Called each time a new sentence is displayed
function initializeInterface () {
    // Reset variables
    original = data[sentId].Original
    simplified = data[sentId].Simplification
    alignment = data[sentId].Alignment
    phraseIdx = 0 // phrase_idx = How many annotations have been submitted
    sentenceAnswers = {}

    // Draw interface
    drawInterface()
}

function adjustLine (from, to, line, horizontal = false) {
    // We assume we're making a horizontal line
    let fT = from.offsetTop + from.offsetHeight / 2
    let tT = to.offsetTop + to.offsetHeight / 2
    let fL = from.offsetLeft - 8
    let tL = to.offsetLeft + to.offsetWidth + 8

    if (!horizontal || fT !== tT) {
        // This is saying if we're trying to draw a horizontal line
        // and the elements aren't actually horizontal, then we'll draw
        // a line from the first element to the second assuming the first
        // is above the second
        if (horizontal && fT !== tT) {
            const temp = from
            from = to
            to = temp
        }

        // Calculates bounding box for line
        fT = from.offsetTop + from.offsetHeight
        tT = to.offsetTop
        fL = from.offsetLeft + from.offsetWidth / 2
        tL = to.offsetLeft + to.offsetWidth / 2

        // Check for edge case of an element being on multiple lines
        if (from.offsetHeight > 30) {
            fL = from.offsetLeft + 8
            fT = from.offsetTop + from.offsetHeight / 2
        }
        if (to.offsetHeight > 30) {
            tT = to.offsetTop
            tL = to.offsetLeft + 8
        }
    }
    const CA = Math.abs(tT - fT)
    const CO = Math.abs(tL - fL)
    const H = Math.sqrt(CA * CA + CO * CO)
    let ANG = 180 / Math.PI * Math.acos(CA / H)

    let top, left
    if (tT > fT) {
        top = (tT - fT) / 2 + fT
    } else {
        top = (fT - tT) / 2 + tT
    }
    if (tL > fL) {
        left = (tL - fL) / 2 + fL
    } else {
        left = (fL - tL) / 2 + tL
    }

    if ((fT < tT && fL < tL) || (tT < fT && tL < fL) || (fT > tT && fL > tL) || (tT > fT && tL > fL)) {
        ANG *= -1
    }
    top -= H / 2

    line.style['-webkit-transform'] = 'rotate(' + ANG + 'deg)'
    line.style['-moz-transform'] = 'rotate(' + ANG + 'deg)'
    line.style['-ms-transform'] = 'rotate(' + ANG + 'deg)'
    line.style['-o-transform'] = 'rotate(' + ANG + 'deg)'
    line.style['-transform'] = 'rotate(' + ANG + 'deg)'
    line.style.top = top + 'px'
    line.style.left = left + 'px'
    line.style.height = H + 'px'
}

function parseAlignment(sent, type) {
    // INPUT:
    // "Original": "Complex Sea slugs dubbed sacoglossans are some of the most remarkable biological burglars on the planet.",
    // "Simplification": "Scientists say these are some of the most interesting creatures on the planet",
    // "Alignment": [
    //     [null, [0, 14]],
    //     [[0, 16], [15, 20]],
    //     [[18, 37], null],
    //     [[59, 69], [42, 53]],
    //     [[70, 89], [54, 63]] 
    // ]
    
    // OUTPUT
    // [
    //     ["Complex Sea slugs", 1],
    //     [" ", null]
    //     ["dubbed sacoglossans", 2],
    //     [" ", null]
    //     ["remarkable", 3]
    //     [" ", null],
    //     ["biological burglars", 4],
    //     [" on the planet.", null]
    // ]
    // [
    //     ["Scientists say", 0],
    //     [" ", null],
    //     ["these", 1], 
    //     [" are some of the most ", null],
    //     ["interesting", 3],
    //     [" ", null]
    //     ["creatures", 4],
    //     [" on the planet.", null]
    // ]

    // Duplicate the alignment arrray and sort by the first index of each edit.
    let tmp = alignment.map(function(arr) {
        return arr.slice();
    });
    for (let i = 0; i < tmp.length; i++) 
        tmp[i].push(i)
    if (type !== 'original') {
        tmp.sort((a, b) => {
            if (a[1] === null)
                return Infinity
            else if (b[1] === null)
                return Infinity
            else
                return a[1][0] - b[1][0]
        })
    }
    
    const out = []
    let last_ending_idx = 0, edit
    
    for (let i = 0; i < tmp.length; i++) {
        (type === 'original') ? edit = tmp[i][0] : edit = tmp[i][1]
        index_of_edit = tmp[i][2]

        // Only add edits deletions and paraphrases
        if (edit === null) continue

        // Get the start and end indices of the edit
        const start_idx = edit[0], end_idx = edit[1]

        // Add the intermediate text if it the edits aren't adjacent
        if (start_idx !== 0 && start_idx !== last_ending_idx)
            out.push([null, sent.substring(last_ending_idx, start_idx), last_ending_idx])

        // Add the edit
        out.push([index_of_edit, sent.substring(start_idx, end_idx), start_idx])

        // Add the end of the sentence if applicable
        if (i === alignment.length - 1 && end_idx !== sent.length)
            out.push([null, sent.substring(end_idx), end_idx])

        last_ending_idx = end_idx
    }

    // Sort the arrays in out by their last element and delete the last element of each array
    out.sort((a, b) => a[2] - b[2])
    for (let i = 0; i < out.length; i++) {
        out[i] = out[i].slice(0,2)
    }

    return out
}

function drawInterface () {
    // Reset Containers
    $('#in-container').html('')
    $('#out-container').html('')
    $('#line-container').html('')

    // TODO: Need to make sure the alignments are in order and do NOT overlap

    // Parse sentences into a usable format
    let original_tokens = parseAlignment(original, 'original')
    let simplified_tokens = parseAlignment(simplified, 'simplified')

    // Write sentences onto the DOM
    let drawToken = function(token, containerId) {
        if (token[0] === null) {
            $(containerId).append(token[1])
        } else {
            $(containerId).append($("<span>", {
                // id: i + 'b',
                class: 'token ' + getAlignmentType(alignment[token[0]]).description,
                edit_id: token[0],
                text: token[1]
            }))
        }
    }
    original_tokens.forEach(function(token) { drawToken(token, "#in-container") })
    simplified_tokens.forEach(function(token) { drawToken(token, "#out-container") })

    // Draw lines and creates :hover between types of edits
    for (let i = 0; i < alignment.length; i++) {
        let edit = alignment[i], alignment_type = getAlignmentType(edit)
        
        // Add line DOM elements
        $('#line-container').append($("<div>", {
            edit_id: i,
            class: 'line'
        }))

        // Add ability to bold edit on hover
        $("[edit_id='" + i + "']").hover(function() {
            $(".token[edit_id='" + i + "']").addClass('bolded')
            if (alignment_type === par)
                $(".line[edit_id='" + i + "']").addClass('bolded-line')
        }, function() {
            if (phraseIdx !== i) {
                $(".token[edit_id='" + i + "']").removeClass('bolded')
                if (alignment_type === par)
                    $(".line[edit_id='" + i + "']").removeClass('bolded-line')
            }
        })

        // Add ability to switch to the edit on click
        $("[edit_id='" + i + "']").click(function() {
            highlightNextPhrase(i)
        })

        // Draw line between two paraphrases
        if (alignment_type === par) {
            adjustLine(
                $(".token[edit_id='" + i + "']")[0],
                $(".token[edit_id='" + i + "']")[1],
                $(".line[edit_id='" + i + "']")[0]
            )
        }
    }

    // Add ability to toggle highlighting edits
    $('#highlight-toggle').click(function () {
        if ($('#highlight-toggle').is(':checked')) {
            $('#in-container > span, #out-container > span').each(function () { $(this).addClass('hide-highlight') })
            $(".token[edit_id='" + i + "']").removeClass('hide-highlight')
        } else {
            $('#in-container > span, #out-container > span').each(function () { $(this).removeClass('hide-highlight') })
        }
    })
}



function displayPhrase (i) {    
    let edit = alignment[i]
    let alignment_type = getAlignmentType(edit)

    // Remove bolding everywhere
    $('.bolded-perm').removeClass('bolded-perm')
    $('.bolded-line-perm').removeClass('bolded-line-perm')
    $('.bolded').removeClass('bolded')
    $('.bolded-line').removeClass('bolded-line')

    $('.question').removeClass('question-hide')
    $('#left-a').html($('<span>', {
        class: alignment_type.description,
        text: $(".token[edit_id='" + i + "']")[0].textContent
    }))

    if (alignment_type === par) {
        // On a rephrase, display both phrases and a line connecting them
        $('#right-a').html($('<span>', {
            class: alignment_type.description,
            text: $(".token[edit_id='" + i + "']")[1].textContent
        }))
        $('#line-a').removeClass('radio-hide')
        adjustLine(
            $('#right-a')[0],
            $('#left-a')[0],
            $('#line-a')[0],
            true
        )

        // Add permanent bolding for the line connecting
        $(".token[edit_id='" + i + "']").addClass('bolded-perm')
        $(".line[edit_id='" + i + "']").addClass('bolded-line-perm')
    } else {
        // On an addition / deletion, only display that one phrase
        $('#right-a').html('')
        $(".token[edit_id='" + i + "']").addClass('bolded-perm')
        $('#q5, #q6').addClass('question-hide')
        $('#line-a').addClass('radio-hide')
    }

    // If the edit needs questions hidden, hide them
    if (alignment_type === par) 
        $('#q5, #q6, #q7, #q8').addClass('question-hide')
    else if (alignment_type === add)
        $('#q7, #q8').addClass('question-hide')

    // Hides highlight for other annotations
    if ($('#highlight-toggle').is(':checked') || !enableHighlightToggle) {
        $('#in-container > span, #out-container > span').each(function () { $(this).addClass('hide-highlight') })
        $(".token[edit_id='" + i + "']").removeClass('hide-highlight')
    }

    // Controls toggling
    $('.btn-outline-success, .btn-outline-danger, .btn-outline-warning').removeClass('active')
    $('.btn-outline-success, .btn-outline-danger, .btn-outline-warning').click(function () {
        if ($($(this).siblings()[0]).hasClass('active')) {
            $($($(this).siblings()[0])).removeClass('active')
        }
        $(this).addClass('active')

        // Remove invalid warning on the group of buttons
        $($(this).parents()[0]).removeClass('btn-group-invalid')
    })

    // If there's no change, skip annotation
    // if (phraseType === 0) {
    //     moveToNextAnnotation()
    // }
}

function moveToNextAnnotation () {
    // Store answers to current phrase
    sentenceAnswers[phraseIdx] = getPhraseAnswers()

    // Either we move to the next phrase, the next sentence, or we download data
    if (phraseIdx < alignment.length - 1) {
        highlightNextPhrase()

        // On the phrase in the last sentence, change the "next" button text to submit
        if (sentId === data.length - 1 && phraseIdx === original.length - 1) {
            $('#submit')[0].innerText = 'SUBMIT ALL'
        }
    } else if (sentId < data.length - 1) {
        // Store answers to sentence before moving on to next sentence
        allAnswers[sentId] = sentenceAnswers

        // Reset interface
        sentId++
        initializeInterface()
        displayPhrase(phraseIdx)
    } else {
        // Done with annotations, download data
        downloadData()
    }
}

// Store current answers
function getPhraseAnswers () {
    const questions = $($('.question-container')[0]).children()
    const scores = []
    for (let i = 0; i < questions.length; i++) {
        let a = null
        if ($($($(questions[i]).children()[0]).children()[0]).hasClass('active')) {
            // Get YES button value
            a = 1
        } else if ($($($(questions[i]).children()[0]).children()[1]).hasClass('active')) {
            // Get NO button value
            a = 0
        }
        scores.push(a)
    }

    return [scores, original[phraseIdx], simplified[phraseIdx]]
}

function highlightNextPhrase (index = -1) {
    $(".token[edit_id='" + phraseIdx + "']").removeClass('bolded')
    $(".line[edit_id='" + phraseIdx + "']").removeClass('bolded-line')

    if (index === -1)
        phraseIdx++
    else
        phraseIdx = index

    displayPhrase(phraseIdx)
}

function getJSON () {
    const resp = []
    $.ajax({
        url: 'data/simplified_format.json',
        type: 'GET',
        dataType: 'json',
        async: false,
        success: function (data) {
            resp.push(data)
        }
    })
    return resp[0]
}

// Download JSON data
function downloadData () {
    var raw_data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allAnswers));
    $('<a></a>').attr('href', raw_data).attr('download', 'output.json')[0].click();
}

$('#submit').click(function () {
    // Check to see if every questioned is answered
    let valid = true

    if (checkInvalid) {
        $('.btn-group').each(function () {
            // It's invalid if: (1) the question isn't hidden, (2) "YES" has not been selected, and (3) "NO" has not been selected
            if (!$($(this).parent()[0]).hasClass('question-hide') && !($(this.children[0]).hasClass('active') || $(this.children[1]).hasClass('active'))) {
                valid = false
                $(this).addClass('btn-group-invalid')
            }
        })
    }

    if (valid) {
        moveToNextAnnotation()
    }
})

// Readjust lines on window resize
$(window).resize(function () {
    drawInterface()
    displayPhrase(phraseIdx)
})

// Generate Y/N box for each question
const questions = document.getElementsByClassName('question')
for (let i = 0; i < questions.length; i++) {
    const qhtml = "<div class='btn-group btn-group-toggle' data-toggle='buttons'><label class='btn btn-outline-success'><input type='radio' name='options' id='option1' class='radio-hide' autocomplete='off' checked>YES</label><label class='btn btn-outline-danger'><input type='radio' name='options' id='option2' class='radio-hide' autocomplete='off'>NO</label></div>"

    // Contains NA option \/
    // var qhtml = "<div class='btn-group btn-group-toggle' data-toggle='buttons'><label class='btn btn-outline-success'><input type='radio' name='options' id='option1' class='radio-hide' autocomplete='off' checked>YES</label><label class='btn btn-outline-warning'><input type='radio' name='options' id='option1' class='radio-hide' autocomplete='off' checked=''>NA</label><label class='btn btn-outline-danger'><input type='radio' name='options' id='option2' class='radio-hide' autocomplete='off'>NO</label></div>"

    questions[i].innerHTML = qhtml + questions[i].innerHTML
}

// Initialize the annotation interface
var sentId = 0
var data = getJSON()
var allAnswers = {} // Stores outputs over all sentences
var checkInvalid = false

let original, simplified, alignment, phraseIdx, sentenceAnswers 

initializeInterface()
displayPhrase(phraseIdx)
