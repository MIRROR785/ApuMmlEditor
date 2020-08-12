/**
 * NoiseDevice.js
 *
 * @author @MIRROR_
 * @license MIT
 */

/**
 * ノイズ出力デバイスクラス
 */
class NoiseDevice extends AudioDevice
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
        this.shortFreq = false;
        this.reg = 0x8000;
        this.edge = false;
    }

    /**
     * 音色を設定
     * @param int value 音色 (0:長周期, 1:短周期)
     */
    setVoiceValue(value) {
        this.shortFreq = (value != 0);
    }

    /**
     * 音色を取得
     * @return int 音色
     */
    getVoiceValue() {
        return this.shortFreq ? 1 : 0;
    }

    /**
     * サンプリング
     * @return int サンプリング情報
     */
    getSample() {
        let noteNo = this.noteNo + this.offsetNote;
        this.tone = AudioConst.getNoiseFrequency(noteNo);
        this.cycleDelta = this.tone * 2 * Math.PI / this.sampleRate;
        this.amp = AudioDevice.BaseAmp * AudioConst.getValue(this.volume + this.offsetVolume, 0, 15) / 15;

        let s = Math.sin(this.cycleCount);

        if (this.edge) {
            if (s < 0) {
                this.edge = false;
            }
        } else if (s >= 0) {
            // ニコニコ大百科(仮) FC音源<https://dic.nicovideo.jp/a/fc%E9%9F%B3%E6%BA%90>
            this.reg >>= 1;
            this.reg |= ((this.reg ^ (this.reg >> (this.shortFreq ? 6 : 1))) & 1) << 15;
            this.edge = true;
        }
        let v = (this.reg & 1) ? this.amp: -this.amp;

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
            let freq = AudioConst.getNoiseFrequency(noteNo);
            return freq;
        }
    }
}
