// utils/tts.js
const tts = uni.requireNativePlugin("nrb-tts-plugin")

export function speak(text) {

    if (!tts) {
        console.error("TTS 插件未加载")
        return
    }

    // 初始化
    tts.init({ 
        lang: "ZH",
        country: "CN"
    }, res => {
        console.log("TTS 初始化：", res)

        // 播放
        tts.speak(text, {}, e => {
            console.log("TTS 播放结果：", e)
        })
    })
}

export function stopSpeak() {
    tts && tts.stop()
}
