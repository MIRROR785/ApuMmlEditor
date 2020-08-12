/**
 * AudioMixer.js
 *
 * @author @MIRROR_
 * @license MIT
 */

/**
 * モノラルミキシング制御クラス
 */
class MonauralMixer
{
    /**
     * ミキシング
     * @param int[] trackNumbers トラック番号配列
     * @param int:double[] positions 定位配列
     * @param double[] values トラック毎のサンプリング情報
     * @return double モノラルミキシング結果
     */
    mixing(trackNumbers, positions, values) {
        let count = trackNumbers.length;
        let value = 0;

        for (let i = 0; i < count; ++i) {
            let tr = trackNumbers[i];
            let p = positions[tr];
            let v = values[i];
            let s = p[1];
            value += v * s;
        }

        return value;
    }
}

/**
 * ステレオミキシング制御クラス
 */
class StereoMixer
{
    /**
     * ミキシング
     * @param int[] trackNumbers トラック番号配列
     * @param int:double[] positions 定位配列
     * @param double[] values トラック毎のサンプリング情報
     * @return double[] ステレオミキシング結果
     */
    mixing(trackNumbers, positions, values) {
        let count = trackNumbers.length;
        let l = 0;
        let r = 0;

        for (let i = 0; i < count; ++i) {
            let tr = trackNumbers[i];
            let p = positions[tr];

            // Pan(left) : -1.5 ~-1.25~-1.0 ~-0.75~-0.5 ~-0.25~ 0.0 ~ 0.25~ 0.5 ~ 0.75~ 1.0 ~ 1.25~ 1.5
            //          =>  0.0 ~ 0.25~ 0.5 ~ 0.75~ 1.0 ~ 0.75~ 0.5 ~ 0.25~ 0.0 ~ 0.0 ~ 0.0 ~ 0.0 ~ 0.0
            //             ______.......------++++++*****+++++------......_____________________________
            // n + 0.5     -1.0  -0.75 -0.5  -0.25  0.0   0.25  0.5   0.75  1.0   1.25  1.5   1.75  2.0
            // abs(n)       1.0   0.75  0.5   0.25  0.0   0.25  0.5   0.75  1.0   1.25  1.5   1.75  2.0
            // 1.0 - n      0.0   0.25  0.5   0.75  1.0   0.75  0.5   0.25  0.0  -0.25 -0.5  -0.75 -1.0
            let pl = AudioConst.getValue(1.0 - Math.abs(p[0] + 0.5), -1.0, 1.0);

            // Pan(right): -1.5 ~-1.25~-1.0 ~-0.75~-0.5 ~-0.25~ 0.0 ~ 0.25~ 0.5 ~ 0.75~ 1.0 ~ 1.25~ 1.5
            //          =>  0.0 ~ 0.0 ~ 0.0 ~ 0.0 ~ 0.0 ~ 0.25~ 0.5 ~ 0.75~ 1.0 ~ 0.75~ 0.5 ~ 0.25~ 0.0
            //             ______________________________.......------++++++*****+++++------......_____
            // n - 0.5     -2.0  -1.75 -1.5  -1.25 -1.0  -0.75 -0.5  -0.25  0.0   0.25  0.5   0.75  1.0
            // abs(n)       2.0   1.75  1.5   1.25  1.0   0.75  0.5   0.25  0.0   0.25  0.5   0.75  1.0
            // 1.0 - n     -1.0  -0.75 -0.5  -0.25  0.0   0.25  0.5   0.75  1.0   0.25  0.5   0.25  0.0
            let pr = AudioConst.getValue(1.0 - Math.abs(p[0] - 0.5), -1.0, 1.0);

            let s = p[1];
            let v = values[i];
            l += v * pl * s;
            r += v * pr * s;
        }

        return [l, r];
    }
}

/**
 * オーディオミキシング制御クラス
 */
class AudioMixer
{
    /**
     * インスタンスの生成
     * @param int channelCount チャンネル数
     */
    static create(channelCount) {
        return (channelCount == 1) ? new MonauralMixer() : new StereoMixer();
    }
}
