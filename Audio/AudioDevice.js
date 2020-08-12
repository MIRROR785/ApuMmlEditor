/**
 * AudioDevice.js
 *
 * @author @MIRROR_
 * @license MIT
 */

/**
 * 遅延実行用パラメータ制御クラス
 */
class ParamControl
{
    /**
     * コンストラクタ
     * @param AudioDevice device オーディオデバイス
     * @param int value 設定値
     */
    constructor(device, value) {
        this.device = device;
        this.value = value;
    }

    /**
     * 実行可能状態確認
     * @return bool 実行判定
     */
    isAction() {
        return true;
    }

    /**
     * 実行カウントを取得
     * @return int 実行カウント
     */
    getCount() {
        return 0;
    }
}

/**
 * 遅延実行用音色制御クラス
 */
class VoiceControl extends ParamControl
{
    /**
     * コンストラクタ
     * @param AudioDevice device オーディオデバイス
     * @param int value 音色
     */
    constructor(device, value) {
        super(device, value);
    }

    /**
     * 制御処理の実行
     * @return bool 継続実行判定
     */
    action() {
        this.device.setVoiceValue(this.value);
        return true;
    }
}

/**
 * 遅延実行用音量制御クラス
 */
class VolumeControl extends ParamControl
{
    /**
     * コンストラクタ
     * @param AudioDevice device オーディオデバイス
     * @param int value 音量
     */
    constructor(device, value) {
        super(device, value);
    }

    /**
     * 制御処理の実行
     * @return bool 継続実行判定
     */
    action() {
        this.device.setVolumeValue(this.value);
        return true;
    }
}

/**
 * 遅延実行用音量オフセット制御クラス
 */
class OffsetVolumeControl extends ParamControl
{
    /**
     * コンストラクタ
     * @param AudioDevice device オーディオデバイス
     * @param int value 音量オフセット
     */
    constructor(device, value) {
        super(device, value);
    }

    /**
     * 制御処理の実行
     * @return bool 継続実行判定
     */
    action() {
        this.device.setOffsetVolumeValue(this.value);
        return true;
    }
}

/**
 * 遅延実行用ノート番号制御クラス
 */
class NoteNoControl extends ParamControl
{
    /**
     * コンストラクタ
     * @param AudioDevice device オーディオデバイス
     * @param int value ノート番号
     */
    constructor(device, value) {
        super(device, value);
    }

    /**
     * 制御処理の実行
     * @return bool 継続実行判定
     */
    action() {
        this.device.setNoteNoValue(this.value);
        return true;
    }
}

/**
 * 遅延実行用ノートオフセット制御クラス
 */
class OffsetNoteControl extends ParamControl
{
    /**
     * コンストラクタ
     * @param AudioDevice device オーディオデバイス
     * @param int value ノートオフセット
     */
    constructor(device, value) {
        super(device, value);
    }

    /**
     * 制御処理の実行
     * @return bool 継続実行判定
     */
    action() {
        this.device.setOffsetNoteValue(this.value);
        return true;
    }
}

/**
 * 遅延実行用周波数オフセット制御クラス
 */
class OffsetFrequencyControl extends ParamControl
{
    /**
     * コンストラクタ
     * @param AudioDevice device オーディオデバイス
     * @param int value 周波数オフセット
     */
    constructor(device, value) {
        super(device, value);
    }

    /**
     * 制御処理の実行
     * @return bool 継続実行判定
     */
    action() {
        this.device.setOffsetFrequencyValue(this.value);
        return true;
    }
}

/**
 * 遅延実行用発音遅延時間制御クラス
 */
class DelayControl extends ParamControl
{
    /**
     * コンストラクタ
     * @param AudioDevice device オーディオデバイス
     * @param int value 発音遅延時間
     */
    constructor(device, value) {
        super(device, value);
    }

    /**
     * 制御処理の実行
     * @return bool 継続実行判定
     */
    action() {
        this.device.setDelayValue(this.value);
        return true;
    }
}

/**
 * 遅延実行用ノート制御クラス
 */
class NoteControl
{
    /**
     * コンストラクタ
     * @param AudioDevice device オーディオデバイス
     * @param int count 実行カウント
     * @param bool enabled ノート有効判定
     * @param int noteNo ノート値
     */
    constructor(device, count, enabled, noteNo) {
        this.device = device;
        this.count = count;
        this.enabled = enabled;
        this.noteNo = noteNo;
    }

    /**
     * 実行可能状態確認
     * @return bool 実行判定
     */
    isAction() {
        return (--this.count < 0);
    }

    /**
     * 実行カウントを取得
     * @return int 実行カウント
     */
    getCount() {
        return this.count;
    }

    /**
     * 制御処理の実行
     * @return bool 継続実行判定
     */
    action() {
        if (this.enabled) {
            this.device.setNoteOn(this.noteNo);
        } else {
            this.device.setNoteOff();
        }
        return false;
    }
}

/**
 * オーディオデバイスの抽象クラス
 */
class AudioDevice
{
    /**
     * コンストラクタ
     * @param int sampleRate サンプリングレート
     */
    constructor(sampleRate) {
        this.sampleRate = sampleRate;
        this.late = 0;
        this.reset();
    }

    /**
     * 再初期化
     */
    reset() {
        this.lateCount = Math.floor(this.late * this.sampleRate);
        this.volume = 0;
        this.offsetVolume = 0;
        this.nodeNo = 0;
        this.offsetNote = 0;
        this.tone = 440;
        this.cycleCount = 0;
        this.cyclecycleDelta = 0;
        this.delay = 0;
        this.delayCount = 0;
        this.amp = 0;
        this.stopped = true;
        this.controls = [];
    }

    /**  @var int 基本増幅量 */
    static BaseAmp = 0x800;

    /**
     * サンプリングレートを設定
     * @param int value サンプリングレート
     */
    setSampleRate(value) {
        this.sampleRate = value;
    }

    /**
     * サンプリングレートを取得
     * @return int サンプリングレート
     */
    getSampleRate() {
        return this.sampleRate;
    }

    /**
     * 開始遅延時間を設定
     * @param double value 開始遅延時間
     */
    setLate(value) {
        this.late = value;
        this.lateCount = Math.foor(this.sampleRate * this.late);
    }

    /**
     * 開始遅延時間を取得
     * @return double 開始遅延時間
     */
    getLate() {
        return this.late;
    }

    /**
     * 音色を設定
     * @param int value 音色
     */
    setVoice(value) {
        if (this.lateCount > 0) {
            this.addControl(new VoiceControl(this, value));
        } else {
            this.setVoiceValue(value);
        }
    }

    /**
     * 音色を取得
     * @return int 音色
     */
    getVoice() {
        return this.getVoiceValue();
    }

    /**
     * 音量を設定
     * @param int value 音量
     */
    setVolume(value) {
        if (this.lateCount > 0) {
            this.addControl(new VolumeControl(this, value));
        } else {
            this.setVolumeValue(value);
        }
    }

    /**
     * 音量を取得
     * @return int 音量
     */
    getVolume() {
        return this.volume;
    }

    /**
     * 音量オフセットを設定
     * @param int value 音量オフセット
     */
    setOffsetVolume(value) {
        if (this.lateCount > 0) {
            this.addControl(new OffsetVolumeControl(this, value));
        } else {
            this.setOffsetVolumeValue(value);
        }
    }

    /**
     * 音量オフセットを取得
     * @return int 音量オフセット
     */
    getOffsetVolume() {
        return this.offsetVolume;
    }

    /**
     * ノート番号を設定
     * @param int value ノート番号
     */
    setNoteNo(value) {
        if (this.lateCount > 0) {
            this.addControl(new NoteNoControl(this, value));
        } else {
            this.setNoteNoValue(value);
        }
    }

    /**
     * ノート番号を取得
     * @return int ノート番号
     */
    getNoteNo() {
        return this.noteNo;
    }

    /**
     * ノートオフセットを設定
     * @param int value ノートオフセット
     */
    setOffsetNote(value) {
        if (this.lateCount > 0) {
            this.addControl(new OffsetNoteControl(this, value));
        } else {
            this.setOffsetNoteValue(value);
        }
    }

    /**
     * ノートオフセットを取得
     * @return int ノートオフセット
     */
    getOffsetNote() {
        return this.offsetNote;
    }

    /**
     * 周波数オフセットを設定
     * @param int value 周波数オフセット
     */
    setOffsetFrequency(value) {
        if (this.lateCount > 0) {
            this.addControl(new OffsetFrequencyControl(this, value));
        } else {
            this.setOffsetFrequencyValue(value);
        }
    }

    /**
     * 周波数オフセットを取得
     * @return int 周波数オフセット
     */
    getOffsetFrequency() {
        return this.getOffsetFrequencyValue();
    }

    /**
     * 発音遅延時間を設定
     * @param double value 発音遅延時間
     */
    setDelay(value) {
        if (this.lateCount > 0) {
            this.addControl(new DelayControl(this, value));
        } else {
            this.setDelayValue(value);
        }
    }

    /**
     * 発音遅延時間を取得
     * @return double 発音遅延時間
     */
    getDelay() {
        return this.delay;
    }

    /**
     * ノートオン
     * @param int value ノート番号
     */
    noteOn(noteNo = null) {
        if (this.lateCount > 0) {
            this.addControl(new NoteControl(this, this.getLateCount(), true, noteNo));
        } else {
            this.setNoteOn(noteNo);
        }
    }

    /**
     * ノートオフ
     */
    noteOff() {
        if (this.lateCount > 0) {
            this.addControl(new NoteControl(this, this.getLateCount(), false, null));
        } else {
            this.setNoteOff();
        }
    }

    /**
     * 発音停止判定を取得
     * @return bool 判定結果
     */
    isNoteOff() {
        return this.stopped;
    }

    /**
     * 遅延カウントの取得
     * @return int 遅延カウント
     */
    getLateCount() {
        count = 0;
        for (const control in this.controls) {
            count += control.getCount();
        }
        return this.lateCount - count;
    }

    /**
     * 遅延実行情報の追加
     * @param DeviceController control 制御情報
     */
    addControl(control) {
        this.controls.push(control);
    }

    /**
     * 音色を設定
     * @param int value 音色
     */
    setVoiceValue(value) {
    }

    /**
     * 音色を取得
     * @return int 音色
     */
    getVoiceValue() {
        return 0;
    }

    /**
     * 音量を設定
     * @param int value 音量
     */
    setVolumeValue(value) {
        this.volume = AudioConst.getValue(value, 0, 15);
    }

    /**
     * 音量オフセットを設定
     * @param int value 音量オフセット
     */
    setOffsetVolumeValue(value) {
        this.offsetVolume = AudioConst.getValue(value, 0, 15);
    }

    /**
     * ノート番号を設定
     * @param int value ノート番号
     */
    setNoteNoValue(value) {
        this.noteNo = value;
    }

    /**
     * ノートオフセットを設定
     * @param int value ノートオフセット
     */
    setOffsetNoteValue(value) {
        this.offsetNote = AudioConst.getValue(value, -64, 63);
    }

    /**
     * 周波数オフセットを設定
     * @param int value 周波数オフセット
     */
    setOffsetFrequencyValue(value) {
    }

    /**
     * 周波数オフセットを取得
     * @return int 周波数オフセット
     */
    getOffsetFrequencyValue() {
        return 0;
    }

    /**
     * 発音遅延時間を設定
     * @param double value 発音遅延時間
     */
    setDelayValue(value) {
        this.delay = value;
    }

    /**
     * ノートオン設定
     * @param int noteNo ノート値
     */
    setNoteOn(noteNo) {
        this.stopped = false;
        if (noteNo !== null) {
            this.noteNo = noteNo;
        }
        this.delayCount = Math.floor(this.sampleRate * this.delay);
    }

    /**
     * ノートオフ設定
     */
    setNoteOff() {
        this.stopped = true;
        this.cycleCount = 0;
    }

    /**
     * 登録済みデバイス制御情報数を取得
     * return int デバイス制御情報数
     */
    getControlCount() {
        return this.controls.length;
    }

    /**
     * サンプリング
     * @return int サンプリング情報
     */
    sampling() {
        let v = 0;

        while (this.controls.length > 0) {
            control = this.controls[0];
            if (control.isAction()) {
                this.controls.shift();

                if (!control.action()) {
                    break;
                }

            } else {
                break;
            }
        }

        if (!this.stopped) {
            if (this.delayCount > 0) {
                --this.delayCount;

            } else {
                v = this.getSample();
            }
        }

        return v;
    }

    /**
     * サンプリング値を取得
     * @return int サンプリング値
     */
    getSample() {
        return 0;
    }

    /**
     * 現在の周波数を取得
     * @return int 周波数
     */
    getCurrentFrequency() {
        return 0;
    }
}
