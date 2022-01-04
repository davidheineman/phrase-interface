// TODO: ALLOW FOR ANNOTATING ADDITIONS
// Edit displayPhrase to allow for this
// After all the phrases from input -> output have been annotated, annotate additions

// Key:
// 0 = No edit
// 1 = Rephrase
// 2 = Deletion
// 3 = Re-order of Wording
// 4 = Addition

function highlightWord (sent, i, holderId) {
    $('#' + i + holderId).addClass(getColor(sent[i][1]))
}

function getColor (id) {
    if (id === 1) {
        return 'rp'
    } else if (id === 2) {
        return 'del'
    } else if (id === 3) {
        return 'reword'
    } else if (id === 4) {
        return 'add'
    }
}

// Called each time a new sentence is displayed
function initializeInterface () {
    // Reset variables
    original = data[sentId].Original
    simplified = data[sentId].Simplified
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

function drawInterface () {
    // Reset Containers
    $('#in-container').html('')
    $('#out-container').html('')
    $('#line-container').html('')

    // Generate and highlight sentences
    for (let i = 0; i < original.length; i++) {
        $('#in-container').append('<span ' + 'id="' + i + 'b"' + ' >' + original[i][2] + '</span> ')
        highlightWord(original, i, 'b')
    }

    for (let i = 0; i < simplified.length; i++) {
        $('#out-container').append('<span ' + 'id="' + i + 'e"' + ' >' + simplified[i][2] + '</span> ')
        highlightWord(simplified, i, 'e')
    }

    // Draws lines and creates :hover between types of edits
    for (let i = 0; i < original.length; i++) {
        $('#line-container').append("<div class='line' id='" + i + "l'></div>")

        // Only draws lines for rephrases
        if (original[i][0].length > 0 && original[i][1] !== 0) {
            const mapping = original[i][0][0]

            // Highlight on hover logic
            $('#' + i + 'b, #' + mapping + 'e, #' + i + 'l').hover(function () {
                $('#' + i + 'b').addClass('bolded')
                $('#' + mapping + 'e').addClass('bolded')
                $('#' + i + 'l').addClass('bolded-line')
            }, function () {
                if (phraseIdx !== i) {
                    $('#' + i + 'b').removeClass('bolded')
                    $('#' + mapping + 'e').removeClass('bolded')
                    $('#' + i + 'l').removeClass('bolded-line')
                }
            })

            // Switch to this rephrase on click
            $('#' + i + 'b, #' + mapping + 'e, #' + i + 'l').click(function () {
                highlightNextPhrase(i)
            })

            // Draw the line between two rephrases
            adjustLine(
                document.getElementById(i + 'b'),
                document.getElementById(original[i][0][0] + 'e'),
                document.getElementById(i + 'l')
            )
        } else if (original[i][1] !== 0) {
            // Add ability to hover over deletions & additions
            $('#' + i + 'b').hover(function () {
                $('#' + i + 'b').addClass('bolded')
            }, function () {
                if (phraseIdx !== i) {
                    $('#' + i + 'b').removeClass('bolded')
                }
            })

            // Add ability to click deletions / additions
            $('#' + i + 'b').click(function () {
                highlightNextPhrase(i)
            })
        }
    }
}

function displayPhrase (i) {
    const phraseMapping = original[i][0]; 
    const phraseType = original[i][1]; 
    const phraseContent = original[i][2]

    // Remove permanent bolding everywhere
    $('.bolded-perm').removeClass('bolded-perm')
    $('.bolded-line-perm').removeClass('bolded-line-perm')

    $('.question').removeClass('question-hide')
    $('#left-a').html('<span class=' + getColor(phraseType) + '>' + phraseContent + '</span>')
    if (phraseMapping.length > 0) {
        // On a rephrase, display both phrases and a line connecting them
        $('#right-a').html('<span class=' + getColor(simplified[phraseMapping[0]][1]) + '>' + simplified[phraseMapping[0]][2] + '</span>')
        $('#line-a').removeClass('radio-hide')
        adjustLine(
            document.getElementById('right-a'),
            document.getElementById('left-a'),
            document.getElementById('line-a'),
            true
        )

        // Add permanent bolding for the line connecting
        $('#' + i + 'b').addClass('bolded-perm')
        $('#' + phraseMapping[0] + 'e').addClass('bolded-perm')
        $('#' + i + 'l').addClass('bolded-line-perm')

        // If the edit needs questions hidden, hide them
        if (phraseType === 3) {
            $('#q5, #q6, #q7, #q8').addClass('question-hide')
        } else if (phraseType === 4) {
            $('#q7, #q8').addClass('question-hide')
        } else if (phraseType === 0) {
            $('.question').addClass('question-hide')
        }
    } else {
        // On an addition / deletion, only display that one phrase
        $('#q5, #q6').addClass('question-hide')
        $('#' + i + 'b').addClass('bolded')
        $('#right-a').html('')
        $('#line-a').addClass('radio-hide')
    }

    // Hides highlight for other annotations
    const enableHighlightToggle = false
    if ($('#highlight-toggle').is(':checked') || !enableHighlightToggle) {
        $('#in-container > span, #out-container > span').each(function () { $(this).addClass('hide-highlight') })
        $('#' + i + 'b').removeClass('hide-highlight')
        $('#' + phraseMapping[0] + 'e').removeClass('hide-highlight')
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
    if (phraseType === 0) {
        moveToNextAnnotation()
    }
}

function moveToNextAnnotation () {
    // Store answers to current phrase
    sentenceAnswers[phraseIdx] = getPhraseAnswers()

    // Either we move to the next phrase, the next sentence, or we download data
    if (phraseIdx < original.length - 1) {
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
    $('#' + phraseIdx + 'b').removeClass('bolded')
    $('#' + original[phraseIdx][0][0] + 'e').removeClass('bolded')
    $('#' + phraseIdx + 'l').removeClass('bolded-line')

    if (index === -1) {
        phraseIdx++
    } else {
        phraseIdx = index
    }

    displayPhrase(phraseIdx)
}

function getJSON () {
    const resp = []
    $.ajax({
        url: 'data/input.json',
        type: 'GET',
        dataType: 'json',
        async: false,
        success: function (data) {
            resp.push(data)
        }
    })
    return resp[0]
}

// Downloads output as .json file
function downloadData () {
    // Download JSON data
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

$('#highlight-toggle').click(function () {
    if ($('#highlight-toggle').is(':checked')) {
        $('#in-container > span, #out-container > span').each(function () { $(this).addClass('hide-highlight') })
        $('#' + phraseIdx + 'b').removeClass('hide-highlight')
        $('#' + original[phraseIdx][0][0] + 'e').removeClass('hide-highlight')
    } else {
        $('#in-container > span, #out-container > span').each(function () { $(this).removeClass('hide-highlight') })
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

let original, alignment, simplified, phraseIdx, sentenceAnswers // Stores answers, reference sent, generated sent, current phrase index and current sentence's annotations

initializeInterface()
displayPhrase(phraseIdx)
