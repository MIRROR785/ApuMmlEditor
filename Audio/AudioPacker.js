/**
 * AudioPacker.js
 *
 * @author @MIRROR_
 * @license MIT
 */

/**
 * モノラル8ビットパッキング制御クラス
 */
class Monaural8bitPacker
{
    /**
     * 出力設定の初期化
     * @param AudioBuffer buffer オーディオバッファ
     */
    reset(buffer) {
        this.data = buffer.getChannelData(0);
        this.index = 0;
    }

    /**
     * パッキング
     * @param double scale スケール値
     * @param double[] values オーディオデータ
     */
    packing(scale, values) {
        let value = 0;
        for (const index in values) {
            let v = values[index];
            value += v;
        }
        value = (AudioConst.getValue(value * scale, -0x8000, 0x7fff) + 0x8000) / 256;
        this.data[this.index++] = value;
    }
}

/**
 * モノラル16ビットパッキング制御クラス
 */
class Monaural16bitPacker
{
    /**
     * 出力設定の初期化
     * @param AudioBuffer buffer オーディオバッファ
     */
    reset(buffer) {
        this.data = buffer.getChannelData(0);
        this.index = 0;
    }

    /**
     * パッキング
     * @param double scale スケール値
     * @param double[] values オーディオデータ
     */
    packing(scale, values) {
        let value = 0;
        for (const index in values) {
            let v = values[index];
            value += v;
        }
        value = AudioConst.getValue(value * scale, -0x8000, 0x7fff);
        this.data[this.index++] = value;
    }
}

/**
 * モノラル32ビットfloatパッキング制御クラス
 */
class Monaural32bitFloatPacker
{
    /**
     * 出力設定の初期化
     * @param AudioBuffer buffer オーディオバッファ
     */
    reset(buffer) {
        this.data = buffer.getChannelData(0);
        this.index = 0;
    }

    /**
     * パッキング
     * @param double scale スケール値
     * @param double[] values オーディオデータ
     */
    packing(scale, values) {
        let value = 0;
        for (const index in values) {
            let v = values[index];
            value += v;
        }
        value = AudioConst.getValue(value * scale, -0x8000, 0x7fff);
        value = value * scale / 32768.0;
        this.data[this.index++] = value;
    }
}

/**
 * ステレオ8ビットパッキング制御クラス
 */
class Stereo8bitPacker
{
    /**
     * 出力設定の初期化
     * @param AudioBuffer buffer オーディオバッファ
     */
    reset(buffer) {
        this.data0 = buffer.getChannelData(0);
        this.data1 = buffer.getChannelData(1);
        this.index = 0;
    }

    /**
     * パッキング
     * @param double scale スケール値
     * @param double[][] values オーディオデータ
     */
    packing(scale, values) {
        let left  = 0;
        let right = 0;
        for (const index in values) {
            let v = values[index];
            left  += v[0];
            right += v[1];
        }
        left  = (AudioConst.getValue(left  * scale, -0x8000, 0x7fff) + 0x8000) / 256;
        right = (AudioConst.getValue(right * scale, -0x8000, 0x7fff) + 0x8000) / 256;
        this.data0[this.index] = left;
        this.data1[this.index] = right;
        ++this.index;
    }
}

/**
 * ステレオ16ビットパッキング制御クラス
 */
class Stereo16bitPacker
{
    /**
     * 出力設定の初期化
     * @param AudioBuffer buffer オーディオバッファ
     */
    reset(buffer) {
        this.data0 = buffer.getChannelData(0);
        this.data1 = buffer.getChannelData(1);
        this.index = 0;
    }

    /**
     * パッキング
     * @param double scale スケール値
     * @param double[][] values オーディオデータ
     */
    packing(scale, values) {
        let left  = 0;
        let right = 0;
        for (const index in values) {
            let v = values[index];
            left  += v[0];
            right += v[1];
        }
        left  = AudioConst.getValue(left  * scale, -0x8000, 0x7fff);
        right = AudioConst.getValue(right * scale, -0x8000, 0x7fff);
        this.data0[this.index] = left;
        this.data1[this.index] = right;
        ++this.index;
    }
}

/**
 * ステレオ32ビットfloatパッキング制御クラス
 */
class Stereo32bitFloatPacker
{
    /**
     * 出力設定の初期化
     * @param AudioBuffer buffer オーディオバッファ
     */
    reset(buffer) {
        this.data0 = buffer.getChannelData(0);
        this.data1 = buffer.getChannelData(1);
        this.index = 0;
    }

    /**
     * パッキング
     * @param double scale スケール値
     * @param double[][] values オーディオデータ
     */
    packing(scale, values) {
        let left  = 0;
        let right = 0;
        for (const index in values) {
            let v = values[index];
            left  += v[0];
            right += v[1];
        }
        left  = AudioConst.getValue(left  * scale, -0x8000, 0x7fff);
        right = AudioConst.getValue(right * scale, -0x8000, 0x7fff);
        left  = left  * scale / 32768.0;
        right = right * scale / 32768.0;
        this.data0[this.index] = left;
        this.data1[this.index] = right;
        ++this.index;
    }
}

/**
 * オーディオパッキング制御クラス
 */
class AudioPacker
{
    /**
     * インスタンスの生成
     * @param int channelCount チャンネル数
     * @param int sampleBits 量子化ビット数
     */
    static create(channelCount, sampleBits) {
        let packer = null;

        switch (sampleBits) {
        case 8:
            packer = (channelCount === 1) ? new Monaural8bitPacker() : new Stereo8bitPacker();
            break;
        case 32:
            packer = (channelCount === 1) ? new Monaural32bitFloatPacker() : new Stereo32bitFloatPacker();
            break;
        default:
            packer = (channelCount === 1) ? new Monaural16bitPacker() : new Stereo16bitPacker();
            break;
        }

        return packer;
    }
}
