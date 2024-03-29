import React, {useState, useEffect, useRef} from 'react';
import './Carplay.css';
import JMuxer from 'jmuxer';
import Modal from "react-modal";
import Settings from './Settings'
import useMediaQuery from '@mui/material/useMediaQuery';
import {Button, Dialog} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import io from 'socket.io-client'
const socket = io("ws://localhost:5005")
let jmuxer


const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        minWidth: '80%',
        transform: 'translate(-50%, -50%)',
        overflow: 'scroll'
    },
};

function Carplay ({changeSetting, settings, reload, openModal, openModalReq, closeModalReq}) {

    const [height, setHeight] = useState(0)
    const [width, setWidth] = useState(0)
    const [mouseDown, setMouseDown] = useState(false)
    const [lastX, setLastX] = useState(0)
    const [lastY, setLastY] = useState(0)
    const [status, setStatus] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const ref = useRef(null)
    const theme = useTheme();


    useEffect(() => {
        Modal.setAppElement(document.getElementById('main'));
        console.log("creating carplay", settings)
        jmuxer = new JMuxer({
            node: 'player',
            mode: 'video',
            maxDelay: 30,
            fps: settings.fps,
            flushingTime: 100,
            debug: false

        });

        const height = ref.current.clientHeight
        const width = ref.current.clientWidth

        setHeight(height)
        setWidth(width)

        socket.on('carplay', (data) => {
            feed(data)
        })

        socket.on('status', ({status}) => {
            console.log("new status", status)
            setStatus(status)
        })

        socket.emit('statusReq')

        socket.on('quit', () => openModalReq())


        return () => {
            console.log("cleaning")
            socket.off('carplay')
            socket.off('status')
            socket.off('quit')
            jmuxer.destroy()
        }
    }, [])

    const feed = async (data) => {
        let buf = Buffer.from(data)
        let duration = buf.readInt32BE(0)
        let video = buf.slice(4)
        //console.log("duration was: ", duration)
        jmuxer.feed({video: new Uint8Array(video), duration:duration})
    }

    useEffect(() => {
        setModalOpen(openModal)
    },[openModal])

    const changeValue = (k, v) => {
        changeSetting(k, v)
    }

    const closeModal = () => {
        setModalOpen(false)
    }

    const handleMDown = (e) => {
        let currentTargetRect = e.target.getBoundingClientRect();
        let x = e.clientX - currentTargetRect.left
        let y = e.clientY - currentTargetRect.top
        x = x / width
        y = y / height
        setLastX(x)
        setLastY(y)
        setMouseDown(true)
        socket.emit('click', {type: 14, x: x, y: y})
    }

    const handleMUp = (e) => {
        let currentTargetRect = e.target.getBoundingClientRect();
        let x = e.clientX - currentTargetRect.left
        let y = e.clientY - currentTargetRect.top
        x = x / width
        y = y / height
        console.log("up")
        setMouseDown(false)
        socket.emit('click', {type: 16, x: x, y: y})
    }

    const handleMMove = (e) => {
        let currentTargetRect = e.target.getBoundingClientRect();
        let x = e.clientX - currentTargetRect.left
        let y = e.clientY - currentTargetRect.top
        x = x / width
        y = y / height
        socket.emit('click', {type: 15, x: x, y: y})
    }

    const handleDown = (e) => {
        let currentTargetRect = e.target.getBoundingClientRect();
        let x = e.touches[0].clientX - currentTargetRect.left
        let y = e.touches[0].clientY - currentTargetRect.top
        x = x / width
        y = y / height
        setLastX(x)
        setLastY(y)
        setMouseDown(true)
        socket.emit('click', {type: 14, x: x, y: y})
        e.preventDefault()
    }

    const handleUp = (e) => {
        let x = lastX
        let y = lastY
        setMouseDown(false)
        console.log("up")
        socket.emit('click', {type: 16, x: x, y: y})
        e.preventDefault()
    }

    const handleMove = (e) => {
        let currentTargetRect = e.target.getBoundingClientRect();
        let x = e.touches[0].clientX - currentTargetRect.left
        let y = e.touches[0].clientY - currentTargetRect.top
        x = x / width
        y = y / height
        socket.emit('click', {type: 15, x: x, y: y})
    }



    return (
        <div style={{height: '100%'}}  id={'main'}>
            <div ref={ref}
                 className="App"
                 onTouchStart={handleDown}
                 onTouchEnd={handleUp}
                 onTouchMove={(e) => {
                     if (mouseDown) {
                         handleMove(e)
                     }
                 }}
                 onMouseDown={handleMDown}
                 onMouseUp={handleMUp}
                 onMouseMove={(e) => {
                     if (mouseDown) {
                         handleMMove(e)
                     }
                 }}
                 style={{height: '100%', width: '100%', padding: 0, margin: 0, display: 'flex'}}>
                <video  style={{height: status ? "100%" : "0%"}} autoPlay muted id="player" />
                {status ? <div></div>
                    :
                    <div style={{marginTop: 'auto', marginBottom: 'auto', textAlign: 'center', flexGrow: '1'}}>
                        <div style={{marginTop: 'auto', marginBottom: 'auto', textAlign: 'center', flexGrow: '1'}}>CONNECT IPHONE TO BEGIN CARPLAY</div>
                        <Button onMouseDown={openModalReq} onTouchStart={openModalReq}>Settings</Button>
                        {status ? <button >Open Carplay</button> : <div></div>}
                    </div>
                }
            </div>
            <Dialog
                open={modalOpen}
                // onAfterOpen={afterOpenModal}
                maxWidth={'xl'}
                fullWidth={true}
                onClose={closeModalReq}
                contentLabel="Settings"
                ariaHideApp={true}
                styles={customStyles}
                sx={{minWidth: '80%', minHeight:'80%'}}
            >
                <Settings settings={settings} changeValue={changeValue} reqReload={reload}/>
            </Dialog>
        </div>
    );
}

export default Carplay;
