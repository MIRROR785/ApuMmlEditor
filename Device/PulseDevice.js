/**
 * PulseDevice.js
 *
 * @author @MIRROR_
 * @license MIT
 */

/**
 * 矩形波出力デバイスクラス
 */
class PulseDevice extends AudioDevice
{
    /**
     * コンストラクタ
     * @param int sampleRate サンプリングレート
     */
    constructor(sampleRate) {
        super(sampleRate);
    }

    /**
     * 再初期化
     */
    reset() {
        super.reset();
        this.dutyCycle = 0;
        this.offsetFrequency = 0;
    }

    /**
     * 音色を設定
     * @param int value 音色 (デューティ比 0:12.5%, 1:25%, 2:50%, 3:75%)
     */
    setVoiceValue(value) {
        this.dutyCycle = value & 3;
    }

    /**
     * 音色を取得
     * @return int 音色
     */
    getVoiceValue() {
        return this.dutyCycle;
    }

    /**
     * 周波数オフセットを設定
     * @param int value 周波数オフセット (-64 ~ 63)
     */
    setOffsetFrequencyValue(value) {
        this.offsetFrequency = AudioConst.getValue(value, -64, 63);
    }

    /**
     * 周波数オフセットを取得
     * @return int 周波数オフセット
     */
    getOffsetFrequencyValue() {
        return this.offsetFrequency;
    }

    /**
     * サンプリング値を取得
     * @return int サンプリング値
     */
    getSample() {
        let v = 0;

        let noteNo = this.noteNo + this.offsetNote;
        this.tone = AudioConst.getFrequency(noteNo) + this.offsetFrequency;
        this.cycleDelta = this.tone * 2 * Math.PI / this.sampleRate;
        this.amp = AudioDevice.BaseAmp * AudioConst.getValue(this.volume + this.offsetVolume, 0, 15) / 31;

        let s = Math.sin(this.cycleCount);
        let c = Math.cos(this.cycleCount);

        switch (this.dutyCycle) {
        case 0:
            // 12.5%
            v = (s >= 0 && c >= 0 && s <= c) ? this.amp : -this.amp;
            break;

        case 1:
            // 25%
            v = (s >= 0 && c >= 0) ? this.amp : -this.amp;
            break;

        case 2:
            // 50%
            v = (s >= 0) ? this.amp : -this.amp;
            break;

        case 3:
            // 75%
            v = (s < 0 || c < 0) ? this.amp : -this.amp;
            break;
        }

        this.cycleCount += this.cycleDelta;

        if (this.cycleCount >= 2 * Math.PI) {
            this.cycleCount -= 2 * Math.PI;
        }

        return v;
    }

    /**
     * 現在の周波数を取得
     * @return int 周波数
     */
    getCurrentFrequency() {
        if (this.stopped) {
            return 0;

        } else {
            let noteNo = this.noteNo + this.offsetNote;
            let freq = AudioConst.getFrequency(noteNo) + this.offsetFrequency;
            return freq;
        }
    }
}
