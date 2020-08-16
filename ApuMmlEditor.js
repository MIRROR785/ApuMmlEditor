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
    const trackEditor = document.querySelector('#track-editor');
    const trackEditorCaret = document.querySelector('#track-editor-caret');

    const audioDevice = document.querySelector('#audio-device');
    const audioVoice = document.querySelector('#audio-voice');
    const audioTempo = document.querySelector('#audio-tempo');
    const audioVolume = document.querySelector('#audio-volume');
    const audioOctave = document.querySelector('#audio-octave');
    const audioLength = document.querySelector('#audio-length');
    const currentVolume = document.querySelector('#current-volume');
    const currentOctave = document.querySelector('#current-octave');
    const currentLength = document.querySelector('#current-length');

    const upButton = document.querySelector('#key-up');
    const downButton = document.querySelector('#key-down');
    const leftButton = document.querySelector('#key-left');
    const rightButton = document.querySelector('#key-right');
    const delButton = document.querySelector('#key-del');
    const bsButton = document.querySelector('#key-bs');
    const enterButton = document.querySelector('#key-enter');

    const kcButton = document.querySelector('#key-c');
    const kcsButton = document.querySelector('#key-cs');
    const kdButton = document.querySelector('#key-d');
    const kdsButton = document.querySelector('#key-ds');
    const keButton = document.querySelector('#key-e');
    const kfButton = document.querySelector('#key-f');
    const kfsButton = document.querySelector('#key-fs');
    const kgButton = document.querySelector('#key-g');
    const kgsButton = document.querySelector('#key-gs');
    const kaButton = document.querySelector('#key-a');
    const kasButton = document.querySelector('#key-as');
    const kbButton = document.querySelector('#key-b');
    const kucButton = document.querySelector('#key-uc');

	const octaveUpButton = document.querySelector('#key-octave-up');
	const octaveDownButton = document.querySelector('#key-octave-down');
	const volumeUpButton = document.querySelector('#key-volume-up');
	const volumeDownButton = document.querySelector('#key-volume-down');

	var audio = new ApuMmlPlayer({AudioUnits: [{Name: 'unit0', Devices: [1,3,4]}]});
    audio.sampleTime = 10.0;
    audio.sampleBits = 32;
	var audioUnit = audio.audioUnits['unit0'];

	var audioRefreshSuspend = true;
	audioTempo.value = 120;
	audioVolume.value = 5;
	audioOctave.value = 4;
	audioLength.value = 4;
	currentVolume.value = 5;
	currentOctave.value = 4;
	currentLength.value = 4;
	audioRefreshSuspend = false;

	var replay = null;

    var controlButtons = {
        ArrowUp: upButton,
        ArrowDown: downButton,
        ArrowLeft: leftButton,
        ArrowRight: rightButton,
        Delete: delButton,
        Backspace: bsButton,
        Enter: enterButton,
    };

    var keyButtons = {
        s: kcsButton,
        d: kdsButton,
        g: kfsButton,
        h: kgsButton,
        j: kasButton,
        z: kcButton,
        x: kdButton,
        c: keButton,
        v: kfButton,
        b: kgButton,
        n: kaButton,
        m: kbButton,
        ',': kucButton,
		a: octaveDownButton,
		k: octaveUpButton,
		'/': volumeDownButton,
		'\\': volumeUpButton
    };

    var keyValues = {
        'key-c' : { code:'c' , value:0 },
        'key-cs': { code:'c#', value:1 },
        'key-d' : { code:'d' , value:2 },
        'key-ds': { code:'d#', value:3 },
        'key-e' : { code:'e' , value:4 },
        'key-f' : { code:'f' , value:5 },
        'key-fs': { code:'f#', value:6 },
        'key-g' : { code:'g' , value:7 },
        'key-gs': { code:'g#', value:8 },
        'key-a' : { code:'a' , value:9 },
        'key-as': { code:'a#', value:10},
        'key-b' : { code:'b' , value:11},
        'key-uc': { code:'>c', value:0 , octave: 1},
        'key-octave-up'   : { code:'>' , octave: 1},
        'key-octave-down' : { code:'<' , octave:-1},
        'key-volume-up'   : { code:')' , volume: 1},
        'key-volume-down' : { code:'(' , volume:-1},
    };

    var keyDownEvent = null;

    function setTrackEditorCaret() {
        trackEditorCaret.hidden = false;

        let rangeStart = trackEditor.selectionStart;
        let rangeEnd = trackEditor.selectionEnd;
        let count = rangeEnd - rangeStart;

        if (count < 0) {
            count = -count;
            rangeStart = rangeEnd;

        } else if (count === 0) {
            count = 1;
        }

        trackEditorCaret.style.left = (rangeStart * 0.5) + 'em';
        trackEditorCaret.style.width = (count * 0.5) + 'em';
    }

    function keyDownButton(event) {
        let elem = event.currentTarget;
        let kv = keyValues[elem.id];
        elem.classList.add('key-down');

        let value = trackEditor.value;
        let rangeStart = trackEditor.selectionStart;
        let leftStr = value.substr(0, rangeStart);
        let rightStr = value.substr(rangeStart);
        trackEditor.value = leftStr + kv.code + rightStr;
        trackEditor.selectionStart = rangeStart + kv.code.length;
        setTrackEditorCaret();

		if (kv.octave !== undefined) {
			if (kv.octave < 0) {
		        countDownIndex(currentOctave);
			} else {
		        countUpIndex(currentOctave);
			}
		}

		if (kv.volume !== undefined) {
			if (kv.volume < 0) {
		        countDownIndex(currentVolume);
			} else {
		        countUpIndex(currentVolume);
			}
		}
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
    });

    currentOctave.addEventListener('change', (event) => {
        console.log(event);
    });

    currentLength.addEventListener('change', (event) => {
        console.log(event);
    });

    upButton.addEventListener('click', () => {
        countUpIndex(currentVolume);
    });
    downButton.addEventListener('click', () => {
        countDownIndex(currentVolume);
    });

    leftButton.addEventListener('click', () => {
        if (keyDownEvent === null
            || (!keyDownEvent.shiftKey && !keyDownEvent.ctrlKey && !keyDownEvent.altKey)) {

            countDownIndex(currentOctave);
            return false;
        }

        let direction = trackEditor.selectionDirection;
        let rangeStart = trackEditor.selectionStart;
        let rangeEnd = trackEditor.selectionEnd;

        if (!keyDownEvent.shiftKey) {
            if (rangeStart > 0) {
                --rangeStart;
            }
            rangeEnd = rangeStart;
            direction = 'none';

        } else if (direction === 'backward') {
            if (rangeStart > 0) {
                --rangeStart;
            }

        } else if (rangeStart < rangeEnd) {
            --rangeEnd;

        } else if (rangeStart > 0) {
            --rangeStart;
            direction = 'backward';
        }
        trackEditor.setSelectionRange(rangeStart, rangeEnd, direction);

        setTrackEditorCaret();
        keyDownEvent = null;
    });

    rightButton.addEventListener('click', () => {
        if (keyDownEvent === null
            || (!keyDownEvent.shiftKey && !keyDownEvent.ctrlKey && !keyDownEvent.altKey)) {

            countUpIndex(currentOctave);
            return false;
        }

        let direction = trackEditor.selectionDirection;
        let rangeStart = trackEditor.selectionStart;
        let rangeEnd = trackEditor.selectionEnd;
        let curMax = trackEditor.value.length;

        if (keyDownEvent === null || !keyDownEvent.shiftKey) {
            if (rangeStart < curMax) {
                ++rangeStart;
            }
            rangeEnd = rangeStart;
            direction = 'none';

        } else if (direction === 'forward') {
            if (rangeEnd < curMax) {
                ++rangeEnd;
            }

        } else if (rangeStart < rangeEnd) {
            ++rangeStart;

        } else if (rangeEnd < curMax) {
            ++rangeEnd;
            direction = 'forward';
        }
        trackEditor.setSelectionRange(rangeStart, rangeEnd, direction);

        setTrackEditorCaret();
        keyDownEvent = null;
    });

    delButton.addEventListener('click', () => {
        trackEditor.setRangeText('', trackEditor.selectionStart, trackEditor.selectionEnd, 'start');
        setTrackEditorCaret();
    });

    bsButton.addEventListener('click', () => {
        let value = trackEditor.value;
        let rangeStart = trackEditor.selectionStart - 1;

        if (rangeStart >= 0) {
            let leftStr = value.substr(0, rangeStart);
            let rightStr = value.substr(trackEditor.selectionStart);
            trackEditor.value = leftStr + rightStr;
            trackEditor.setSelectionRange(rangeStart, rangeStart);
            setTrackEditorCaret();
        }
    });

    enterButton.addEventListener('click', () => {
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
			let mml = `TR0 t${tempo}\nTR${trackNo} v${volume}o${octave}l${length}` + trackEditor.value;
			console.log(mml);

			let container = MmlContainer.parse(mml);
	        audio.reset();
	        audio.volumeScale = parseFloat(audioVolume.value);
	        audio.loopCount = parseInt(masterLoop.value);
			replay = audio.play(audioCtx, container);
		}

        let source = audioCtx.createBufferSource();
		source.buffer = replay;
        source.connect(audioCtx.destination);
        source.onended = function() {
            console.log('Replay ended.');
        };

		console.log('Replay start.');
        source.start();
    });

    trackEditor.addEventListener('focus', () => {
        trackEditorCaret.hidden = true;
    });

    trackEditor.addEventListener('blur', setTrackEditorCaret);

    for (var id in keyValues) {
        let btn = document.querySelector('#' + id);
        btn.addEventListener('mousedown', keyDownButton);
        btn.addEventListener('mouseup', keyUpButton);
    }
}
