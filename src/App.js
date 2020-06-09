import React , {Component} from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Particles from 'react-particles-js';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Clarifai from 'clarifai';

const app = new Clarifai.App(
  {apiKey: '643d516d5730437cbf40c3dbfde85bb3'});


const particlesOptions = {
  particles: {
     number : {
        value : 150,
        density : {
          enable : true,
          value_area : 800
      }
    }
  }
}

const initialstate = {
  input : '',
  imageUrl : '',
  box : {},
  route : 'signin',
  isSignedIn : false,
  userProfile : {
      id : '',
      name : '',
      email : '',
      entries : 0 ,
      joined : ''
  }
}

class App extends Component {
  constructor (){
    super();
    this.state =initialstate;

  }

  calculateFaceLocation = (data) =>{
    console.log(data)
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol : clarifaiFace.left_col * width ,
      topRow : clarifaiFace.top_row * height ,
      rightCol : width - (clarifaiFace.right_col * width),
      bottomRow : height -(clarifaiFace.bottom_row * height),

    }
  }


  loadUser = (data)=>{
    this.setState(
      {userProfile: {
          id : data.id,
          name : data.name,
          email : data.email,
          entries : data.entries ,
          joined : data.joined
    }})
  }
    onkey = ()=>{
      console.log('a');
    }

  displayFaceBox = (box) => {
    this.setState({box : box})
  }
  
  onInputChange = (event) =>{
    this.setState({input : event.target.value});
  }
  onButtonSubmit = () =>{
    this.setState({imageUrl : this.state.input});
    // app.models
    // .predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
    fetch('http://localhost:3000/imageurl',{
        method : 'post',
        headers: {'content-type' : 'application/json' },
        body : JSON.stringify({
        input : this.state.input})
      })
    .then(response =>response.json())
    .then(response =>{
      // console.log('response',response);
      if(response){ 
              fetch('http://localhost:3000/image',{
                method : 'put',
                headers: {'content-type' : 'application/json' },
                body : JSON.stringify({
                  id : this.state.userProfile.id})
              })
              .then(response =>response.json())
              .then(count  =>{
                //console.log('count',count);
                this.setState(Object.assign(this.state.userProfile,{entries : count}))
              })
              .catch(console.log)
            }
      this.displayFaceBox(this.calculateFaceLocation(response))})
      .catch(err => console.log('ooooooops , error',err))
  };
  onRouteChange = (route) => {
    if (route === 'signout'){
      this.setState(initialstate)
    }
    else if  (route === 'home')
    {this.setState({isSignedIn : true});}
    this.setState({route})
  }
  render (){
    const {isSignedIn , imageUrl , route , box} = this.state;
  return (
      <div className="App">
        <Particles className = 'particles'
          params={particlesOptions} />
        <Navigation isSignedIn = {isSignedIn} onRouteChange = {this.onRouteChange} />
        {route === 'home'  
          ?<div>
            <Logo />
            <Rank name={this.state.userProfile.name} entries={this.state.userProfile.entries} />
            <ImageLinkForm
            onInputChange = {this.onInputChange}
            onButtonSubmit = {this.onButtonSubmit} />
            <FaceRecognition imageUrl ={imageUrl}  box ={box} />
          </div>
          :(
            route === 'signin'
            ?<Signin loadUser={this.loadUser} onRouteChange = {this.onRouteChange} />
            :<Register  loadUser = {this.loadUser} onRouteChange = {this.onRouteChange} />
          )
      }
      </div>
    );
  }
}


export default App;
