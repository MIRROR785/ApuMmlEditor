/**
 * ApuKeyboard.js
 *
 * @author @MIRROR_
 * @license MIT
 */
window.onload = function(event) {
    // Menu
    const menuMml = document.querySelector('#memu-mml');
    const menuMiniKeyboard = document.querySelector('#memu-mini-keyboard');
    const sectionMml = document.querySelector('#mml');
    const sectionMiniKeyboard = document.querySelector('#mini-keyboard');

    function setActive(menu, section, value) {
        if (value) {
            menu.classList.add('active');
            section.hidden = false;
            section.focus();
        } else {
            menu.classList.remove('active');
            section.hidden = true;
        }
    }

    menuMml.addEventListener('click', (event) => {
        setActive(menuMml, sectionMml, true);
        setActive(menuMiniKeyboard, sectionMiniKeyboard, false);
    });
    menuMiniKeyboard.addEventListener('click', (event) => {
        setActive(menuMml, sectionMml, false);
        setActive(menuMiniKeyboard, sectionMiniKeyboard, true);
    });

    setActive(menuMml, sectionMml, true);
    setActive(menuMiniKeyboard, sectionMiniKeyboard, false);

    // Common
    const AudioContext = window.AudioContext || window.webkitAudioContext;

    const message = document.querySelector('#message');
    message.hidden = true;
    function wakeUpAudioContext(audioCtx) {
        // check if context is in suspended state (autoplay policy)
        if (audioCtx.state === 'suspended') {
            var userGestureEvent = (event) => {
                message.removeEventListener('click', userGestureEvent);
                message.innerText = '';
                message.hidden = true;
                message.classList.remove('warnning');
                audioCtx.resume();
            };
            message.innerText = '自動再生ポリシーによってユーザ操作を必要としています。\nThe autoplay policy requires user interaction.\nこのメッセージをタッチすると音が再生されます。\nTouch this message for sound playback.';
            message.hidden = false;
            message.classList.add('warnning');
            message.addEventListener('click', userGestureEvent);
        }
    }

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

    function emptyAction(event) {
        return false;
    }

    // MML editor
    const mmlEditor = document.querySelector('#mml-editor');
    const playStartButton = document.querySelector('#play-start');
    const mmlClearButton = document.querySelector('#mml-clear');
    const masterVolume = document.querySelector('#master-volume');
    const masterLoop = document.querySelector('#master-loop');
    const track1Voice = document.querySelector('#track1-voice');
    const track2Voice = document.querySelector('#track2-voice');

    var player = new ApuMmlPlayer();
    player.sampleTime = 300;
    player.sampleBits = 32;
    player.volumeScale = 2.0;
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
        if (playerSource !== null) {
            playStop();
            return;
        }

        playStartButton.classList.add('play');
        let audioCtx = new AudioContext();
        audioCtx.sampleRate = 44100;

        player.reset();
        player.volumeScale = parseFloat(masterVolume.value);
        player.loopCount = parseInt(masterLoop.value);
        playerDev1.setVoice(parseInt(track1Voice.value));
        playerDev2.setVoice(parseInt(track2Voice.value));

        console.log('Parse MML text.');
        let container = MmlContainer.parse(mmlEditor.value);
        playerSource = audioCtx.createBufferSource();
        playerSource.buffer = player.play(audioCtx, container);
        playerSource.connect(audioCtx.destination);
        playerSource.onended = (event) => {
            console.log('Play ended.');
            playerSource = null;
            playStartButton.classList.remove('play');
        };
        console.log('Play start.');
        playerSource.start();
        wakeUpAudioContext(audioCtx);
    }

    function playStop() {
        if (playerSource !== null) {
            console.log('Play stop.');
            playerSource.stop();
            playerSource = null;
            playStartButton.classList.remove('play');
        }
    }

    function mmlClear() {
        mmlEditor.value = '';
    }

    playStartButton.onpointerdown = playStart;
    playStartButton.onclick = emptyAction;
    playStartButton.oncontextmenu = emptyAction;
    mmlClearButton.addEventListener('click', mmlClear);


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
    const keyMuteCheckbox = document.querySelector('#key-mute');
    const clearButton = document.querySelector('#key-clear');

    const trackContentCaretTop = trackContentCaret.offsetTop;
    const trackContentCaretPaddingTop = trackContentCaret.offsetTop - trackTinyEditor.offsetTop;

    var audio = new ApuMmlPlayer({AudioUnits: [{Name: 'unit0', Devices: [2,3,4]}]});
    var audioUnit = audio.audioUnits['unit0'];
    audio.sampleTime = 300;
    audio.sampleBits = 32;

    audioDevice.value = 0;
    audioVoice.value = 0;
    audioTempo.value = 120;
    audioVolume.value = 15;
    audioOctave.value = 4;
    audioLength.value = 4;
    currentVolume.value = 15;
    currentOctave.value = 4;
    currentLength.value = 4;
    keyMuteCheckbox.checked = true;

    var isKeyMute = keyMuteCheckbox.checked;
    keyMuteCheckbox.addEventListener('change', (event) => {
        isKeyMute = keyMuteCheckbox.checked;
        if (isKeyMute) {
            noteOffDevice();
        }
        event.target.blur();
    });

    var noteSources = [];
    function noteOnDevice(noteNo, volume) {
        noteOffDevice();
        audio.reset();

        let index = parseInt(audioDevice.value);
        if (index < 0) {
            index = 0;
        }

        let trackNo = index + 2;
        let voice = parseInt(audioVoice.value);
        let trackParams = {};
        trackParams[trackNo] = {'Voice': voice, 'Volume': volume, 'NoteNo': noteNo};

        audio.volumeScale = parseFloat(masterVolume.value);

        let audioCtx = new AudioContext();
        audioCtx.sampleRate = 44100;

        let data = audio.oneCycleSound(audioCtx, {'unit0' : trackParams});
        let noteSource = audioCtx.createBufferSource();
        noteSource.buffer = data;
        noteSource.connect(audioCtx.destination);
        noteSource.onended = (event) => {
            //console.log('Note ended.');
        };

        //console.log('Note On.');
        noteSource.loop = true;
        noteSources.push(noteSource);
        noteSource.start();
        wakeUpAudioContext(audioCtx);
    }

    function noteOffDevice() {
        let noteSource;

        while ((noteSource = noteSources.shift()) !== undefined) {
            //console.log('Note off.');
            noteSource.stop();
        }
    }

    const DirectionNone = 'none';
    const DirectionForward ='forward';
    const DirectionBackword ='backword';
    var trackSelectionDirection = DirectionNone;

    function upScrollTinyEditor() {
        let ct = trackContentCaret.offsetTop - trackContentCaretTop;
        if (ct < trackTinyEditor.scrollTop || ct > trackTinyEditor.scrollTop + trackTinyEditor.offsetHeight - trackContentCaret.offsetHeight) {
            trackTinyEditor.scrollTop = ct;
        }
    }

    function downScrollTinyEditor() {
        let ct = trackContentCaret.offsetTop - trackContentCaretTop;
        let dt = ct - trackTinyEditor.scrollTop;
        if (dt < 0 || dt > trackTinyEditor.offsetHeight - trackContentCaret.offsetHeight) {
            let at = Math.abs(dt);
            if (at <= trackTinyEditor.offsetHeight) {
                trackTinyEditor.scrollTop = trackContentCaret.offsetHeight * dt / at;
            } else {
                trackTinyEditor.scrollTop = ct;
            }
        }
    }

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
        upScrollTinyEditor();

        trackTextEditor.hidden = true;
        replay = null;
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

                if (keyDownEvent.shiftKey !== undefined && keyDownEvent.shiftKey) {
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
        upScrollTinyEditor();

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

                if (keyDownEvent.shiftKey !== undefined && keyDownEvent.shiftKey) {
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
        downScrollTinyEditor();

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

        keyDownEvent = null;
    }

    function backspaceSelectionValue() {
        let contentTop = trackContentTop.innerText;
        let previous = contentTop.length - 1;

        if (previous >= 0) {
            trackContentTop.innerText = contentTop.substring(0, previous);
            replay = null;
        }

        keyDownEvent = null;
    }

    var replay = null;
    var replaySource = null;
    function replayStart() {

        if (replaySource !== null) {
            replayStop();
            return;
        }

        let audioCtx = new AudioContext();
        audioCtx.sampleRate = 44100;

        if (replay === null) {
            audio.reset();

            let index = parseInt(audioDevice.value);
            if (index < 0) {
                index = 0;
            }
            let trackNo = index + 2;
            let dev = audioUnit.apu.devices[trackNo];
            let voice = parseInt(audioVoice.value);
            dev.setVoice(voice);

            let tempo = parseInt(audioTempo.value);
            let volume = parseInt(audioVolume.value);
            let octave = parseInt(audioOctave.value);
            let length = parseInt(audioLength.value);
            let value = trackContentTop.innerText + trackContentSelection.innerText + trackContentBottom.innerText;
            let mml = `TR0 t${tempo}\nTR${trackNo} v${volume}o${octave}l${length}` + value;
            console.log(mml);

            let container = MmlContainer.parse(mml);
            audio.volumeScale = parseFloat(masterVolume.value);
            audio.loopCount = parseInt(masterLoop.value);
            replay = audio.play(audioCtx, container);
        }

        replaySource = audioCtx.createBufferSource();
        replaySource.buffer = replay;
        replaySource.connect(audioCtx.destination);
        replaySource.onended = (event) => {
            console.log('Replay ended.');
            replaySource = null;
            replayButton.classList.remove('play');
        };

        console.log('Replay start.');
        replayButton.classList.add('play');
        replaySource.start();
        wakeUpAudioContext(audioCtx);
    }

    function replayStop() {
        if (replaySource !== null) {
            console.log('Replay stop.');
            replaySource.stop();
            replaySource = null;
            replayButton.classList.remove('play');
        }
    }

    var clickButtons = {
        ArrowUp: upButton,
        ArrowDown: downButton,
        ArrowLeft: leftButton,
        ArrowRight: rightButton,
        Delete: delButton,
        Backspace: bsButton,
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
        '9': volumeUpButton,

        Enter: replayButton,
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
        replay = null;
    }

    function keyDownButton(event) {
        let elem = event.currentTarget;
        let kv = keyValues[elem.id];

        if (kv === undefined) {
            return;
        }

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
                //console.log(octave);

                if (!isKeyMute) {
                    let noteNo = AudioConst.getNoteNo(octave - 1, kv.value);
                    noteOnDevice(noteNo, volume);
                }
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
        noteOffDevice();
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
                    btn.onpointerdown({currentTarget:btn});
                } else {
                    btn = clickButtons[keyDownEvent.key];
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
        event.target.blur();
    });

    function resetReplay(event) {
        replay = null;
        event.target.blur();
    }

    audioVoice.addEventListener('change', resetReplay);
    audioVolume.addEventListener('change', resetReplay);
    audioOctave.addEventListener('change', resetReplay);
    audioLength.addEventListener('change', resetReplay);
    currentVolume.addEventListener('change', resetReplay);
    currentOctave.addEventListener('change', resetReplay);
    currentLength.addEventListener('change', resetReplay);

    trackTinyEditor.addEventListener('click', openTextEditor);
    trackTextEditor.addEventListener('blur', closeTextEditor);

    trackTinyEditor.hidden = false;
    trackTextEditor.hidden = true;

    for (var id in keyValues) {
        let btn = document.querySelector('#' + id);
        btn.onpointerdown = keyDownButton;
        btn.onpointerup = keyUpButton;
        btn.onclick = emptyAction;
        btn.oncontextmenu = emptyAction;
    }

    upButton.addEventListener('click', (event) => {
        countUpIndex(audioDevice);
        replay = null;
    });
    downButton.addEventListener('click', (event) => {
        countDownIndex(audioDevice);
        replay = null;
    });

    leftButton.addEventListener('click', moveLeftCaret);
    rightButton.addEventListener('click', moveRightCaret);

    delButton.addEventListener('click', deleteSelectionValue);
    bsButton.addEventListener('click', backspaceSelectionValue);
    clearButton.addEventListener('click', clearTrack);

    replayButton.onpointerdown = replayStart;
    replayButton.onpointerup = keyUpButton;
    replayButton.onclick = emptyAction;
    replayButton.oncontextmenu = emptyAction;

    let controls = document.querySelectorAll('button.key-ctrl');
    for (var btn of controls) {
        btn.oncontextmenu = emptyAction;
    }

    clearTrack();
}
