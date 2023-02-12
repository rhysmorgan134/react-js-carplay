import PCMPlayer from "./pcm-player";
import React, {useEffect, useRef} from "react";
import io from "socket.io-client";
const socket = io("ws://localhost:5005")
let channel1
let channel2


export default function() {
    const channel1Decode = useRef(5)
    const channel2Decode = useRef(4)

    useEffect(() => {
        const channel1 = new PCMPlayer({
            encoding: '16bitInt',
            channels: 1,
            sampleRate: 16000,
            flushingTime: 50
        })
        const channel2 = new PCMPlayer({
            encoding: '16bitInt',
            channels: 2,
            sampleRate: 48000,
            flushingTime: 50
        })

        const decodeMap = {
            1: {
                sampleRate: 44100,
                channels: 2
            },
            2: {
                sampleRate: 44100,
                channels: 2
            },
            3: {
                sampleRate: 8000,
                channels: 1
            },
            4: {
                sampleRate: 48000,
                channels: 2
            },
            5: {
                sampleRate: 16000,
                channels: 1
            },
            6: {
                sampleRate: 24000,
                channels: 1
            },
            7: {
                sampleRate: 16000,
                channels: 2
            },
        }
        socket.on('audio', (data) => {
            if(data.audioType === 1) {
                if(data.decode === channel1Decode.current) {
                    if(data.volume !== 0) {
                        channel1.volume(data.volume)
                    }
                    feed1(data)

                } else {
                    console.log(channel1Decode.current, data.decode)
                    channel1.updateSample(decodeMap[data.decode])
                    channel1Decode.current = data.decode
                    feed1(data)
                }
            } else if (data.audioType===2) {
                if (data.decode === channel2Decode.current) {
                    if (data.volume !== 0) {
                        channel2.volume(data.volume)
                    }
                    feed2(data)
                } else {
                    console.log(channel2Decode.current, data.decode)
                    channel2.updateSample(decodeMap[data.decode])
                    channel2Decode.current = data.decode

                }
            }
        })
        return () => {
            socket.off('audio')
            channel1.destroy()
            channel2.destroy()
        }
    }, [])

    const feed1= async(data) => {
        channel1.feed(new Uint8Array(data.data))
    }

    const feed2= async(data) => {

    }

    return (
        <div></div>
    )
}
