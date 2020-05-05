import React, { Component } from 'react';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Card, Button, CardTitle, CardText, Form, FormGroup, Label, Input } from 'reactstrap';
import Joi from 'joi';
import userIconUrl from './user_icon.svg';
import othersIconUrl from './others_icon.svg';

import './App.css';

var userIcon = L.icon({
    iconUrl: userIconUrl,
    iconSize: [100, 100],
    // iconAnchor: [12.5, 41],
    popupAnchor: [0, -41],
});

var othersIcon = L.icon({
    iconUrl: othersIconUrl,
    iconSize: [100, 100],
    // iconAnchor: [12.5, 41],
    popupAnchor: [0, -41],
});

const schema = Joi.object().keys({
  name: Joi.string().min(1).max(100).required(),
  message: Joi.string().min(1).max(500).required(),
});

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api/v1/messages' : 'https://api.fuzzili.com/api/v1/messages'

class App extends Component {
  state = {
    location: {
      lat: 51.505,
      lng: -0.09,
    },
    haveUsersLocation: false,
    zoom: 3,
    userMessage: {
      name: '',
      message: ''
    },
    sendingMessage: false,
    sentMessage: false,
    messages: []
  }

  componentDidMount() {
    fetch(API_URL)
    .then(res => res.json())
    .then(messages => {
      const haveSeenLocation = {};
      messages = messages.reduce((all, message) => {
        // const key = message.latitude + message.longitude;
        const key = `${message.latitude.toFixed(3)}${message.longitude.toFixed(4)}`;
        if (haveSeenLocation[key]) {
          // haveSeenLocation[key].names = haveSeenLocation[key].names || [];
          // haveSeenLocation[key].messages = haveSeenLocation[key].messages || [];
          // haveSeenLocation[key].names.push(message.name);
          // haveSeenLocation[key].messages.push(message.message);
          haveSeenLocation[key].otherMessages = haveSeenLocation[key].otherMessages || [];
          haveSeenLocation[key].otherMessages.push(message);
        } else {
          haveSeenLocation[key] = message;
          all.push(message);
        }
        return all;
      }, []);
      this.setState({
        messages
      });
    });
    navigator.geolocation.getCurrentPosition((position) => {
      this.setState({
        location: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        },
        haveUsersLocation: true,
        zoom: 13
      });
    }, () => {
      console.log('uh oh... they didnt gave us their location...');
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(location => {
          //console.log(location);
          this.setState({
            location: {
              lat: location.latitude,
              lng: location.longitude
            },
            haveUsersLocation: true,
            zoom: 13,
          });
        });
    });
  }

  formIsValid = () => {
    const userMessage = {
      name: this.state.userMessage.name,
      message: this.state.userMessage.message
    };
    const result = Joi.validate(userMessage, schema);

    return !result.error && this.state.haveUsersLocation ? true : false;
  }

  formSubmitted = (event) => {
    event.preventDefault();
    // console.log(this.state.userMessage);
    // const userMessage = {
    //   name: this.state.userMessage.name,
    //   message: this.state.userMessage.message
    // };
    // const result = Joi.validate(userMessage, schema);
    if (this.formIsValid()) {
      this.setState({
        sendingMessage: true
      });
      fetch(API_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          // ...userMessage,
          name: this.state.userMessage.name,
          message: this.state.userMessage.message,
          latitude: this.state.location.lat,
          longitude: this.state.location.lng,
        })
      }).then(res => res.json())
      .then(message => {
        console.log(message);
        setTimeout(() => {
          this.setState({
            sendingMessage: false,
            sentMessage: true
          });
        }, 4000);
      });
    }
  }

  valueChange = (event) => {
    const { name, value } = event.target;
    this.setState((prevState) => ({
      userMessage: {
        ...prevState.userMessage,
        [name]: value
      }
    }));
  }


  render() {
    const position = [this.state.location.lat, this.state.location.lng];
    return (
      <div className="map">
        <Map className="map" center={position} zoom={this.state.zoom}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          { this.state.haveUsersLocation ?
            <Marker
              position={position}
              icon={userIcon}>
              {// <Popup>
              //   A pretty CSS3 popup. <br /> Easily customizable.
              // </Popup>
              }
            </Marker> : ''
          }
          { this.state.messages.map(message => (
            <Marker
              position={[message.latitude, message.longitude]}
              icon={othersIcon}>
              <Popup>
                <p><em>{message.name}:</em> {message.message}</p>
                { message.otherMessages ? message.otherMessages.map(message => <p key={message._id}><em>{message.name}:</em> {message.message}</p>) : '' }
              </Popup>
            </Marker>
          ))}
        </Map>
        <Card body id="message-form">
          <CardTitle id="card-title">Welcome to mrguessm.app!</CardTitle>
            <CardText>Leave a message with your location.</CardText>
            <CardText>Thank you for your interest in our products. :P</CardText>
            {
              !this.state.sendingMessage && !this.state.sentMessage && this.state.haveUsersLocation ?
            <Form onSubmit={this.formSubmitted}>
              <FormGroup>
                <Label for="name">Name</Label>
                <Input
                  onChange={this.valueChange}
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Enter your name" />
              </FormGroup>
              <FormGroup>
                <Label for="message">Message</Label>
                <Input
                  onChange={this.valueChange}
                  type="textarea"
                  name="message"
                  id="message"
                  placeholder="Leave your message here" />
              </FormGroup>
              <Button type="submit" color="warning" disabled={!this.formIsValid()}>Send</Button>
            </Form> :
            this.state.sendingMessage || !this.state.haveUsersLocation ?
            <video
            autoPlay
            loop
            src="https://media.giphy.com/media/3oEjHTSuJrMnj08DpS/giphy.mp4" /> :
            <CardText>Thanks for stopping by!</CardText>
          }
        </Card>
      </div>
    );
  }
}

export default App;
