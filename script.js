$(document).ready(function () {
    var recordBox
    var sinceTime
    var tillTime
    var resTimeInput
    var workName
    var curRow
    var container
    var containerOfCopyRes = $('#copy-result')
    var totalHours = $('#total_hours')

    initTimeMask()
    bindCont()

    function bindCont() {
        recordBox = $('.record-box')
        initTimeMask()

        $.each(recordBox, function (index, value) {
            $(value).unbind('click').on('click', function () {
                // console.log('click at ' + $(value).attr('data-row'))

                sinceTime = $(value).find('[data-linked=sinceTime]')
                tillTime = $(value).find('[data-linked=tillTime]')
                resTimeInput = $(value).find('[data-linked=timeResult]')
                workName = $(value).find('[data-linked=workName]')
                curRow = $(value).attr('data-row')
                if(curRow == recordBox.length - 1) {
                    $('#addRow').click()
                }

                tillTime.unbind('keyup').bind({'keyup': myHandler})
                sinceTime.unbind('keyup').bind('keyup', myHandler)
                workName.unbind('keyup').bind({'keyup': copyHandler})

                resTimeInput.unbind('click').bind('click', function (e) {
                    if(resTimeInput.val().length > 0) {
                        navigator.clipboard.writeText(resTimeInput.val());
                        // console.log('copied: ' + resTimeInput.val())
                    }
                    e.stopPropagation()
                });
            })
        });
    }

    $(recordBox).parent().find('[data-first=first]').click()

    function myHandler() {
        var nextSinceTime = $(recordBox[curRow]).find('[data-linked=sinceTime]')
        var nextTillTime = $(recordBox[curRow]).find('[data-linked=tillTime]')
        if(tillTime.val() == '' || sinceTime.val() == '' || tillTime.val().length < 7 || sinceTime.val().length < 7) {
            if(nextSinceTime.val() != '' && nextTillTime.val() == '') {
                nextSinceTime.val('')
            }
            resTimeInput.val('')
            resTimeInput.attr('data-mins', '')
            copyHandler()
            totalHours.empty().append('Total hours: ' + getTotalHours())
            return
        }

        if(sinceTime.val().length === 7) {
            tillTime.focus()
        }
        if (sinceTime.val().length === 7 && tillTime.val().length === 7) {
            workName.focus()
            var valSince = sinceTime.val()
            var valTill = tillTime.val()

            var arrSince = valSince.split(' : ');
            var arrTill = valTill.split(' : ');

            var minSince = (parseInt(arrSince[0]) * 60) + parseInt(arrSince[1])
            var minTill = (parseInt(arrTill[0]) * 60) + parseInt(arrTill[1])

            var resTotalMin = minTill - minSince

            resTimeInput.val(minToTime(resTotalMin))
            resTimeInput.attr('data-mins', resTotalMin)

            nextSinceTime.val(tillTime.val())
            copyHandler()
            totalHours.empty().append('Total hours: ' + getTotalHours())
        }
    }

    function copyHandler() {
        recordBox = $('.record-box')
        let resTime
        let workName
        let textToCopy = ''
        let namesObj = {}
        $.each(recordBox, function (index, value) {
            resTime = $(value).find('[data-linked=timeResult]')
            workName = $(value).find('[data-linked=workName]')
            if(!namesObj[workName.val()]) {
                namesObj[workName.val()] = resTime.attr('data-mins')
            } else {
                let temp = namesObj[workName.val()]
                namesObj[workName.val()] = parseInt(temp) + parseInt(resTime.attr('data-mins'))
            }
        });

        textToCopy = objTimeToStr(namesObj)
        containerOfCopyRes.val('').val(textToCopy)
    }

    $('#addRow').on('click', function () {
        container = $('#time-recorder')
        var childSize = container[0].children.length + 1
        container.append('<div class="row col-12 record-box" data-row="' + childSize + '" data-name="cont">\n' +
            '                <div class="col-1">\n' +
            '                    <label>\n' +
            '                        <input tabindex="-1" class="w-100 js-mask-time" data-linked="sinceTime" type="text" inputmode="numeric">\n' +
            '                    </label>\n' +
            '                </div>\n' +
            '                <div class="col-1">\n' +
            '                    <label>\n' +
            '                        <input tabindex="-1" class="w-100 js-mask-time" data-linked="tillTime" type="text" inputmode="numeric">\n' +
            '                    </label>\n' +
            '                </div>\n' +
            '                <div class="col-1">\n' +
            '                    <label>\n' +
            '                        <input tabindex="-1" class="w-100" readonly data-linked="timeResult" type="text" data-mins="">\n' +
            '                    </label>\n' +
            '                </div>\n' +
            '                <div class="col-9 row">\n' +
            '                    <label class="w-100">\n' +
            '                        <textarea class="w-100" data-linked="workName" cols="40" rows="1"></textarea>\n' +
            '                    </label>\n' +
            '                </div>\n' +
            '            </div>')
        bindCont()
    })

    $('#copy').on('click', function () {
        container = $('#time-recorder')
        recordBox = $('.record-box')
        let resTime
        let workName
        let textToCopy = ''
        let namesObj = {}
        $.each(recordBox, function (index, value) {
            resTime = $(value).find('[data-linked=timeResult]')
            workName = $(value).find('[data-linked=workName]')
            if(!namesObj[workName.val()]) {
                namesObj[workName.val()] = resTime.attr('data-mins')
            } else {
                let temp = namesObj[workName.val()]
                namesObj[workName.val()] = parseInt(temp) + parseInt(resTime.attr('data-mins'))
            }
        });

        textToCopy = objTimeToStr(namesObj)
        navigator.clipboard.writeText(textToCopy);
    })

    function getTotalHours() {
        recordBox = $('.record-box')
        let resTime
        let totalHours = 0

        $.each(recordBox, function (index, value) {
            resTime = $(value).find('[data-linked=timeResult]')

            if(resTime.attr('data-mins')) {
                totalHours += parseInt(resTime.attr('data-mins'))
            }
        });
        return (parseInt((totalHours/60) * 100)) / 100
    }

    function initTimeMask() {
        $('.js-mask-time').mask('A9 : B9', {'translation': {
                A: {pattern: /[0-2]/},
                B: {pattern: /[0-5]/},
            }
        });
    }

    function minToTime(resTotalMin) {
        var resMin = parseInt(resTotalMin % 60)
        var resHour = parseInt(resTotalMin / 60)

        var resText
        if(resMin === 0 && resHour !== 0) {
            resText = resHour + 'ч'
        } else if(resMin !== 0 && resHour === 0) {
            resText = resMin + 'мин'
        } else {
            resText = resHour + 'ч ' + resMin + 'мин'
        }

        return resText
    }

    function objTimeToStr(namesObj) {
        let textToCopy = ''
        for (let [key, value] of Object.entries(namesObj)) {
            if(!value || !key)
                continue

            textToCopy += minToTime(value) + ' ' + key + '\n'
        }
        return textToCopy
    }
})