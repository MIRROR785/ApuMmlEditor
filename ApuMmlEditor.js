/**
 * ApuKeyboard.js
 *
 * @author @MIRROR_
 * @license MIT
 */
window.onload = function(event) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;

    function setSelectValue(elem, value) {
        let options = elem.options;
        let index = -1;
        for (let i = 0; i < options.length; ++i) {
            let v = options[i].value;
            if (v == value) {
                index = i;
                break;
            }
        }
        elem.selectedIndex = index;
    }

    function countUpIndex(elem) {
        let indexMax = elem.length - 1;
        let index = (elem.selectedIndex < indexMax) ? elem.selectedIndex + 1 : indexMax;
        elem.selectedIndex = index;
    }

    function countDownIndex(elem) {
        let indexMin = 1;
        let index = (elem.selectedIndex > indexMin) ? elem.selectedIndex - 1 : indexMin;
        elem.selectedIndex = index;
    }

    // MML editor
    const mmlEditor = document.querySelector('#mml-editor');
    const playStartButton = document.querySelector('#play-start');
    const playStopButton = document.querySelector('#play-stop');
    const masterVolume = document.querySelector('#master-volume');
    const masterLoop = document.querySelector('#master-loop');
    const track1Voice = document.querySelector('#track1-voice');
    const track2Voice = document.querySelector('#track2-voice');

    var player = new ApuMmlPlayer();
    player.sampleTime = 60.0;
    player.sampleBits = 32;
    player.setup();
    player.setDeviceParameter({
        unit0: {
        1: {Voice:2},
        2: {Voice:2},
        3: {Voice:0},
        4: {Voice:0}}
    });

    setSelectValue(masterVolume, Math.floor(player.volumeScale * 10) / 10.0);

    var playerAudioUnit = player.audioUnits['unit0'];
    var playerDev1 = playerAudioUnit.apu.devices[1];
    var playerDev2 = playerAudioUnit.apu.devices[2];
    setSelectValue(track1Voice, playerDev1.getVoice());
    setSelectValue(track2Voice, playerDev2.getVoice());

    var playerSource = null;
    function playStart() {
        playStop();

        player.reset();
        player.volumeScale = parseFloat(masterVolume.value);
        player.loopCount = parseInt(masterLoop.value);
        playerDev1.setVoice(parseInt(track1Voice.value));
        playerDev2.setVoice(parseInt(track2Voice.value));

        console.log('Parse MML text.');
        let container = MmlContainer.parse(mmlEditor.value);
        let audioCtx = new AudioContext();
        audioCtx.sampleRate = 44100;
        playerSource = audioCtx.createBufferSource();
        playerSource.buffer = player.play(audioCtx, container);
        playerSource.connect(audioCtx.destination);
        playerSource.onended = function() {
            console.log('Play ended.');
            playerSource = null;
        };
        console.log('Play start.');
        playerSource.start();
    }

    function playStop() {
        if (playerSource !== null) {
            console.log('Play stop.');
            playerSource.stop();
            playerSource = null;
        }
    }

    playStartButton.addEventListener('click', playStart);
    playStopButton.addEventListener('click', playStop);


    // Mini keyboard and Track editor
    const audioDevice = document.querySelector('#audio-device');
    const audioVoice = document.querySelector('#audio-voice');
    const audioTempo = document.querySelector('#audio-tempo');
    const audioVolume = document.querySelector('#audio-volume');
    const audioOctave = document.querySelector('#audio-octave');
    const audioLength = document.querySelector('#audio-length');
    const currentVolume = document.querySelector('#current-volume');
    const currentOctave = document.querySelector('#current-octave');
    const currentLength = document.querySelector('#current-length');

    const trackTinyEditor = document.querySelector('#track-tiny-editor');
    const trackContentTop = document.querySelector('#track-content-top');
    const trackContentCaret = document.querySelector('#track-content-caret');
    const trackContentSelection = document.querySelector('#track-content-selection');
    const trackContentBottom = document.querySelector('#track-content-bottom');
    const trackTextEditor = document.querySelector('#track-text-editor');

    const kc1Button = document.querySelector('#key-c1');
    const kcs1Button = document.querySelector('#key-cs1');
    const kd1Button = document.querySelector('#key-d1');
    const kds1Button = document.querySelector('#key-ds1');
    const ke1Button = document.querySelector('#key-e1');
    const kf1Button = document.querySelector('#key-f1');
    const kfs1Button = document.querySelector('#key-fs1');
    const kg1Button = document.querySelector('#key-g1');
    const kgs1Button = document.querySelector('#key-gs1');
    const ka1Button = document.querySelector('#key-a1');
    const kas1Button = document.querySelector('#key-as1');
    const kb1Button = document.querySelector('#key-b1');
    const kuc1Button = document.querySelector('#key-uc1');

    const kc0Button = document.querySelector('#key-c0');
    const kcs0Button = document.querySelector('#key-cs0');
    const kd0Button = document.querySelector('#key-d0');
    const kds0Button = document.querySelector('#key-ds0');
    const ke0Button = document.querySelector('#key-e0');
    const kf0Button = document.querySelector('#key-f0');
    const kfs0Button = document.querySelector('#key-fs0');
    const kg0Button = document.querySelector('#key-g0');
    const kgs0Button = document.querySelector('#key-gs0');
    const ka0Button = document.querySelector('#key-a0');
    const kas0Button = document.querySelector('#key-as0');
    const kb0Button = document.querySelector('#key-b0');
    const kuc0Button = document.querySelector('#key-uc0');

    const octaveUpButton = document.querySelector('#key-octave-up');
    const octaveDownButton = document.querySelector('#key-octave-down');
    const volumeUpButton = document.querySelector('#key-volume-up');
    const volumeDownButton = document.querySelector('#key-volume-down');

    const upButton = document.querySelector('#key-up');
    const downButton = document.querySelector('#key-down');
    const leftButton = document.querySelector('#key-left');
    const rightButton = document.querySelector('#key-right');
    const delButton = document.querySelector('#key-del');
    const bsButton = document.querySelector('#key-bs');
    const replayButton = document.querySelector('#key-replay');
    const clearButton = document.querySelector('#key-clear');

    var audio = new ApuMmlPlayer({AudioUnits: [{Name: 'unit0', Devices: [1,3,4]}]});
    audio.sampleTime = 10.0;
    audio.sampleBits = 32;
    var audioUnit = audio.audioUnits['unit0'];

    audioDevice.value = 0;
    audioVoice.value = 0;
    audioTempo.value = 120;
    audioVolume.value = 5;
    audioOctave.value = 4;
    audioLength.value = 4;
    currentVolume.value = 5;
    currentOctave.value = 4;
    currentLength.value = 4;

	// TODO : Create OnCycleSound
	var deviceNotes = [];
	
	// TODO : Auto Move octave

    const DirectionNone = 'none';
    const DirectionForward ='forward';
    const DirectionBackword ='backword';
    var trackSelectionDirection = DirectionNone;

    function openTextEditor() {
        trackTextEditor.hidden = false;

        let contentTop = trackContentTop.innerText;
        let contentSelection = trackContentSelection.innerText;
        let contentBottom = trackContentBottom.innerText;
        let selectionStart = contentTop.length;
        let selectionEnd = selectionStart + contentSelection.length;

        trackTextEditor.value = contentTop + contentSelection + contentBottom;
        trackTextEditor.setSelectionRange(selectionStart, selectionEnd, trackSelectionDirection);

        trackTinyEditor.hidden = true;
        trackTextEditor.focus();
    }

    function closeTextEditor() {
        trackTinyEditor.hidden = false;

        let content = trackTextEditor.value;
        let contentTop = content.substring(0, trackTextEditor.selectionStart);
        let contentSelection = content.substring(trackTextEditor.selectionStart, trackTextEditor.selectionEnd);
        let contentBottom = content.substring(trackTextEditor.selectionEnd);

        trackContentTop.innerText = contentTop;
        trackContentSelection.innerText = contentSelection;
        trackContentBottom.innerText = contentBottom;
        trackSelectionDirection = trackTextEditor.selectionDirection;

        trackTextEditor.hidden = true;
    }

    function moveLeftCaret() {
        let contentTop = trackContentTop.innerText;
        let contentSelection = trackContentSelection.innerText;
        let contentBottom = trackContentBottom.innerText;

        if (trackSelectionDirection === DirectionForward && contentSelection.length > 0) {
            let last = contentSelection.length - 1;
            let ch = contentSelection.substring(last);
            contentSelection = contentSelection.substring(0, last);
            contentBottom = ch + contentBottom;

        } else {
            trackSelectionDirection = DirectionNone;

            let previous = contentTop.length - 1;
            if (previous >= 0) {
                let ch = contentTop.substring(previous);
                contentTop = contentTop.substring(0, previous);

                if (keyDownEvent.shiftKey) {
                    contentSelection = ch + contentSelection;
                    trackSelectionDirection = DirectionBackword;

                } else {
                    contentBottom = ch + contentSelection + contentBottom;
                    contentSelection = '';
                }
            }
        }

        trackContentTop.innerText = contentTop;
        trackContentSelection.innerText = contentSelection;
        trackContentBottom.innerText = contentBottom;

        keyDownEvent = null;
    }

    function moveRightCaret() {
        let contentTop = trackContentTop.innerText;
        let contentSelection = trackContentSelection.innerText;
        let contentBottom = trackContentBottom.innerText;

        if (trackSelectionDirection === DirectionBackword && contentSelection.length > 0) {
            let ch = contentSelection.substring(0, 1);
            contentSelection = contentSelection.substring(1);
            contentTop = contentTop + ch;

        } else {
            trackSelectionDirection = DirectionNone;

            if (contentBottom.length > 0) {
                let ch = contentBottom.substring(0, 1);
                contentBottom = contentBottom.substring(1);

                if (keyDownEvent.shiftKey) {
                    contentSelection = contentSelection + ch;
                    trackSelectionDirection = DirectionForward;

                } else {
                    contentTop = contentTop + contentSelection + ch;
                    contentSelection = '';
                }
            }
        }

        trackContentTop.innerText = contentTop;
        trackContentSelection.innerText = contentSelection;
        trackContentBottom.innerText = contentBottom;

        keyDownEvent = null;
    }

    function deleteSelectionValue() {
        let contentSelection = trackContentSelection.innerText;
        if (contentSelection.length > 0) {
            trackContentSelection.innerText = '';
            replay = null;
        } else {
            let contentBottom = trackContentBottom.innerText;
            if (contentBottom.length > 0) {
                trackContentBottom.innerText = contentBottom.substring(1);
                replay = null;
            }
        }
    }

    function backspaceSelectionValue() {
        let contentTop = trackContentTop.innerText;
        let previous = contentTop.length - 1;
        if (previous >= 0) {
            trackContentTop.innerText = contentTop.substring(0, previous);
            replay = null;
        }
    }

    var replay = null;
    var replaySource = null;
    function replayStart() {
        replayStop();

        let audioCtx = new AudioContext();
        audioCtx.sampleRate = 44100;

        if (replay === null) {
            let index = parseInt(audioDevice.value);
            if (index < 0) {
                index = 0;
            } else {
                let deviceNo = audioUnit.trackNumbers[index];
                let dev = audioUnit.apu.devices[deviceNo];
                dev.setVoice(parseInt(audioVoice.value));
            }

            let tempo = parseInt(audioTempo.value);
            let trackNo = index + 1;
            let volume = parseInt(audioVolume.value);
            let octave = parseInt(audioOctave.value);
            let length = parseInt(audioLength.value);
            let value = trackContentTop.innerText + trackContentSelection.innerText + trackContentBottom.innerText;
            let mml = `TR0 t${tempo}\nTR${trackNo} v${volume}o${octave}l${length}` + value;
            console.log(mml);

            let container = MmlContainer.parse(mml);
            audio.reset();
            audio.volumeScale = parseFloat(audioVolume.value);
            audio.loopCount = parseInt(masterLoop.value);
            replay = audio.play(audioCtx, container);
        }

        replaySource = audioCtx.createBufferSource();
        replaySource.buffer = replay;
        replaySource.connect(audioCtx.destination);
        replaySource.onended = function() {
            console.log('Replay ended.');
            replaySource = null;
        };

        console.log('Replay start.');
        replaySource.start();
    }

    function replayStop() {
        if (replaySource !== null) {
            console.log('Replay stop.');
            replaySource.stop();
            replaySource = null;
        }
    }

    var controlButtons = {
        ArrowUp: upButton,
        ArrowDown: downButton,
        ArrowLeft: leftButton,
        ArrowRight: rightButton,
        Delete: delButton,
        Backspace: bsButton,
        Enter: replayButton,
    };

    var keyButtons = {
        s: kcs0Button,
        d: kds0Button,
        g: kfs0Button,
        h: kgs0Button,
        j: kas0Button,
        z: kc0Button,
        x: kd0Button,
        c: ke0Button,
        v: kf0Button,
        b: kg0Button,
        n: ka0Button,
        m: kb0Button,
        ',': kuc0Button,

        '2': kcs1Button,
        '3': kds1Button,
        '5': kfs1Button,
        '6': kgs1Button,
        '7': kas1Button,
        q: kc1Button,
        w: kd1Button,
        e: ke1Button,
        r: kf1Button,
        t: kg1Button,
        y: ka1Button,
        u: kb1Button,
        i: kuc1Button,

        a: octaveDownButton,
        l: octaveUpButton,
        '1': volumeDownButton,
        '9': volumeUpButton
    };

    var keyValues = {
        'key-c0' : {code:'c' , value:0 , octave:0},
        'key-cs0': {code:'c#', value:1 , octave:0},
        'key-d0' : {code:'d' , value:2 , octave:0},
        'key-ds0': {code:'d#', value:3 , octave:0},
        'key-e0' : {code:'e' , value:4 , octave:0},
        'key-f0' : {code:'f' , value:5 , octave:0},
        'key-fs0': {code:'f#', value:6 , octave:0},
        'key-g0' : {code:'g' , value:7 , octave:0},
        'key-gs0': {code:'g#', value:8 , octave:0},
        'key-a0' : {code:'a' , value:9 , octave:0},
        'key-as0': {code:'a#', value:10, octave:0},
        'key-b0' : {code:'b' , value:11, octave:0},
        'key-uc0': {code:'c' , value:0 , octave:1},

        'key-c1' : {code:'c' , value:0 , octave:1},
        'key-cs1': {code:'c#', value:1 , octave:1},
        'key-d1' : {code:'d' , value:2 , octave:1},
        'key-ds1': {code:'d#', value:3 , octave:1},
        'key-e1' : {code:'e' , value:4 , octave:1},
        'key-f1' : {code:'f' , value:5 , octave:1},
        'key-fs1': {code:'f#', value:6 , octave:1},
        'key-g1' : {code:'g' , value:7 , octave:1},
        'key-gs1': {code:'g#', value:8 , octave:1},
        'key-a1' : {code:'a' , value:9 , octave:1},
        'key-as1': {code:'a#', value:10, octave:1},
        'key-b1' : {code:'b' , value:11, octave:1},
        'key-uc1': {code:'c' , value:0 , octave:2},

        'key-octave-up'  : {code:'>' , octave: 1},
        'key-octave-down': {code:'<' , octave:-1},
        'key-volume-up'  : {code:')' , volume: 1},
        'key-volume-down': {code:'(' , volume:-1},
    };

    var keyDownEvent = null;
    var previousValue = {};

    function clearTrack() {
        previousValue.octave = parseInt(audioOctave.value);
        previousValue.volume = parseInt(audioVolume.value);
        previousValue.length = parseInt(audioLength.value);
        currentOctave.value = previousValue.octave;
        currentVolume.value = previousValue.volume;
        currentLength.value = previousValue.length;
        trackContentTop.innerText = '';
        trackContentSelection.innerText = '';
        trackContentBottom.innerText = '';
    }

    function keyDownButton(event) {
        let elem = event.currentTarget;
        let kv = keyValues[elem.id];
        elem.classList.add('key-down');

        let octave = parseInt(currentOctave.value);
        let volume = parseInt(currentVolume.value);
        let code = kv.code;

        if (kv.value !== undefined) {
            if (kv.octave !== undefined) {
                let nextOctave = octave + kv.octave;
                let diffOctave = nextOctave - previousValue.octave;

                if (diffOctave > 0) {
                    trackContentTop.innerText += '>'.repeat(diffOctave) + code;

                } else if (diffOctave < 0) {
                    trackContentTop.innerText += '<'.repeat(-diffOctave) + code;

                } else {
                    trackContentTop.innerText += code;
                }
                octave = nextOctave;
                replay = null;
            }

        } else {
            if (kv.octave !== undefined) {
                if (kv.octave < 0) {
                    countDownIndex(currentOctave);
                } else {
                    countUpIndex(currentOctave);
                }
                octave = parseInt(currentOctave.value);

                if (octave !== previousValue.octave) {
                    trackContentTop.innerText += code;
                    replay = null;
                }
            }
            if (kv.volume !== undefined) {
                if (kv.volume < 0) {
                    countDownIndex(currentVolume);
                } else {
                    countUpIndex(currentVolume);
                }
                volume = parseInt(currentVolume.value);

                if (volume !== previousValue.volume) {
                    trackContentTop.innerText += code;
                    replay = null;
                }
            }
        }

        previousValue.octave = octave;
        previousValue.volume = volume;
    }

    function keyUpButton() {
        let elem = document.querySelector('.key-down');
        if (elem !== null) {
            elem.classList.remove('key-down');
        }
        keyDownEvent = null;
    }

    document.body.addEventListener('keydown', (event) => {
        if (keyDownEvent === null || event.key !== keyDownEvent.key) {
            keyDownEvent = event;

            let elem = document.activeElement;
            let tagName = elem.tagName;
            if (tagName === 'BODY' || tagName === 'BUTTON') {
                let btn = keyButtons[keyDownEvent.key];
                if (btn !== undefined) {
                    btn.focus();
                    keyDownButton({currentTarget:btn});

                } else {
                    btn = controlButtons[keyDownEvent.key];
                    if (btn !== undefined) {
                        btn.focus();
                        btn.click();
                    }
                }
            }
        }
    });
    document.body.addEventListener('keyup', keyUpButton);

    audioDevice.addEventListener('change', (event) => {
        let index = parseInt(audioDevice.value);
        if (index >= 0) {
            let deviceNo = audioUnit.trackNumbers[index];
            let dev = audioUnit.apu.devices[deviceNo];
            setSelectValue(audioVoice, (deviceNo <= 2) ? dev.getVoice() : -1);
        }
        replay = null;
    });

    audioVoice.addEventListener('change', (event) => {
        console.log(event);
        replay = null;
    });

    audioVolume.addEventListener('change', (event) => {
        console.log(event);
        replay = null;
    });

    audioOctave.addEventListener('change', (event) => {
        console.log(event);
        replay = null;
    });

    audioLength.addEventListener('change', (event) => {
        console.log(event);
        replay = null;
    });

    currentVolume.addEventListener('change', (event) => {
        console.log(event);
        replay = null;
    });

    currentOctave.addEventListener('change', (event) => {
        console.log(event);
        replay = null;
    });

    currentLength.addEventListener('change', (event) => {
        console.log(event);
        replay = null;
    });

    trackTinyEditor.addEventListener('click', openTextEditor);
    trackTextEditor.addEventListener('blur', closeTextEditor);

    trackTinyEditor.hidden = false;
    trackTextEditor.hidden = true;

    for (var id in keyValues) {
        let btn = document.querySelector('#' + id);
        btn.addEventListener('mousedown', keyDownButton);
        btn.addEventListener('mouseup', keyUpButton);
    }

    upButton.addEventListener('click', () => {
        countUpIndex(audioDevice);
        replay = null;
    });
    downButton.addEventListener('click', () => {
        countDownIndex(audioDevice);
        replay = null;
    });

    leftButton.addEventListener('click', moveLeftCaret);
    rightButton.addEventListener('click', moveRightCaret);
    delButton.addEventListener('click', deleteSelectionValue);
    bsButton.addEventListener('click', backspaceSelectionValue);
    replayButton.addEventListener('click', replayStart);
    clearButton.addEventListener('click', clearTrack);

    clearTrack();
}
