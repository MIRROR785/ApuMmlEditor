/**
 * TriangleDevice.js
 *
 * @author @MIRROR_
 * @license MIT
 */

/**
 * 三角波出力デバイスクラス
 */
class TriangleDevice extends AudioDevice
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
        this.amp = AudioDevice.BaseAmp;
        this.offsetFrequency = 0;
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
        let noteNo = this.noteNo + this.offsetNote;
        this.tone = AudioConst.getFrequency(noteNo) + this.offsetFrequency;
        this.cycleDelta = this.tone * Math.PI / this.sampleRate;

        let theta = Math.floor(this.cycleCount * 8 / Math.PI) * Math.PI / 8;
        let d = (2 * Math.acos(Math.cos(theta)) - Math.PI) / Math.PI;
        let v = this.amp * d;

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
