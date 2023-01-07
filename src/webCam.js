import React, { useEffect, useRef, useState } from "react";
import {Typography} from "@mui/material";

const Webcam = () => {
    const videoRef = useRef(null);
    const [cameraFound, setCameraFound] = useState(false)

    useEffect(() => {
        getVideo();
    }, [videoRef]);

    const getVideo = () => {
        navigator.mediaDevices
            .getUserMedia({ video: { width: 800} })
            .then(stream => {
                setCameraFound(true)
                let video = videoRef.current;
                video.srcObject = stream;
                video.play();
            })
            .catch(err => {
                console.error("error:", err);
            });
    };

    return (
        <div >
            <div >
                {cameraFound ?
                    <video ref={videoRef} style={{maxWidth: '100%', height: 'auto'}}/> :
                    <Typography>No Camera Found</Typography>}
            </div>
        </div>
    );
};

export default Webcam;