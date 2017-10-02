import React, { Component } from 'react';
import { Container, Header, Content, List,Title,Icon, ListItem,Segment,Button, Left, Body, 
  Right, Thumbnail, Text,Badge } from 'native-base';
import {  AppRegistry, StyleSheet,ListView,ToastAndroid} from 'react-native';
import firebaseApp from './Firebase';
import MessageScreen from './MessageScreen';
var totalUnread;

export default class ChatScreen extends Component {
 
  static navigationOptions = {
    title: 'Chats',
    header:null,
 };
 constructor(props) {
  super(props);
  this.state = {     
    errors: [],
    count:0,
    dataSource: new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    })
  }
  var Ukey = firebaseApp.auth().currentUser.uid;
  this.userRef =firebaseApp.database().ref().child('user');
  this.ChatwithRef =firebaseApp.database().ref('user/'+Ukey).child('ChatWith');
}

listenForItems(userRef,ChatwithRef) {

  var chatwith=[]; 
  ChatwithRef.on('value', (snap) => {   
    snap.forEach((child) => { 
      chatwith.push(child.val().ID );      
    });
  });   

  userRef.on('value', (snap) => {    
    var user = [];
    snap.forEach((child) => {
    
        if(chatwith.includes(child.val().UID))
        {
          user.push({
            name: child.val().Name,
            url: child.val().ImageURL,
            phone:child.val().Phone_No,
            uid:child.val().UID,
            _key: child.key,
            status:child.val().status,
            count:0     
          });
        }
     
    });
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(user.reverse()),     
    });
  });
}

componentDidMount() {
  this.listenForItems(this.userRef,this.ChatwithRef);
}

_renderItem(Userdata) {
  const { navigate } = this.props.navigation;
  Userdata.count = 0;
  var opac=0;
  var Ukey = firebaseApp.auth().currentUser.uid;
  let refLocal=firebaseApp.database().ref('Unread/'+Ukey+'/'+Userdata._key);
  refLocal.on('value', (snap) => { 
    Userdata.count = 0;   
    if(snap.exists()){
      snap.forEach((child) => {
      Userdata.count=Userdata.count+1;
    });
    opac=1;
    ToastAndroid.showWithGravity('You have '+ Userdata.count+ ' unread msg from '+Userdata.name, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
  } else {
    Userdata.count = 0;
    opac=0;
  }
  totalUnread+=Userdata.count;
  });
     return (      
      <ListItem avatar Userdata={Userdata} style={{margin:3}} onPress={() => navigate('Message',{ Rid:Userdata._key, username: Userdata.name,status:Userdata.status,phone:Userdata.phone,url:Userdata.url })}>
      <Left>
        <Thumbnail source={{ uri:Userdata.url  }} />
      </Left><Body>
        <Text>{Userdata.name}</Text></Body>
        <Badge style={{marginTop:15,margin:5,backgroundColor:'#075e54',opacity:opac}}>
            <Text>{Userdata.count}</Text>
          </Badge>
      </ListItem>
    );  
}

render() {

    return (
      <Container>  
        <Content>
        <ListView dataSource={this.state.dataSource}
renderRow={this._renderItem.bind(this)} enableEmptySections={true} style={styles.listview}>                      
          </ListView>  
        </Content>
      </Container>
    );
  }
}
var styles = StyleSheet.create({
  
  title: {
    fontWeight: 'bold',fontFamily: "vincHand",
    fontSize: 30,
    textAlign: "center",
    marginTop:25,    
  }, 
});

