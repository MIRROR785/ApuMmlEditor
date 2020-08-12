/**
 * PseudoApu.js
 *
 * @author @MIRROR_
 * @license MIT
 */

/**
 * 擬似APUクラス
 */
class PseudoApu
{
    /**
     * コンストラクタ
     * @param int sampleRate サンプリングレート
     * @param int[] trackNumbers トラック番号配列
     * @param double[] lates 開始遅延時間配列
     * @param double[] delays 発音遅延時間配列
     */
    constructor(sampleRate, trackNumbers = null, lates = null, delays = null) {
        // 引数確認
        if (trackNumbers === null) {
            trackNumbers = [1, 2, 3, 4];
        }

        if (lates === null) {
            lates = {1:0.0, 2:0.0, 3:0.0, 4:0.0};
        }

        if (delays === null) {
            delays = {1:0.0, 2:0.0, 3:0.0, 4:0.0};
        }

        // デバイス
        this.pulse1 = new PulseDevice(sampleRate);
        this.pulse2 = new PulseDevice(sampleRate);
        this.triangle = new TriangleDevice(sampleRate);
        this.noise = new NoiseDevice(sampleRate);

        // デバイスリスト
        this.devices = [
            null,
            this.pulse1,
            this.pulse2,
            this.triangle,
            this.noise,
        ];

        // トラック順
        this.trackNumbers = trackNumbers;

        // 遅延時間
        this.lates = lates;
        this.delays = delays;

        // 再初期化
        this.reset();
    }

    /**
     * 再初期化
     */
    reset() {
        for (const index in this.trackNumbers) {
            let tr = this.trackNumbers[index];
            let dev = this.devices[tr];
            dev.noteOff();
            if (tr < this.lates.length) {
                let v = this.lates[tr];
                if (v !== undefined) {
                    dev.setLate(v);
                }
            }
            if (tr < this.delays.length) {
                let v = this.delays[tr];
                if (v !== undefined) {
                    dev.setDelay(v);
                }
            }
        }
    }

    /**
     * サンプリング
     * @return double[] サンプリングデータ
     */
    sampling() {
        let values = [];
        for (const index in this.trackNumbers) {
            let tr = this.trackNumbers[index];
            values.push(this.devices[tr].sampling());
        }
        return values;
    }
}
