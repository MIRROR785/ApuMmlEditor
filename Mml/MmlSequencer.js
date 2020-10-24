/**
 * MmlSequencer.js
 *
 * @author @MIRROR_
 * @license MIT
 */

/**
 * MMLトラック状態を格納するクラス
 */
class MmlTrackStatus
{
    /**
     * コンストラクタ
     */
    constructor() {
        this.index = 0;
        this.count = 0;
        this.tempo = 0;
        this.voice = 0;
        this.volume = 15;
        this.octave = 3;
        this.length = 8;
        this.loop = 0xff;
        this.key_no = MmlConst.KNO_R;
        this.key_octave = 0;
        this.key_length = 0;
        this.is_loop = false;
        this.lateCount = 0;
    }
}

/**
 * MMLの演奏を管理するクラス
 */
class MmlSequencer
{
    /** var int[] キー番号配列 */
    static key_no = {
        a: MmlConst.KNO_A,
        b: MmlConst.KNO_B,
        c: MmlConst.KNO_C,
        d: MmlConst.KNO_D,
        e: MmlConst.KNO_E,
        f: MmlConst.KNO_F,
        g: MmlConst.KNO_G,
    };

    /**
     * コンストラクタ
     * @param MmlContainer container MMLコンテナ
     */
    constructor(container) {
        this.isEndOfData = false;
        this.container = container;
        this.trackStatus = {};
        for (const index in this.container.trackNumbers) {
            let tr = this.container.trackNumbers[index];
            this.trackStatus[tr] = new MmlTrackStatus();
        }

        let controlTrack = container.tracks[0];
        if (controlTrack !== undefined) {
            this.readControlTrack(controlTrack);
        }
    }

    /**
     * １フレーム単位の処理
     * @param AudioUnit[] audioUnits オーディオユニット配列
     * @return bool 終端判定結果（全トラックループ検知）
     */
    tick(audioUnits) {
        if (this.isEndOfData) {
            for (const index in this.container.trackNumbers) {
                let tr = this.container.trackNumbers[index];
                if (tr > 0) {
                    this.trackStatus[tr].is_loop = false;
                }
            }
        }

        let result = true;
        for (const index in this.container.trackNumbers) {
            let tr = this.container.trackNumbers[index];
            if (tr > 0) {
                result &= this.readTrack(tr, audioUnits);
            }
        }
        this.isEndOfData = result;
    }

    /**
     * MML制御トラックの読み込み
     * @param char[] controlTrack MMLトラック情報
     */
    readControlTrack(controlTrack) {
        let i = 0;
        let k = controlTrack[i];

        for (;;) {
            if (k === 't') {
                let p = 0;
                for (;;) {
                    ++i;
                    let n = controlTrack[i];
                    if (n < '0' || '9' < n) {
                        k = n;
                        break;
                    }

                    n -= '0';
                    p *= 10;
                    p += n;
                }

                let l = p / 15 * 2;
                let m = 60 - l;

                for (const index in this.container.trackNumbers) {
                    let tr = this.container.trackNumbers[index];
                    let track = this.container.tracks[tr];
                    let n = track[0];
                    if (n !== "\n") {
                        let status = this.trackStatus[tr];
                        status.tempo = l;
                        status.count = m;
                    }
                }

            } else if (k === "\n") {
                return;

            } else {
                ++i;
                k = controlTrack[i];
            }
        }
    }

    /**
     * MMLトラック情報の読み込み
     * @param int tr トラック番号
     * @param AudioUnit[] audioUnits オーディオユニット情報配列
     * @return bool 繰り返し発生判定結果
     */
    readTrack(tr, audioUnits) {
        let status = this.trackStatus[tr];
        let track = this.container.tracks[tr];

        let n = status.tempo;
        if (n === 0) {
            status.key_no = MmlConst.KNO_R;
            status.is_loop = true;

        } else {
            let l = status.count;
            l += n;

            if (l < 60) {
                status.count = l;

            } else {
                status.count = l - 60;

                l = status.key_length;

                if (l > 0) {
                    --l;
                    status.key_length = l;

                } else {
                    let m = status.volume;
                    let o = status.octave;
                    let l = status.length;
                    let i = status.index;
                    let k = track[i];

                    let n;
                    let p;

                    for (; ; k = track[i]) {
                        if (k === "\n") {
                            status.is_loop = true;

                            if (status.loop < 0xff) {
                                i = status.loop;
                                continue;
                            }

                            k = MmlConst.KNO_R;
                            break;
                        }

                        if (k === 'r') {
                            k = MmlConst.KNO_R;
                            p = 0;
                            for (;;) {
                                ++i;
                                n = track[i];
                                if (n < '0' || '9' < n) {
                                    break;
                                }

                                n -= '0';
                                p *= 10;
                                p += n;
                            }

                            if (p > 0) {
                                l = 32 / p;
                                p = 0;
                            }

                            while (n === '.') {
                                ++p;
                                ++i;
                                n = track[i];
                            }
                            if (p > 0) {
                                n = p >> 1;
                                if (n > 0) {
                                    n *= l;
                                }
                                p &= 1;
                                if (p > 0) {
                                    n += l >> 1;
                                }
                                l += n;
                            }

                            // TODO : タイ、スラー
                            break;
                        }

                        if ('a' <= k && k <= 'g') {
                            k = MmlSequencer.key_no[k];
                            ++i;
                            n = track[i];

                            if (n === '+' || n === '#') {
                                ++k;

                            } else if (n === '-') {
                                --k;

                            } else if (n === '=' || n === '*') {
                                // no effect

                            } else {
                                --i;
                            }

                            p = 0;
                            for (;;) {
                                ++i;
                                n = track[i];
                                if (n < '0' || '9' < n) {
                                    break;
                                }

                                n -= '0';
                                p *= 10;
                                p += n;
                            }

                            if (p > 0) {
                                l = 32 / p;
                                p = 0;
                            }

                            while (n === '.') {
                                ++p;
                                ++i;
                                n = track[i];
                            }
                            if (p > 0) {
                                n = p >> 1;
                                if (n > 0) {
                                    n *= l;
                                }
                                p &= 1;
                                if (p > 0) {
                                    n += l >> 1;
                                }
                                l += n;
                            }

                            // TODO : タイ、スラー
                            break;
                        }

                        if (k === 'L') {
                            ++i;
                            status.loop = i;
                            continue;

                        } else if (k === '<') {
                            ++i;
                            --o;
                            status.octave = o;
                            continue;

                        } else if (k === '>') {
                            ++i;
                            ++o;
                            status.octave = o;
                            continue;

                        } else if (k === '(') {
                            ++i;
                            --m;
                            status.volume = m;
                            continue;

                        } else if (k === ')') {
                            ++i;
                            ++m;
                            status.volume = m;
                            continue;
                        }

                        p = 0;
                        for (;;) {
                            ++i;
                            n = track[i];

                            if (n < '0' || '9' < n) {
                                break;
                            }

                            n -= '0';
                            p *= 10;
                            p += n;
                        }

                        if (k === 'o') {
                            o = p - 1;
                            status.octave = o;
                            continue;

                        } else if (k === 'l') {
                            if (p > 0) {
                                l = 32 / p;
                                p = 0;
                            } else {
                                l = 1;
                            }

                            while (n === '.') {
                                ++p;
                                ++i;
                                n = track[i];
                            }
                            if (p > 0) {
                                n = p >> 1;
                                if (n > 0) {
                                    n *= l;
                                }
                                p &= 1;
                                if (p > 0) {
                                    n += l >> 1;
                                }
                                l += n;
                            }

                            status.length = l;
                            continue;

                        } else if (k === 't') {
                            p = p / 15 * 2;
                            status.tempo = p;
                            status.count = 60 - p;
                            continue;

                        } else if (k === 'v') {
                            m = p;
                            status.volume = m;
                            continue;
                        }
                    }

                    status.key_no = k;
                    status.key_octave = o;
                    status.key_length = l - 1;
                    status.index = i;

                    for (const name in audioUnits) {
                        let audioUnit = audioUnits[name];
                        let apu = audioUnit.apu;
                        let device = apu.devices[tr];
                        if (device !== undefined) {
                            if (status.key_no !== MmlConst.KNO_R) {
                                // TODO : 音色設定
                                //device.setVoice(status.voice);
                                device.setVolume(status.volume);
                                device.noteOn(MmlConst.KNO_COUNT * status.key_octave + status.key_no);
                            } else {
                                device.noteOff();
                            }
                        }
                    }
                }
            }
        }

        return status.is_loop;
    }
}
