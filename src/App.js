import React from 'react';
import Carplay from "./Carplay";

class App extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            status: false
        }
        this.ws = new WebSocket('ws://localhost:3001');
        this.ws.binaryType = 'arraybuffer';
    }

    render() {

        let settings = {
            fps: 60
        }

        const touchEvent = (type, x, y) => {
            console.log("touch event type: ", + type + " x: " + x + " y:" + y)
        }

        const changeSetting = (k, v) => {
            console.log("setting: " + k + " change to: " + v)
        }

        const reload = () => {
            console.log("reload request")
        }

        const toggleCarplay = () => {
            if(this.state.status) {
                this.setState({status: false})
            } else {
                this.setState({status: true})
            }
        }

        return (
            <div className="App" style={{height: '100%'}}>
                <button onClick={toggleCarplay}>openCarplay</button>
                <Carplay
                    settings={settings}
                    status={this.state.status}
                    touchEvent={touchEvent}
                    changeSetting={changeSetting}
                    reload={reload}
                    ws={this.ws}
                    type={'ws'}
                />
            </div>
        );
    }

}

export default App;