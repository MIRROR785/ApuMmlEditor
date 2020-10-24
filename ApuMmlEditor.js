/**
 * ApuKeyboard.js
 *
 * @author @MIRROR_
 * @license MIT
 */

class MmlAttribute
{
    constructor(name = null, title = null, composer = null, arranger = null, tracks = null) {
        this.name = name;
        this.title = title;
        this.composer = composer;
        this.arranger = arranger;
        this.tracks = tracks;
        this.createDate = null;
        this.updateDate = null;
    }
}

class PhraseItem
{
    constructor(name = null, value = null, device = null, voice = null, tempo = null, volume = null, octave = null, length = null) {
        this.name = name;
        this.value = value;
        this.device = device;
        this.voice = voice;
        this.tempo = tempo;
        this.volume = volume;
        this.octave = octave;
        this.length = length;
    }
}

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

    const progress = document.querySelector('#progress');
    const iconNoteOn = document.querySelector('#icon-note-on');

    const iconWastebasket = String.fromCodePoint(0x1f5d1);
    const iconFountainPen = String.fromCodePoint(0x1f58b);

    const dialogView = document.querySelector('#dialog-view');
    const dialogBox = document.querySelector('#dialog-box');
    const dialogContext = document.querySelector('#dialog-context');
    dialogView.hidden = true;

    function zeroPadding(v, n) {
        return v.toString().padStart(n, '0');
    }

    function limitString(v, n, flow = '..') {
        return (v === null) ? ''
            : (v.length <= n) ? v
                : v.substring(0, n) + flow;
    }

    Date.prototype.toDateStamp = function() {
        return this.getFullYear()
            + zeroPadding((this.getMonth() + 1), 2)
                + zeroPadding(this.getDate(), 2);
    }

    Date.prototype.toTimeStamp = function() {
        return this.getFullYear()
            + zeroPadding((this.getMonth() + 1), 2)
            + zeroPadding(this.getDate(), 2)
            + zeroPadding(this.getHours(), 2)
            + zeroPadding(this.getMinutes(), 2)
            + zeroPadding(this.getSeconds(), 2);
    }

    function removeChilds(node) {
        while (node.firstChild) { node.removeChild(node.firstChild); }
    }

    dialogContext.removeAll = function () {
        removeChilds(this);
    };

    function wakeUpAudioContext(audioCtx) {
        // check if context is in suspended state (autoplay policy)
        if (audioCtx.state === 'suspended') {
            const userGestureEvent = (event) => {
                dialogView.hidden = true;
                dialogBox.removeEventListener('click', userGestureEvent);
                dialogBox.classList.remove('message-autoplay-policy');
                iconNoteOn.classList.remove('dialog-show-icon');
                dialogContext.removeAll();
                audioCtx.resume();
            };
            iconNoteOn.classList.add('dialog-show-icon');
            dialogContext.innerText = '自動再生ポリシーによってユーザ操作を必要としています。\nThe autoplay policy requires user interaction.\nこのメッセージをタッチすると音が再生されます。\nTouch this message for sound playback.';
            dialogBox.classList.add('message-autoplay-policy');
            dialogBox.addEventListener('click', userGestureEvent);
            dialogView.hidden = false;
        }
    }

    function setSelectValue(elem, value) {
        const options = elem.options;
        let index = -1;
        for (let i = 0; i < options.length; ++i) {
            const v = options[i].value;
            if (v == value) {
                index = i;
                break;
            }
        }
        elem.selectedIndex = index;
    }

    function countUpIndex(elem) {
        const indexMax = elem.length - 1;
        const index = (elem.selectedIndex < indexMax) ? elem.selectedIndex + 1 : indexMax;
        elem.selectedIndex = index;
    }

    function countDownIndex(elem) {
        const indexMin = 1;
        const index = (elem.selectedIndex > indexMin) ? elem.selectedIndex - 1 : indexMin;
        elem.selectedIndex = index;
    }

    function emptyAction(event) {
        return false;
    }

    function promiseAction(delay = 0) {
        return new Promise((resolve) => {setTimeout(resolve, delay);});
    }

    const regexAttrTitle = /#Title[ \t]+(.*)[ \t]*[\r\n]/i;
    const regexAttrComposer = /#Composer[ \t]+(.*)[ \t]*[\r\n]/i;
    const regexAttrArranger = /#Arranger[ \t]+(.*)[ \t]*[\r\n]/i;

    function findAttribute(value, regex) {
        const mt = value.match(regex);
        return (mt !== null && mt.length >= 2) ? mt[1] : null;
    }

    function getMmlAttribute(mml) {
        const attr = new MmlAttribute();
        if (mml !== null && mml.length > 0) {
            attr.title = findAttribute(mml, regexAttrTitle);
            attr.composer = findAttribute(mml, regexAttrComposer);
            attr.arranger = findAttribute(mml, regexAttrArranger);
        }
        return attr;
    }

    function getRemarks(attr) {
        const remarks = [];
        if (attr.composer !== attr && attr.composer.length > 0) remarks.push('Composer:' + attr.composer);
        if (attr.arranger !== attr && attr.arranger.length > 0) remarks.push('Arranger:' + attr.arranger);
        if (attr.updateDate !== attr) remarks.push('Update:' + attr.updateDate.toLocaleString());
        return remarks;
    }

    function showOpenDialog(title, list, actionAccept, actionRemove) {
        if (list.length > 0) {
            const context = document.createElement('article');
            const titleBar = document.createElement('h3');
            titleBar.appendChild(document.createTextNode(title));
            context.appendChild(titleBar);

            const closeButton = document.createElement('button');
            closeButton.appendChild(document.createTextNode('Close'));
            const closeEvent = (event) => {
                dialogView.hidden = true;
                dialogBox.classList.remove('dialog-open');
                dialogContext.removeAll();
            };
            closeButton.addEventListener('click', closeEvent);

            const listView = document.createElement('div');
            listView.classList.add('dialog-open-view');
            const listTable = document.createElement('dl');
            listView.appendChild(listTable);

            for (const item of list) {
                const row = document.createElement('div');

                const columnName = document.createElement('dt');
                columnName.appendChild(document.createTextNode(item.name));
                row.appendChild(columnName);

                const columnValue = document.createElement('dd');
                const columnRemarks = document.createElement('ul');
                for (const v of item.remarks) {
                    const c = document.createElement('li');
                    c.appendChild(document.createTextNode(v));
                    columnRemarks.appendChild(c);
                }
                columnValue.appendChild(columnRemarks);

                const icons = document.createElement('div');
                icons.classList.add('dialog-icon-container');

                const iconEdit = document.createElement('div');
                iconEdit.classList.add('dialog-emoji-icon');
                iconEdit.appendChild(document.createTextNode(iconFountainPen));
                iconEdit.addEventListener('click', (event) => {
                    actionAccept(item.id);
                    closeButton.click();
                });
                icons.appendChild(iconEdit);

                const iconRemove = document.createElement('div');
                iconRemove.classList.add('dialog-emoji-icon');
                iconRemove.appendChild(document.createTextNode(iconWastebasket));
                iconRemove.addEventListener('click', (event) => {
                    actionRemove(item.id)
                    listTable.removeChild(row);
                });
                icons.appendChild(iconRemove);

                columnValue.appendChild(icons);
                row.appendChild(columnValue);
                listTable.appendChild(row);
            }
            context.appendChild(listView);
            context.appendChild(closeButton);

            dialogContext.appendChild(context);
            dialogBox.classList.add('dialog-open');
            dialogView.hidden = false;
        }
    }

    function showSaveDialog(title, fileName, attribute, actionAccept, actionValidate = null) {
        const context = document.createElement('article');
        const titleBar = document.createElement('h3');
        titleBar.appendChild(document.createTextNode(title));
        context.appendChild(titleBar);

        const form = document.createElement('div');
        const textBox = document.createElement('input');
        textBox.type = 'text';
        textBox.value = fileName;
        form.appendChild(textBox);
        const note = document.createElement('div');
        note.classList.add('dialog-save-note');
        form.appendChild(note);
        context.appendChild(form);

        const attr = document.createElement('dl');
        const addItem = (t, v) => {
            if (v !== null && v.length > 0) {
                const dt = document.createElement('dt');
                dt.appendChild(document.createTextNode(t));
                attr.appendChild(dt);

                const dd = document.createElement('dd');
                dd.appendChild(document.createTextNode(v));
                attr.appendChild(dd);
            }
        }
        addItem('Title', attribute.title);
        addItem('Composer', attribute.composer);
        addItem('Arranger', attribute.arranger);
        context.appendChild(attr);

        const closeEvent = (event) => {
            dialogView.hidden = true;
            dialogBox.classList.remove('dialog-save');
            dialogContext.removeAll();
        };

        const okButton = document.createElement('button');
        okButton.appendChild(document.createTextNode(title));
        const okEvent = (event) => {
            const v = textBox.value;
            if (actionValidate === null || actionValidate(v, note)) {
                closeEvent(event);
                actionAccept(v);
            }
        };
        okButton.addEventListener('click', okEvent);

        const cancelButton = document.createElement('button');
        cancelButton.appendChild(document.createTextNode('Cancel'));
        cancelButton.addEventListener('click', closeEvent);

        context.appendChild(okButton);
        context.appendChild(cancelButton);

        dialogContext.appendChild(context);
        dialogBox.classList.add('dialog-save');
        if (actionValidate !== null) {
            const v = textBox.value;
            actionValidate(v, note);
        }
        dialogView.hidden = false;
    }

    function getLocalStorage(key, defaultValue = []) {
        const value = localStorage.getItem(key);
        return (value !== null) ? JSON.parse(value) : defaultValue;
    }

    function readMusics() {
        const musics = [];
        const list = getLocalStorage('musics');

        if (list === null || list.length <= 0) {
            const samples =
[{mml:
'#Title ICE BALLER - Penguin\n' +
'#Composer Alma\n' +
'#Arranger @MIRROR_\n' +
'TR0 t120\n' +
'TR1 l8 Lo7rgggggab>c<afarab>cd<gr>frfede<g>cerrrrr<gggggab>c<a>cfrfffggggggggfffeerrr\n' +
'TR2 l8 Lo5cc<g>ccc<g>cffcfffcfgbb>ddd<bgcc<g>ccc<g>ccc<g>ccc<g>cffffg+g+g+g+ggb>d<ggb>d<ccefffed\n' +
'TR3 l8 Lo6reeeeefgafcfrfgabdr>drdc<b>c<da>crrrrr<eeeeefgafa>crcccdededef<b>c<gb>ccc<ba'
, tracks: ['2','2']
, createDate: new Date(2014,10,30, 22,28,05) // 2014-11-30 22:28:05
, updateDate: new Date(2020,09,24, 10,53,01) // 2020-10-24 10:53:01
}
,{mml:
'#Title ICE BALLER - Opening\n' +
'#Composer Sakura\n' +
'#Arranger @MIRROR_\n' +
'TR0 t120\n' +
'TR1 l8 L o7d2.dddrr4r2r<f+gabagf+ra>dc+4<barba+b>c+<agedef+gba4.rr>dr4rdr4rc+r4rc+r4r<br4bgf+dc+c+dedrr4r1r1r1r2r4rf+ba+ba+b>c+de<gf+gab>cc+<a\n' +
'TR2 l8 L o6r1e4re4gf+ef+2&f+agf+f+2rf+dgb2&b4f+4f+4aggf+f+erf+garf+ga>dc+c+4&c+<bf+gb2a2g4ggf+2r1r2r4f+4gb>cedc+4<bf+f+edc+4e4f+4a4b4>de<e4g4b>cc+<a\n' +
'TR3 l8 L o5dr<ar>drd<a>dr<ar>drd<a>dr<ar>drd<a>dr<ar>drdc+<brbrf+gf+dc+eaggf+f+edrardradc+rf+rc+rf+c+<br>f+r<b>gf+dc+edc+dra+4ba+b4.a+>c+4def+4.f+d4gg4ggg4gf+gagf+edc+<brgregf+ef+4e4d4c+4'
, tracks: ['2','2']
, createDate: new Date(2014,10,30, 22,28,05) // 2014-11-30 22:28:05
, updateDate: new Date(2020,09,24, 10,47,33) // 2020-10-24 10:47:33
}
,{mml:
'#Title ICE BALLER - Clear!\n' +
'#Composer Momo\n' +
'#Arranger @MIRROR_\n' +
'TR0 t180\n' +
'TR1 l1 o4g4.g8>c4.c8d8g8g2^8c8d8f8e8d8c4.<b8>c\n' +
'TR2 l1 o3rg4.g8>c4.c8d8a8g8f8e4.d8e'
, tracks: ['0','1']
, createDate: new Date(2014,10,30, 22,28,05) // 2014-11-30 22:28:05
, updateDate: new Date(2020,09,23, 22,22,51) // 2020-10-23 22:22:51
}];

            for (const sample of samples) {
                const attr = getMmlAttribute(sample.mml);
                attr.name = attr.title;
                attr.tracks = sample.tracks;
                attr.createDate = sample.createDate;
                attr.updateDate = sample.updateDate;
                musics.push(attr);
                writeMusicData(attr.name, sample.mml);
            }
            writeMusics(musics);

        } else {
            for (const item of list) {
                const attr = new MmlAttribute(
                    item.name,
                    item.title,
                    item.composer,
                    item.arranger,
                    item.tracks);
                if (item.createDate !== null) attr.createDate = new Date(item.createDate);
                if (item.updateDate !== null) attr.updateDate = new Date(item.updateDate);
                musics.push(attr);
            }
        }
        return musics;
    }

    function writeMusics(musics) {
        localStorage.setItem('musics', JSON.stringify(musics));
    }

    function findMuiscIndex(musics, name) {
        return musics.findIndex((it) => it.name == name);
    }

    function readMusicData(name) {
        return localStorage.getItem('musics/' + encodeURI(name));
    }

    function writeMusicData(name, value) {
        localStorage.setItem('musics/' + encodeURI(name), value);
    }

    function removeMusicData(name) {
        localStorage.removeItem('musics/' + encodeURI(name));
    }

    var phrases = getLocalStorage('phrases');
    var stackPhraseIndex = -1;

    function checkPhrases() {
        const isEmpty = (phrases.length <= 0);
        menuPopUp.disabled = isEmpty;
        menuList.disabled = isEmpty;
    }

    function stackPhrase(item) {
        phrases.unshift(item);
        stackPhraseIndex = 0;
        localStorage.setItem('phrases', JSON.stringify(phrases));
        checkPhrases();
    }

    function popupPhrase() {
        return (stackPhraseIndex >= 0 && stackPhraseIndex < phrases.length) ? phrases[stackPhraseIndex++] : null;
    }

    function showPhraseListDialog(actionAccept) {
        if (phrases.length > 0) {
            const context = document.createElement('article');
            const titleBar = document.createElement('h3');
            titleBar.appendChild(document.createTextNode('Select phrase'));
            context.appendChild(titleBar);

            const closeButton = document.createElement('button');
            closeButton.appendChild(document.createTextNode('Close'));
            const closeEvent = (event) => {
                dialogView.hidden = true;
                dialogBox.classList.remove('dialog-list-phrase');
                dialogContext.removeAll();
            };
            closeButton.addEventListener('click', closeEvent);

            const listView = document.createElement('div');
            listView.classList.add('dialog-list-phrase-view');
            const listTable = document.createElement('table');
            listView.appendChild(listTable);

            let count = phrases.length;
            for (const item of phrases) {
                const row = document.createElement('tr');

                const columnName = document.createElement('td');
                let n = limitString((item.name !== null) ? item.name : '#' + zeroPadding(count, 4), 5);
                columnName.appendChild(document.createTextNode(n));
                columnName.addEventListener('dblclick', (event) => {
                    const textBox = document.createElement('input');
                    textBox.type = 'text';
                    if (item.name !== null) {
                        textBox.value = item.name;
                    }
                    textBox.addEventListener('keydown', (event) => {
                        if (event.key == 'Enter') {
                            event.currentTarget.blur();
                        }
                    });
                    textBox.addEventListener('blur', (event) => {
                        const v = textBox.value;
                        if (v !== null && v != '') {
                            item.name = v;
                            n = limitString(v, 5);
                        }
                        removeChilds(columnName);
                        columnName.appendChild(document.createTextNode(n));
                        localStorage.setItem('phrases', JSON.stringify(phrases));
                    });
                    removeChilds(columnName);
                    columnName.appendChild(textBox);
                    textBox.focus();
                });
                row.appendChild(columnName);

                const columnValue = document.createElement('td');
                columnValue.appendChild(document.createTextNode(limitString(item.value, 23)));
                columnValue.addEventListener('click', (event) => {
                    closeButton.click();
                    actionAccept(item);
                    stackPhraseIndex = 0;
                });
                row.appendChild(columnValue);

                const columnRemove = document.createElement('td');
                columnRemove.classList.add('dialog-emoji-icon');
                columnRemove.appendChild(document.createTextNode(iconWastebasket));
                columnRemove.addEventListener('click', (event) => {
                    const index = phrases.indexOf(item);
                    if (index >= 0) {
                        phrases.splice(index, 1);
                        stackPhraseIndex = 0;
                        listTable.removeChild(row);
                        localStorage.setItem('phrases', JSON.stringify(phrases));
                    }
                });
                row.appendChild(columnRemove);

                listTable.appendChild(row);
                --count;
            }
            context.appendChild(listView);
            context.appendChild(closeButton);

            dialogContext.appendChild(context);
            dialogBox.classList.add('dialog-list-phrase');
            dialogView.hidden = false;
        }
    }

    // MML editor
    const menuOpen = document.querySelector('#menu-open');
    const menuSave = document.querySelector('#menu-save');
    const menuPhrase = document.querySelector('#menu-phrase');
    const menuImport = document.querySelector('#menu-import');
    const menuExport = document.querySelector('#menu-export');
    const mmlEditor = document.querySelector('#mml-editor');
    const playStartButton = document.querySelector('#play-start');
    const mmlClearButton = document.querySelector('#mml-clear');
    const masterVolume = document.querySelector('#master-volume');
    const masterLoop = document.querySelector('#master-loop');
    const track1Voice = document.querySelector('#track1-voice');
    const track2Voice = document.querySelector('#track2-voice');

    menuOpen.addEventListener('click', (event) => {
        const musics = readMusics();
        const list = [];
        for (const attr of musics) {
            const remarks = getRemarks(attr);
            list.push({id:attr.name, name:attr.title, remarks:remarks});
        }
        showOpenDialog(
            'Open',
            list,
            (id) => {
                mmlEditor.value = readMusicData(id);
                const index = findMuiscIndex(musics, id);
                const music = musics[index];
                track1Voice.value = music.tracks[0];
                track2Voice.value = music.tracks[1];
            },
            (id) => {
                removeMusicData(id);
                const index = findMuiscIndex(musics, id);
                musics.splice(index, 1);
                writeMusics(musics);
            });
    });
    menuSave.addEventListener('click', (event) => {
        const mml = mmlEditor.value;
        if (mml !== null && mml.length > 0) {
            const musics = readMusics();
            const attr = getMmlAttribute(mml);
            const name = (attr.title !== null) ? attr.title : 'music-' + new Date().toDateStamp();
            attr.tracks = [track1Voice.value, track2Voice.value];

            const checkBox= document.createElement('input');
            checkBox.type = 'checkbox';
            const messageBox = document.createElement('div');
            messageBox.classList.add('warn');

            showSaveDialog(
                'Save',
                name,
                attr,
                (name) => {
                    const index = findMuiscIndex(musics, name);
                    attr.name = name;
                    attr.updateDate = new Date();
                    if (index >= 0) {
                        attr.createDate = musics[index].createDate;
                        musics[index] = attr;
                    } else {
                        attr.createDate = attr.updateDate;
                        musics.push(attr);
                    }
                    writeMusicData(name, mml);
                    writeMusics(musics);
                },
                (name, note) => {
                    if (!note.hasChildNodes()) {
                        const lb = document.createElement('label');
                        lb.appendChild(checkBox);
                        lb.appendChild(document.createTextNode('Over write'));
                        note.appendChild(lb);
                        note.appendChild(messageBox);
                    }

                    removeChilds(messageBox);
                    if (!checkBox.checked && findMuiscIndex(musics, name) >= 0) {
                        messageBox.appendChild(document.createTextNode('*Duplicated names.'));
                        return false;
                    } else {
                        return true;
                    }
                });
        }
    });
    menuPhrase.addEventListener('click', (event) => {
        event.currentTarget.blur();
        showPhraseListDialog((item) => {
            mmlEditor.setRangeText(item.value);
            mmlEditor.selectionEnd = mmlEditor.selectionStart + item.value.length;
            mmlEditor.focus();
        });
    });
    menuImport.addEventListener('click', (event) => {
        const importFile = document.createElement('input');
        importFile.type = 'file';
        importFile.style = 'display:none';
        importFile.accept= '.mml,.txt';
        importFile.addEventListener('input', (event) => {
            const files = event.target.files;
            if (files !== null && files.length > 0) {
                const file = files[0];
                file.text().then((mml) => {
                    mmlEditor.value = mml;
                });
            }
        });
        importFile.click();
    });
    menuExport.addEventListener('click', (event) => {
        const mml = mmlEditor.value;
        if (mml !== null && mml.length > 0) {
            const attr = getMmlAttribute(mml);
            const name = ((attr.title !== null) ? attr.title.replace(/[ \t]/g, '') : 'music') + '-' + new Date().toDateStamp() + '.mml';
            showSaveDialog('Export', name, attr, (name) => {
                const exportLink = document.createElement('a');
                const objectURL = URL.createObjectURL(new Blob([mml], {type : 'text/plain'}));
                exportLink.download = encodeURI(name);
                exportLink.href = objectURL;
                exportLink.click();
                URL.revokeObjectURL(objectURL);
            });
        }
    });

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
        //progress.hidden = false;
        playStartButton.classList.add('play');

        promiseAction().then(() => {
            const audioCtx = new AudioContext();
            audioCtx.sampleRate = 44100;

            player.reset();
            player.volumeScale = parseFloat(masterVolume.value);
            player.loopCount = parseInt(masterLoop.value);
            playerDev1.setVoice(parseInt(track1Voice.value));
            playerDev2.setVoice(parseInt(track2Voice.value));

            console.log('Parse MML text.');
            const container = MmlContainer.parse(mmlEditor.value);
            playerSource = audioCtx.createBufferSource();
            playerSource.buffer = player.play(audioCtx, container);
            playerSource.connect(audioCtx.destination);
            playerSource.onended = (event) => {
                console.log('Play ended.');
                playerSource = null;
                playStartButton.classList.remove('play');
            };

            console.log('Play start.');
            //progress.hidden = true;
            playerSource.start();
            wakeUpAudioContext(audioCtx);
        });
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

    playStartButton.onpointerdown = (event) => {
        if (playerSource !== null) {
            playStop();
        } else {
            playStart();
        }
    };
    playStartButton.onclick = emptyAction;
    playStartButton.oncontextmenu = emptyAction;
    mmlClearButton.addEventListener('click', mmlClear);


    // Mini keyboard and Track editor
    const menuStack = document.querySelector('#menu-stack');
    const menuPopUp = document.querySelector('#menu-popup');
    const menuList = document.querySelector('#menu-list');

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

    function getPhrase() {
        const name = null;
        const value = trackContentTop.innerText + trackContentSelection.innerText + trackContentBottom.innerText;
        const item = new PhraseItem(
            name,
            value,
            audioDevice.value,
            audioVoice.value,
            audioTempo.value,
            audioVolume.value,
            audioOctave.value,
            audioLength.value);
        return item;
    }

    function setPhrase(item) {
        trackContentTop.innerText = item.value;
        trackContentSelection.innerText = '';
        trackContentBottom.innerText = '';
        audioDevice.value = item.device;
        audioVoice.value = item.voice;
        audioTempo.value = item.tempo;
        audioVolume.value = item.volume;
        audioOctave.value = item.octave;
        audioLength.value = item.length;
    }

    menuStack.addEventListener('click', (event) => {
        const item = getPhrase();
        stackPhrase(item);
    });
    menuPopUp.addEventListener('click', (event) => {
        const item = popupPhrase();
        if (item !== null) {
            setPhrase(item);
        }
    });
    menuList.addEventListener('click', (event) => {
        event.currentTarget.blur();
        showPhraseListDialog((item) => {
            setPhrase(item);
        });
    });
    checkPhrases();

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

        const trackNo = index + 2;
        const voice = parseInt(audioVoice.value);
        const trackParams = {};
        trackParams[trackNo] = {'Voice': voice, 'Volume': volume, 'NoteNo': noteNo};

        audio.volumeScale = parseFloat(masterVolume.value);

        const audioCtx = new AudioContext();
        audioCtx.sampleRate = 44100;

        const data = audio.oneCycleSound(audioCtx, {'unit0' : trackParams});
        const noteSource = audioCtx.createBufferSource();
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
        const ct = trackContentCaret.offsetTop - trackContentCaretTop;
        if (ct < trackTinyEditor.scrollTop || ct > trackTinyEditor.scrollTop + trackTinyEditor.offsetHeight - trackContentCaret.offsetHeight) {
            trackTinyEditor.scrollTop = ct;
        }
    }

    function downScrollTinyEditor() {
        const ct = trackContentCaret.offsetTop - trackContentCaretTop;
        const dt = ct - trackTinyEditor.scrollTop;
        if (dt < 0 || dt > trackTinyEditor.offsetHeight - trackContentCaret.offsetHeight) {
            const at = Math.abs(dt);
            if (at <= trackTinyEditor.offsetHeight) {
                trackTinyEditor.scrollTop = trackContentCaret.offsetHeight * dt / at;
            } else {
                trackTinyEditor.scrollTop = ct;
            }
        }
    }

    function openTextEditor() {
        trackTextEditor.hidden = false;

        const contentTop = trackContentTop.innerText;
        const contentSelection = trackContentSelection.innerText;
        const contentBottom = trackContentBottom.innerText;
        const selectionStart = contentTop.length;
        const selectionEnd = selectionStart + contentSelection.length;

        trackTextEditor.value = contentTop + contentSelection + contentBottom;
        trackTextEditor.setSelectionRange(selectionStart, selectionEnd, trackSelectionDirection);

        trackTinyEditor.hidden = true;
        trackTextEditor.focus();
    }

    function closeTextEditor() {
        trackTinyEditor.hidden = false;

        const content = trackTextEditor.value;
        const contentTop = content.substring(0, trackTextEditor.selectionStart);
        const contentSelection = content.substring(trackTextEditor.selectionStart, trackTextEditor.selectionEnd);
        const contentBottom = content.substring(trackTextEditor.selectionEnd);

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
            const last = contentSelection.length - 1;
            const ch = contentSelection.substring(last);
            contentSelection = contentSelection.substring(0, last);
            contentBottom = ch + contentBottom;

        } else {
            trackSelectionDirection = DirectionNone;

            const previous = contentTop.length - 1;
            if (previous >= 0) {
                const ch = contentTop.substring(previous);
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
            const ch = contentSelection.substring(0, 1);
            contentSelection = contentSelection.substring(1);
            contentTop = contentTop + ch;

        } else {
            trackSelectionDirection = DirectionNone;

            if (contentBottom.length > 0) {
                const ch = contentBottom.substring(0, 1);
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
        const contentSelection = trackContentSelection.innerText;

        if (contentSelection.length > 0) {
            trackContentSelection.innerText = '';
            replay = null;
        } else {
            const contentBottom = trackContentBottom.innerText;
            if (contentBottom.length > 0) {
                trackContentBottom.innerText = contentBottom.substring(1);
                replay = null;
            }
        }

        keyDownEvent = null;
    }

    function backspaceSelectionValue() {
        const contentTop = trackContentTop.innerText;
        const previous = contentTop.length - 1;

        if (previous >= 0) {
            trackContentTop.innerText = contentTop.substring(0, previous);
            replay = null;
        }

        keyDownEvent = null;
    }

    var replay = null;
    var replaySource = null;
    function replayStart() {
        replayButton.classList.add('play');

        promiseAction().then(() => {
            const audioCtx = new AudioContext();
            audioCtx.sampleRate = 44100;

            if (replay === null) {
                audio.reset();

                let index = parseInt(audioDevice.value);
                if (index < 0) {
                    index = 0;
                }
                const trackNo = index + 2;
                const dev = audioUnit.apu.devices[trackNo];
                const voice = parseInt(audioVoice.value);
                dev.setVoice(voice);

                const tempo = parseInt(audioTempo.value);
                const volume = parseInt(audioVolume.value);
                const octave = parseInt(audioOctave.value);
                const length = parseInt(audioLength.value);
                const value = trackContentTop.innerText + trackContentSelection.innerText + trackContentBottom.innerText;
                const mml = `TR0 t${tempo}\nTR${trackNo} v${volume}o${octave}l${length}` + value;
                console.log(mml);

                const container = MmlContainer.parse(mml);
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
            replaySource.start();
            wakeUpAudioContext(audioCtx);
        });
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
        F1: menuStack,
        F2: menuPopUp,
        F3: menuList,
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
        const elem = event.currentTarget;
        const kv = keyValues[elem.id];

        if (kv === undefined) {
            return;
        }

        elem.classList.add('key-down');

        let octave = parseInt(currentOctave.value);
        let volume = parseInt(currentVolume.value);
        let code = kv.code;

        if (kv.value !== undefined) {
            if (kv.octave !== undefined) {
                const nextOctave = octave + kv.octave;
                const diffOctave = nextOctave - previousValue.octave;

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
                    const noteNo = AudioConst.getNoteNo(octave - 1, kv.value);
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
        const elem = document.querySelector('.key-down');
        if (elem !== null) {
            elem.classList.remove('key-down');
        }
        noteOffDevice();
        keyDownEvent = null;
    }

    document.body.addEventListener('keydown', (event) => {
        if (sectionMiniKeyboard.hidden || !dialogView.hidden) {
            return;
        }

        if (keyDownEvent === null || event.key !== keyDownEvent.key) {
            keyDownEvent = event;

            const elem = document.activeElement;
            const tagName = elem.tagName;
            if (tagName === 'BODY' || tagName === 'BUTTON') {
                let btn = keyButtons[keyDownEvent.key];
                if (btn !== undefined) {
                    event.keyCode = null;
                    event.returnValue = false;
                    event.preventDefault();
                    btn.focus();
                    btn.onpointerdown({currentTarget:btn});

                } else {
                    btn = clickButtons[keyDownEvent.key];
                    if (btn !== undefined) {
                        event.keyCode = null;
                        event.returnValue = false;
                        event.preventDefault();
                        btn.focus();
                        btn.click();
                    }
                }
            }
        }
    });
    document.body.addEventListener('keyup', keyUpButton);

    audioDevice.addEventListener('change', (event) => {
        const index = parseInt(audioDevice.value);
        if (index >= 0) {
            const deviceNo = audioUnit.trackNumbers[index];
            const dev = audioUnit.apu.devices[deviceNo];
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

    for (const id in keyValues) {
        const btn = document.querySelector('#' + id);
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

    replayButton.onpointerdown = (event) => {
        if (replaySource !== null) {
            replayStop();
        } else {
            replayStart();
        }
    }
    replayButton.onpointerup = keyUpButton;
    replayButton.onclick = emptyAction;
    replayButton.oncontextmenu = emptyAction;

    const controls = document.querySelectorAll('button.key-ctrl');
    for (const btn of controls) {
        btn.oncontextmenu = emptyAction;
    }

    clearTrack();

    progress.hidden = true;
}
