//
// ApuKeyboard.js
//
window.onload = function(event) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;

    var source = null;
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

    const editor = document.querySelector('#editor');
    const playButton = document.querySelector('#play');
    const stopButton = document.querySelector('#stop');

    function playStart() {
        playStop();
        player.reset();

        console.log('play');
        let container = MmlContainer.parse(editor.value);
        let audioCtx = new AudioContext();
        audioCtx.sampleRate = 44100;
        source = audioCtx.createBufferSource();
        source.buffer = player.play(audioCtx, container);
        source.connect(audioCtx.destination);
        source.onended = function() {
            console.log('ended');
            source = null;
        };
        source.start();
    }

    function playStop() {
        if (source !== null) {
            console.log('stop');
            source.stop();
            source = null;
        }
    }

    playButton.onclick = playStart;
    stopButton.onclick = playStop;
}
