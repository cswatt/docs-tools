import React from "react";
import { TextField, Button, Box, Modal, Drawer, Icon, Select, MenuItem, Chip, Fab, Tooltip } from '@mui/material';

class AddAction extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            open: false
        }

        this.handleOpen = this.handleOpen.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    handleOpen() {
        this.setState({
            open:true
        })
    }

    handleClose() {
        this.setState({
            open:false
        })
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    render() {
        const {open} = this.state
        return (
            <div>
            <Modal
            className="Modal"
            id="test"
            open={open}
            onClose={this.handleClose}>
              <Box className="output">
                add a new action
                <Box>
                    <Box>
                        <TextField
                            label="org name"
                            name="org name"
                            onChange={this.handleChange}
                            variant="standard"
                        />
                    </Box>
                </Box>
              </Box>
            </Modal>
            <Tooltip title="Add">
            <Fab sx={{position: 'fixed', bottom: 16, right: 100}} onClick={this.handleOpen}>
              <Icon>add</Icon>
            </Fab>
            </Tooltip>
            </div>
        )
    }
}

export {AddAction};