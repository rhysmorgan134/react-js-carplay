import React, {Component} from 'react';
import WebCam from "./webCam";
import Modal from "react-modal";
import {Checkbox, TextField, FormControlLabel, Grid, Box, Button} from "@mui/material";


class Settings extends Component {

    constructor() {
        super();

        this.state = {

        }
    }

    render() {

        const openWebCam = () => {
            this.setState({webCam: true})
        }

        const closeWebcam = () => {
            this.setState({webCam: false})
        }

        const getInput = (k, v) => {
            switch (k) {
                case 'fps':
                    return <TextField type={'number'} label={k} min={10} value={v} onChange={(e) => {
                        e.preventDefault()
                        console.log(e.target.value)
                        this.props.changeValue(k, parseInt(e.target.value))
                    }}/>
                case 'lhd':
                    return (<FormControlLabel
                        control={<Checkbox checked={v} onChange={(e) => {
                            e.preventDefault()
                            this.props.changeValue(k, e.target.checked ? 1 : 0)
                        }}/>}
                        label={k} />)
                case 'kiosk':
                    return (<FormControlLabel
                       control={<Checkbox checked={v} onChange={(e) => {
                            e.preventDefault()
                            this.props.changeValue(k, e.target.checked)
                        }}/>}
                       label={k} />)
                default:
                    return <TextField type={'number'} label={k} value={v} onChange={(e) => {
                        e.preventDefault()
                        this.props.changeValue(k, parseInt(e.target.value))
                    }}/>
            }
        }

        const keys = Object.keys(this.props.settings)

        return (
            <Grid container spacing={3} sx={{height: '100%'}}>
                <Grid item xs={3} >
                    <Box sx={{display: 'flex',
                        justifyContent: 'space-around',
                        p: 1,
                        m: 1,
                        flexDirection: "column",
                        height: '100%'}}>
                        {keys.map(key => getInput(key, this.props.settings[key]))}
                    </Box>
                </Grid>
                <Grid item xs={9}>
                    <WebCam />
                </Grid>
                <Grid item xs={12}>
                    <Button style={{marginTop: 'auto', marginLeft: 'auto', marginRight: 'auto'}} onClick={() => this.props.reqReload()}>click to reload</Button>
                </Grid>

            </Grid>

        );
    }
}

export default Settings;