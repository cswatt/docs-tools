import React, {useState} from "react";
import './App.css';
import { parseInput, parseOutput, DEFAULT, parseOptions } from "./helpers";
import { TextField, Button, Box, Modal, Drawer, Icon, Select, MenuItem, Chip, Fab } from '@mui/material';


class Action extends React.Component{
  constructor(props) {
      super(props);
      this.state ={
        item: props.item,
        i: props.index,
        org_name: props.item.org_name,
        repo_name: props.item.repo_name,
        action: props.item.action,
        branch: props.item.branch,
        globs: props.item.globs,
        options: props.item.options,
        open: false,
        isHovering: false,
        temp: []
      };

      this.handleChange = this.handleChange.bind(this);
      this.handleBlobChange = this.handleBlobChange.bind(this);
      this.handleButton = this.handleButton.bind(this);
      this.handleOpen = this.handleOpen.bind(this);
      this.handleClose = this.handleClose.bind(this);
      this.handleMouseOver = this.handleMouseOver.bind(this);
      this.handleMouseOut = this.handleMouseOut.bind(this);
      this.handleReset = this.handleReset.bind(this);
  }


  handleMouseOver() {this.setState({isHovering: true})}
  handleMouseOut() {this.setState({isHovering: false})}

  handleOpen() {
    // lets save a version
    this.setState({
      open: true,
      temp: this.toArray()
    });
  }

  handleReset(){
    const {temp} = this.state
    this.setState({
      org_name: temp['org_name'],
      repo_name: temp['repo_name'],
      action: temp['action'],
      branch: temp['branch'],
      globs: temp['globs'],
      options: temp['options'],
      open: false
    })
  }

  handleClose() {
    this.props.onActionChange(this.state.i, this.toArray())
    this.setState({
      open: false})
    
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    })

  }

  handleBlobChange(e) {
    let value = JSON.parse(e.target.value)
    this.setState({
      [e.target.name]: value
    })

  }

  handleButton(){
    let {tempName, tempValue} = this.state
    this.setState({
      [tempName]: tempValue,
      open: false})
    
  
    this.props.onActionChange(this.state.i, this.toArray())
    }

  toArray(){
    let entry = new Object();
    entry['org_name'] = this.state.org_name
    entry['repo_name'] = this.state.repo_name
    entry['action'] = this.state.action
    entry['branch'] = this.state.branch
    entry['globs'] = this.state.globs
    entry['options'] = this.state.options
    return entry
  }
  render ()  {  
    const {open, isHovering, org_name, repo_name, action, branch, globs, options} = this.state;
    const glob_string = JSON.stringify(globs)
    const option_string = JSON.stringify(options)
    const _options = parseOptions(action, options)
      return (
          <div className = "action" onMouseOver={this.handleMouseOver} onMouseOut={this.handleMouseOut}>
              <Box className="gridrow" onClick={this.handleOpen}>
                <Box className="gridelement-repo">
                  {org_name}/{repo_name} <Chip label={branch} size="small"/>
                </Box>
                <Box className="grid-action">
                  {action}
                </Box>
                <Box className="grid-button">
                  {isHovering && <Icon size="small">edit</Icon>}
                </Box>
                
                <Box className="specific-content">
                {action==="pull-and-push-file" &&
                  <Box><a href={_options['from_url']}>{globs[0]}</a> >> <a href={_options['to_url']}>{_options['to_string']}</a></Box>
                }
                {action==="pull-and-push-folder" &&
                  globs.map((item, i) => {
                    return (
                      <Box key={i}>{item}</Box>
                    ); })
                }
                {action==="npm-integrations" &&
                  globs.map((item, i) => {
                    return (
                      <Box key={i}>{item}</Box>
                    ); })
                }
                {action==="integrations" &&
                  globs.map((item, i) => {
                    return (
                      <Box key={i}>{item}</Box>
                    ); })
                }
                
                </Box>
              </Box>
              
             
              
              <Drawer
                open={open}
                anchor={"right"}
                onClose={this.handleClose}>
              
                <Box className="drawer">
                <Box className="drawer-element">
                <TextField
                className="drawer-field"
                label="org name"
                defaultValue={org_name}
                name="org_name"
                onChange={this.handleChange}
                variant="standard"
              />
              </Box>
              <Box className="drawer-element">

               <TextField
                className="drawer-field"
                label="repo name"
                name="repo_name"
                defaultValue={repo_name}
                onChange={this.handleChange}
                variant="standard"
              />
              </Box>
              <Box className="drawer-element">

              {/* <TextField
                className="drawer-field"
                id="standard-required"
                label="action"
                name="action"
                defaultValue={action}
                onChange={this.handleChange}
                variant="standard"
              /> */}
              <Select
                value={action}
                name="action"
                label="action"
                inputProps={{ 'aria-label': 'action'}}
                onChange={this.handleChange}
                variant="standard">
                <MenuItem value={"integrations"}>integrations</MenuItem>
                <MenuItem value={"npm-integrations"}>npm-integrations</MenuItem>
                <MenuItem value={"marketplace-integrations"}>marketplace-integrations</MenuItem>
                <MenuItem value={"pull-and-push-file"}>pull-and-push-file</MenuItem>
                <MenuItem value={"pull-and-push-folder"}>pull-and-push-folder</MenuItem>
                <MenuItem value={"security-rules"}>security-rules</MenuItem>
                <MenuItem value={"workflows"}>workflows</MenuItem>
              </Select>
              </Box>
              <Box className="drawer-element">

              <TextField
                className="drawer-field"
                label="branch"
                name="branch"
                defaultValue={branch}
                onChange={this.handleChange}
                variant="standard"
              />
              </Box>
              <Box className="drawer-element">

              <TextField
                className="drawer-field"
                label="globs"
                name="globs"
                multiline
                fullWidth
                defaultValue={glob_string}
                onChange={this.handleBlobChange}
                variant="standard"
              />
              </Box>
              <Box className="drawer-element">

              <TextField
                className="drawer-field"
                label="options"
                name="options"
                multiline
                rows={10}
                fullWidth
                defaultValue={option_string}
                onChange={this.handleBlobChange}
                variant="standard"
              />
              </Box>
              <Box className="drawer-element">
              <Button onClick={this.handleReset} variant="text">cancel</Button>
              </Box>
              </Box>
              </Drawer>
          </div>
      )
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      values: [],
      open: false,
      output: []
    };
    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleButton = this.handleButton.bind(this);
    this.handleActionChange = this.handleActionChange.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  componentDidMount(){
    this.setState({
      input: DEFAULT
    })
    const input = parseInput(DEFAULT)
    this.setState({
      values: input
    });
  }

  handleOpen() {
    const output = parseOutput(this.state.values)
    this.setState({
      open: true,
      output: output
    })
  }
  handleClose() {this.setState({open: false})}

  handleButton() {
    const input = parseInput(this.state.input)
    this.setState({
      values: input
    });
  }

  handleTextChange(e){
    this.setState({
      input: e.target.value
    });
  }

  handleActionChange(index, input) {
    let {values} = this.state;
    values[index] = input
    this.setState({
      values: values
    });
  }
  render() {
    const { values, open, output } = this.state;
  return (
    <div className="App">
      <Fab sx={{position: 'fixed', bottom: 16, right: 100}}>
        <Icon>add</Icon>
      </Fab>
      <Fab sx={{position: 'fixed', bottom: 16, right: 16}} onClick={this.handleOpen}>
        <Icon>ios_share</Icon>
      </Fab>
      <Modal
        className="Modal"
        open={open}
        onClose={this.handleClose}>
        <Box className="output">
          <TextField
            id="standard-read-only-input"
            label=""
            fullWidth
            rows={10}
            multiline
            defaultValue={output}/>
          <Button onClick={() => {navigator.clipboard.writeText(output);}}>
          Copy to clipboard
        </Button>
        </Box>
        
      </Modal>
      <TextField
          id="filled-multiline-static"
          label="yaml"
          multiline
          fullWidth
          rows={10}
          defaultValue=""
          variant="filled"
          onChange={this.handleTextChange}
        />
      <Button onClick={this.handleButton}variant="contained">load</Button>
      
      {values.map((item, i) => {
      return (
        <Action
          index={i}
          key={i}
          item={item}
          onActionChange={this.handleActionChange}
        />
      );
    })}
    </div>
    
  )
  }
}

export default App;
