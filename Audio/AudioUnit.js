/**
 * AudioUnit.js
 *
 * @author @MIRROR_
 * @license MIT
 */

/**
 * 擬似APUとトラックの紐付けを管理するクラス
 */
class AudioUnit
{
    /**
     * コンストラクタ
     * @param int sampleRate サンプリングレート
     * @param object params デバイス詳細定義（トラック、定位・遅延パラメータ）
     */
    constructor(sampleRate, params) {
        this.name = null;
        this.sampleRate = sampleRate;
        this.trackNumbers = [];
        this.positions = {};
        this.lates = {};
        this.delays = {};

        for (const key in params) {
            let value = params[key];

            switch (key) {
            case 'Name':
                // ユニット名
                this.name = value;
                break;

            case 'Devices':
                // デバイス詳細定義
                if (Array.isArray(value)) {
                    // デバイス詳細定義なしの場合はデフォルト値を設定
                    this.trackNumbers = value;
                    for (const index in this.trackNumbers) {
                        let tr = this.trackNumbers[index];
                        this.positions[tr] = [0.0, 1.0];
                        this.lates[tr] = 0.0;
                        this.delays[tr] = 0.0;
                    }

                } else {
                    // デバイス詳細定義の取得
                    this.trackNumbers = Object.keys(value);
                    for (const index in this.trackNumbers) {
                        let tr = this.trackNumbers[index];
                        let options = value[tr];

                        if (options['Position'] !== undefined) {
                            this.positions[tr] = options['Position'];
                        } else {
                            this.positions[tr] = [
                                (options['Pannning'] !== undefined) ? options['Panning'] : 0.0,
                                (options['Scale'] !== undefined) ? options['Scale'] : 1.0
                            ];
                        }
                        this.lates[tr] = (options['Late'] !== undefined) ? options['Late'] : 0.0;
                        this.delays[tr] = (options['Delay'] !== undefined) ? options['Delay'] : 0.0;
                    }
                }
                break;
            }
        }

        // 擬似APU設定
        this.apu = new PseudoApu(this.sampleRate, this.trackNumbers, this.lates, this.delays);
    }

    /**
     * 最大開始遅延時間を取得
     * @return 最大開始遅延時間
     */
    getMaxLate() {
        let result = 0;
        for (const tr in this.lates) {
            let late = this.lates[tr];
            if (result < late) {
                result = late;
            }
        }
        return result;
    }
}
