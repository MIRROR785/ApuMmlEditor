/**
 * ApuMmlPlayer.js
 *
 * @author @MIRROR_
 * @license MIT
 */

/**
 * 擬似APUによるMMLプレイヤークラス
 */
class ApuMmlPlayer
{
    /**
     * コンストラクタ
     * @param object config 設定情報
     */
    constructor(config = null) {
        /** @var int サンプリングレート */
        this.sampleRate = 44100;    // CD quality

        /** @var int 量子化ビット数 */
        this.sampleBits = 32;        // PCM : 8 or 16 bits, float PCM : 32 bits

        /** @var int チャンネル数 */
        this.channelCount = 2;        // 1:Monaural, 2:Stereo

        /** @var double ボリューム拡大率 */
        this.volumeScale = 1.0;

        /** @var double サンプリング時間(sec) */
        this.sampleTime = 1.0;        // seconds

        /** @var int ループカウンタ */
        this.loopCount = 0;

        /** @var bool ループ終了判定 */
        this.loopEnd = true;

        /** @var AudioUnit[] オーディオユニット配列 */
        this.audioUnits = null;

        /** @var AudioMixer オーディオミキサー */
        this.mixer = null;

        /** @var AudioPacker オーディオパッカー */
        this.packer = null;

        if (config !== null) {
            this.setup(config);
        }
    }

    /** @var int サンプリング時間 */
    static MaxSampleTime = 5 * 60;

    /**
     * 入力値の検証
     */
    validate() {
        if (this.sampleTime < 0) {
            this.sampleTime = 1.0;
        }

        if (this.sampleTime > ApuMmlPlayer.MaxSampleTime) {
            this.sampleTime = ApuMmlPlayer.MaxSampleTime;
        }

        if (this.audioUnits === null) {
            this.setup();
        }
    }

    /**
     * 初期設定
     * @param object config 設定情報
     *
     * {
     *   SampleRate: サンプリングレート, //（省略可）
     *   SampleBits: 量子化ビット数,     //（省略可）PCM : 8 or 16 bits, float PCM : 32 bits
     *   ChannelCount: チャンネル数,     //（省略可）1:Monaural, 2:Stereo
     *   VolumeScale: ボリューム拡大率,  //（省略可）
     *
     *   AudioUnits: [{
     *     Name: "オーディオユニット名", //（省略可）
     *     Devices: {
     *        デバイス番号  // 1:pulse1, 2:pulse2, 3:triangle, 4:noise
     *        : {             // デバイス詳細定義（省略可）
     *             Position: [音像定位, 音量増幅率],
     *             Panning: 音像定位,  // -1.5 <= panning <= 1.5
     *             Scale: 音量増幅率,  // -1.0 <= scale   <= 1.0
     *             Late : 開始遅延秒,  //  0.0 <= late
     *             Delay: 発音遅延秒   //  0.0 <= delay
     *        }
     *     }
     *   }, ... ]
     * }
     */
    setup(config = null) {
        // 引数確認
        if (config === null) {
            config = {AudioUnits: [{Devices:[1, 2, 3, 4]}]};
        }

        // パラメータ、オーディオユニット設定
        for (const key in config) {
            let value = config[key];

            switch (key) {
            case 'SampleRate':
                this.sampleRate = value;
                break;

            case 'SampleBits':
                this.sampleBits = value;
                break;

            case 'ChannelCount':
                this.channelCount = value;
                break;

            case 'VolumeScale':
                this.volumeScale = value;
                break;

            case 'AudioUnits':
                let count = 0;
                this.audioUnits = {};
                for (const index in value) {
                    let params = value[index];
                    let audioUnit = new AudioUnit(this.sampleRate, params);
                    if (audioUnit.name === null) {
                        audioUnit.name = 'unit' + count;
                    }
                    this.audioUnits[audioUnit.name] = audioUnit;
                    ++count;
                }
                break;
            }
        }

        // オーディオユニット及び出力設定の初期化
        this.reset();
    }

    /**
     * オーディオユニット及び出力設定の初期化
     */
    reset() {
        // オーディオユニットの初期化
        for (const name in this.audioUnits) {
            let audioUnit = this.audioUnits[name];
            audioUnit.apu.reset();
        }

        // 出力設定の初期化
        this.mixer = AudioMixer.create(this.channelCount);
        this.packer = AudioPacker.create(this.channelCount, this.sampleBits);
    }

    /**
     * 最大開始遅延時間を取得
     * @return 最大開始遅延時間
     */
    getMaxLate() {
        let result = 0;
        for (const name in this.audioUnits) {
            let audioUnit = this.audioUnits[name];
            let late = audioUnit.getMaxLate();
            if (result < late) {
                result = late;
            }
        }
        return result;
    }

    /**
     * デバイスのパラメータを設定
     * @param object args デバイスパラメータ情報
     *
     * { audio unit name: {
     *     device number: {
     *      Late: 開始遅延時間(sec),
     *      Voice: 音色番号,
     *      Volume: 音量,
     *      OffsetVolume: 音量オフセット,
     *      NoteNo: ノート番号 or Octave: オクターブ, KeyNo: キー番号,
     *      OffsetNote: ノートオフセット,
     *      OffsetFrequency: 周波数オフセット,
     *      Delay: 発音遅延時間(sec),
     *      Note:  発音(bool)
     *    }, ... ,
     * }, ... }
     */
    setDeviceParameter(args) {
        for (const name in args) {
            let devices = args[name];
            let apu = this.audioUnits[name].apu;

            for (const deviceNo in devices) {
                let values = devices[deviceNo];
                let device = apu.devices[deviceNo];

                for (const key in values) {
                    let value = values[key];

                    switch (key) {
                    case 'Late':
                        device.setLate(value);
                        break;

                    case 'Voice':
                        device.setVoice(value);
                        break;

                    case 'Volume':
                        device.setVolume(value);
                        break;

                    case 'OffsetVolume':
                        device.setOffsetVolume(value);
                        break;

                    case 'NoteNo':
                        device.noteOn(value);
                        break;

                    case 'KeyNo':
                        device.noteOn(AudioConst.getNoteNo(values['Octave'], value));
                        break;

                    case 'OffsetNote':
                        device.setOffsetNote(value);
                        break;

                    case 'OffsetFrequency':
                        device.setOffsetFrequency(value);
                        break;

                    case 'Delay':
                        device.setDelay(value);
                        break;

                    case 'Note':
                        if (value === true) {
                            device.noteOn();
                        } else {
                            device.noteOff();
                        }
                        break;
                    }
                }
            }
        }
    }

    /**
     * オーディオユニット毎の曲番を指定して演奏結果を出力
     * @param AudioContext audioCtx オーディオコンテキスト
     * @param MmlContainer container MMLデータコンテナ
     * @return AudioBuffer オーディオバッファ
     */
    play(audioCtx, container) {
        // プロパティ検証
        this.validate();

        // サンプリング初期化
        let loopCount = this.loopCount;
        let sequencer = new MmlSequencer(container);
        let sequenceCount = Math.floor(this.sampleRate / 60);
        let sequenceStop = false;
        let totalSamples = this.sampleRate * this.sampleTime;
        let lateCount = Math.floor(this.sampleRate * this.getMaxLate());
        let data = audioCtx.createBuffer(this.channelCount, totalSamples, this.sampleRate);
        this.packer.reset(data);

        // MML演奏結果サンプリング
        for (let i = 0, j = 0; i < totalSamples; ++i) {
            // シーケンサー制御
            if (sequenceStop) {
                if (lateCount > 0) {
                    --lateCount;
                } else {
                    break;
                }

            } else if (j-- <= 0) {
                // 終端検知
                if (this.loopEnd && sequencer.isEndOfData) {
                    if (loopCount <= 0) {
                        if (lateCount > 0) {
                            --lateCount;
                            sequenceStop = true;
                        } else {
                            break;
                        }
                    } else {
                        --loopCount;
                    }
                }

                if (!sequenceStop) {
                    sequencer.tick(this.audioUnits);
                }
                j = sequenceCount;
            }

            // サウンドサンプリング
            let rawData = [];
            for (const name in this.audioUnits) {
                // サンプリング
                let audioUnit = this.audioUnits[name];
                let sampling = audioUnit.apu.sampling();

                // ミキシング
                let mixing = this.mixer.mixing(audioUnit.trackNumbers, audioUnit.positions, sampling);
                rawData.push(mixing);
            }

            // パッキング
            this.packer.packing(this.volumeScale, rawData);
        }

        // 実データ部を取得
        if (this.packer.index < totalSamples) {
            let d = audioCtx.createBuffer(this.channelCount, this.packer.index, this.sampleRate);
            for (let channelNo = 0; channelNo < this.channelCount; ++channelNo) {
                d.copyToChannel(data.getChannelData(channelNo), channelNo, 0);
            }
            data = d;
        }

        return data;
    }

    /**
     * テストサウンドの出力
     * @param AudioContext audioCtx オーディオコンテキスト
     * @param object args デバイスパラメータ情報
     * @return AudioBuffer オーディオバッファ
     */
    testSound(audioCtx, args = null) {
        // プロパティ検証
        this.validate();

        // デバイス設定
        if (args !== null) {
            this.setDeviceParameter(args);
        }

        // サンプリング初期化
        let totalSamples = this.sampleRate * this.sampleTime;
        let data = audioCtx.createBuffer(this.channelCount, totalSamples, this.sampleRate);
        this.packer.reset(data);

        // テストサウンドサンプリング
        for (let i = 0; i < totalSamples; ++i) {
            let rawData = [];

            for (const name in this.audioUnits) {
                // サンプリング
                let audioUnit = this.audioUnits[name];
                let sampling = audioUnit.apu.sampling();

                // ミキシング
                let mixing = this.mixer.mixing(audioUnit.trackNumbers, audioUnit.positions, sampling);

                rawData.push(mixing);
            }

            // パッキング
            this.packer.packing(this.volumeScale, rawData);
        }

        return data;
    }

    /**
     * 1周期サウンドの出力
     * @param AudioContext audioCtx オーディオコンテキスト
     * @param object args デバイスパラメータ情報
     * @return AudioBuffer オーディオバッファ
     */
    oneCycleSound(audioCtx, args = null) {
        // プロパティ検証
        this.validate();

        // デバイス設定
        if (args !== null) {
            this.setDeviceParameter(args);
        }

        // 設定
        let lcmFrequency = 0;
        for (const name in this.audioUnits) {
            let audioUnit = this.audioUnits[name];
            let apu = audioUnit.apu;

            for (const deviceNo in apu.devices) {
                let device = apu.devices[deviceNo];

                if (!device.isNoteOff()) {
                    let freq = device.getCurrentFrequency();
                    lcmFrequency = getLcmFrequency(freq, lcmFrequency);
                }
            }
        }

        // サンプリング初期化
        let totalSamples = this.sampleRate / getGcdFrequency(lcmFrequency, this.sampleRate);
        let data = audioCtx.createBuffer(this.channelCount, totalSamples, this.sampleRate);
        this.packer.reset(data);

        // テストサウンドサンプリング
        for (let i = 0; i < totalSamples; ++i) {
            let rawData = [];

            for (const name in this.audioUnits) {
                // サンプリング
                let audioUnit = this.audioUnits[name];
                let sampling = audioUnit.apu.sampling();

                // ミキシング
                let mixing = this.mixer.mixing(audioUnit.trackNumbers, audioUnit.positions, sampling);

                rawData.push(mixing);
            }

            // パッキング
            this.packer.packing(this.volumeScale, rawData);
        }

        return data;
    }

    /**
     * 最大公約数となる周波数を算出
     * @param int v0 値0
     * @param int v1 値1
     * @param int 最大公約数
     */
    static getGcdFrequency(v0, v1) {
        if (v0 < v1) {
            let t = v0;
            v0 = v1;
            v1 = t;
        }

        if (v1 <= 0) {
            return v0;
        }

        // 最大公約数
        let a = v0;
        let b = v1;
        let r = a % b;
        for (; r != 0; a = b, b = r, r = a % b);

        return b;
    }

    /**
     * 最小公倍数となる周波数を算出
     * @param int v0 値0
     * @param int v1 値1
     * @param int 最小公倍数
     */
    static getLcmFrequency(v0, v1) {
        if (v0 < v1) {
            let t  = v0;
            v0 = v1;
            v1 = t;
        }

        if (v1 <= 0) {
            return v0;
        }

        // 最大公約数
        let a = v0;
        let b = v1;
        let r = a % b;
        for (; r != 0; a = b, b = r, r = a % b);

        // 最小公倍数
        return v0 * v1 / b;
    }
}
