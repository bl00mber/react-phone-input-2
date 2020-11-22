import React from 'react';
import { render } from 'react-dom';
import PhoneInput from '../../src/index';
// import '../../src/style/material.less'; // enable on dev


class Demo extends React.Component {
  state = { currentStyle: '', fetch: true }

  componentDidMount () {
    this.loadCSS('material') // disable on dev
    // this.setState({ fetch: false }) // enable on dev
  }

  updateStyle = (e) => {
    const text = e.target.textContent
    this.setState({ fetch: true }, () =>
      this.toggleCSS(this.state.currentStyle, text))
  }

  toggleCSS = (unloadFilename, loadFilename) => {
    // unload
    var links=document.getElementsByTagName("link")
    for (var i=links.length; i>=0; i--){ //search backwards within nodelist for matching elements to remove
    if (links[i] && links[i].getAttribute("href")!=null && links[i].getAttribute("href").indexOf(unloadFilename+'.css')!=-1)
      links[i].parentNode.removeChild(links[i]) //remove element by calling parentNode.removeChild()
    }

    this.loadCSS(loadFilename)
  }

  loadCSS = (loadFilename) => {
    // load
    const link=document.createElement("link")
    link.setAttribute("rel", "stylesheet")
    link.setAttribute("type", "text/css")
    link.setAttribute("href", loadFilename+'.css')
    if (typeof link!="undefined") document.getElementsByTagName("head")[0].appendChild(link)

    link.onload = () => this.setState({currentStyle: loadFilename, fetch: false})
  }

  render() {
    const { currentStyle, fetch } = this.state
    return (
      <div style={{fontFamily: "'Roboto', sans-serif", fontSize: '15px', padding: '10px 25px', margin: '20px auto', maxWidth: '1500px'}}>
        <style dangerouslySetInnerHTML={{__html: `
          .style-btn {
            cursor: pointer;
          }
          .style-btn:hover {
            text-decoration: underline;
          }
          .style-btn.active {
            font-weight: 500;
          }
        `}} />
        <div style={{display: 'inline-block', verticalAlign: 'top'}}>
          <p style={{fontWeight: '500'}}>Created by <a style={{color: '#000'}}
            href="https://github.com/bl00mber/react-phone-input-2">Nick Reiley</a></p>
          <p>
            <span onClick={this.updateStyle}
              className={'style-btn'+('style'==currentStyle?' active':'')}>style</span> — <span onClick={this.updateStyle}
              className={'style-btn'+('high-res'==currentStyle?' active':'')}>high-res</span> — <span onClick={this.updateStyle}
              className={'style-btn'+('material'==currentStyle?' active':'')}>material</span><br/><span onClick={this.updateStyle}
              className={'style-btn'+('bootstrap'==currentStyle?' active':'')}>bootstrap</span> — <span onClick={this.updateStyle}
              className={'style-btn'+('semantic-ui'==currentStyle?' active':'')}>semantic-ui</span> — <span onClick={this.updateStyle}
              className={'style-btn'+('plain'==currentStyle?' active':'')}>plain</span>
          </p><br/>
          {fetch !== true &&
            <div>
            <PhoneInput
              country='no'
              enableTerritories
            />
            <PhoneInput
              style={{marginTop: '20px'}}
              country='ua'
              enableSearch
              enableTerritories
            /></div>}
        </div>

        <div style={{display: 'inline-block', marginLeft: '40px', position: 'absolute', top: '30px', left: '560px'}}>
          <p>{"import 'react-phone-input-2/lib/"+currentStyle+".css'"}</p>
        </div>
      </div>
    )
  }
}

export default render(
  <Demo />,
  document.getElementById('root')
);
