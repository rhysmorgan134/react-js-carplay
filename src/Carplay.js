import React, {Component} from 'react';
import './Carplay.css';
import "@fontsource/montserrat";
import JMuxer from 'jmuxer';
import Modal from "react-modal";
import Settings from './Settings'

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        minWidth: '50%',
        transform: 'translate(-50%, -50%)',
    },
};

class Carplay extends Component {

    constructor(props) {
        super(props)
        this.state = {
            height: 0,
            width: 0,
            mouseDown: false,
            lastX: 0,
            lastY: 0,
            playing: false,
            frameCount: 0,
            modalOpen: false,
            running: false,
            webCam: false,
        }
    }

    componentDidMount() {
        Modal.setAppElement(document.getElementById('main'));
        console.log("creating carplay", this.state.settings)
        const jmuxer = new JMuxer({
            node: 'player',
            mode: 'video',
            maxDelay: 30,
            fps: this.props.settings.fps,
            flushingTime: 100,
            debug: false

        });
        const height = this.divElement.clientHeight
        const width = this.divElement.clientWidth

        this.setState({height, width}, () => {
            console.log(this.state.height, this.state.width)
        })

        if(this.props.type === 'ws') {
            this.props.ws.onmessage = (event) => {
                if(!this.state.running) {
                    let video = document.getElementById('player')
                    video.play()
                    this.setState({running: true})
                }
                let buf = Buffer.from(event.data)
                let video = buf.slice(4)
                jmuxer.feed({video: new Uint8Array(video)})
            }
        } else if(this.props.type === "socket.io") {
            this.props.ws.on('carplay', (data) => {
                let buf = Buffer.from(data)
                let duration = buf.readInt32BE(0)
                let video = buf.slice(4)
                //console.log("duration was: ", duration)
                jmuxer.feed({video: new Uint8Array(video), duration:duration})
            })
        }
    }

    changeValue(k, v) {
        this.props.changeSetting(k, v)
    }

    render() {

        const openModal = () => {
            console.log("clicked")
            this.setState({modalOpen: true})
        }

        const closeModal = () => {
            this.setState({modalOpen: false})
        }

        const handleMDown = (e) => {
            let currentTargetRect = e.target.getBoundingClientRect();
            let x = e.clientX - currentTargetRect.left
            let y = e.clientY - currentTargetRect.top
            x = x / this.state.width
            y = y / this.state.height
            this.setState({lastX: x, lastY: y})
            this.setState({mouseDown: true})
            this.props.touchEvent(14, x, y)
        }

        const handleMUp = (e) => {
            let currentTargetRect = e.target.getBoundingClientRect();
            let x = e.clientX - currentTargetRect.left
            let y = e.clientY - currentTargetRect.top
            x = x / this.state.width
            y = y / this.state.height
            this.setState({mouseDown: false})
            this.props.touchEvent(16, x, y)
        }

        const handleMMove = (e) => {
            let currentTargetRect = e.target.getBoundingClientRect();
            let x = e.clientX - currentTargetRect.left
            let y = e.clientY - currentTargetRect.top
            x = x / this.state.width
            y = y / this.state.height
            this.props.touchEvent(15, x, y)
        }

        const handleDown = (e) => {
            let currentTargetRect = e.target.getBoundingClientRect();
            let x = e.touches[0].clientX - currentTargetRect.left
            let y = e.touches[0].clientY - currentTargetRect.top
            x = x / this.state.width
            y = y / this.state.height
            this.setState({lastX: x, lastY: y})
            this.setState({mouseDown: true})
            this.props.touchEvent(14, x, y)
            e.preventDefault()
        }
        const handleUp = (e) => {
            let x = this.state.lastX
            let y = this.state.lastY
            this.setState({mouseDown: false})
            this.props.touchEvent(16, x, y)
            e.preventDefault()
        }

        const openCarplay = (e) => {
            this.setState({status: true})
        }

        const handleMove = (e) => {
            let currentTargetRect = e.target.getBoundingClientRect();
            let x = e.touches[0].clientX - currentTargetRect.left
            let y = e.touches[0].clientY - currentTargetRect.top
            x = x / this.state.width
            y = y / this.state.height
            this.props.touchEvent(15, x, y)
        }



        return (
            <div style={{height: '100%'}}  id={'main'}>
                <div ref={(divElement) => {
                    this.divElement = divElement
                }}
                     className="App"
                     onTouchStart={handleDown}
                     onTouchEnd={handleUp}
                     onTouchMove={(e) => {
                         if (this.state.mouseDown) {
                             handleMove(e)
                         }
                     }}
                     onMouseDown={handleMDown}
                     onMouseUp={handleMUp}
                     onMouseMove={(e) => {
                         if (this.state.mouseDown) {
                             handleMMove(e)
                         }
                     }}
                     style={{height: '100%', width: '100%', padding: 0, margin: 0, display: 'flex'}}>
                    <video  style={{height: this.props.status ? "100%" : "0%"}} autoPlay muted id="player" />
                    {this.props.status ? <div></div>
                        :
                        <div style={{marginTop: 'auto', marginBottom: 'auto', textAlign: 'center', flexGrow: '1'}}>
                            <div style={{marginTop: 'auto', marginBottom: 'auto', textAlign: 'center', flexGrow: '1'}}>CONNECT IPHONE TO BEGIN CARPLAY</div>
                            <button onClick={openModal}>Settings</button>
                            {this.props.status ? <button onClick={openCarplay}>Open Carplay</button> : <div></div>}
                        </div>
                    }
                </div>
                <Modal
                    isOpen={this.state.modalOpen}
                    // onAfterOpen={afterOpenModal}
                    onRequestClose={closeModal}
                    style={customStyles}
                    contentLabel="Example Modal"
                    ariaHideApp={true}
                >
                    <Settings settings={this.props.settings} changeValue={this.changeValue} reqReload={this.props.reload}/>
                </Modal>
            </div>
        );
    }
}

export default Carplay;
