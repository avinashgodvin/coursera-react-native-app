import React, { Component } from 'react';
import { Text, View  , ScrollView , FlatList ,StyleSheet , Button , Modal, Alert, PanResponder  } from 'react-native';
import { Card , Icon , Rating , Input } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite , postComment } from '../redux/ActionCreators'; 
import * as Animatable from 'react-native-animatable';


const mapStateToProps = state => {
    return {
      dishes: state.dishes,
      comments: state.comments,
      favorites: state.favorites
    }
  }



  const mapDispatchToProps = dispatch => ({
    postFavorite: (dishId) => dispatch(postFavorite(dishId)),
    postComment: (dishId, rating, author, comment) => dispatch(postComment(dishId, rating, author, comment)),

})


function RenderDish(props) {

    const dish = props.dish;

    handleViewRef = ref => this.view = ref;

    const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
        if ( dx < -200 )
            return true;
        else
            return false;
    }

    const recognizeComment = ({ moveX, moveY, dx, dy }) => {
        if ( dx > 200 )
            return true;
        else
            return false;
    }



    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e, gestureState) => {
            return true;
        },
        onPanResponderGrant: () => {
               this.view.rubberBand(1000)
               .then(endState => console.log(endState.finished ? 'finished' : 'cancelled'));
        },
        onPanResponderEnd: (e, gestureState) => {
            console.log("pan responder end", gestureState);
            if (recognizeDrag(gestureState))
                Alert.alert(
                    'Add Favorite',
                    'Are you sure you wish to add ' + dish.name + ' to favorite?',
                    [
                    {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                    {text: 'OK', onPress: () => {props.favorite ? console.log('Already favorite') : props.onPress()}},
                    ],
                    { cancelable: false }
                );

            if (recognizeComment(gestureState)){
                props.onPencilPress();
            }
       

            return true;
        }
    })
    
        if (dish != null) {
            return(
                <Animatable.View animation="fadeInDown" duration={2000} delay={1000} 
                ref={this.handleViewRef}
                   {...panResponder.panHandlers} 
                
                 >
                
                <Card
                featuredTitle={dish.name}
                image={{uri: baseUrl + dish.image}}>
                    <Text style={{margin: 10}}>
                        {dish.description}
                    </Text>
                <View style={styles.formRow}>
                <Icon
                    raised
                    reverse
                    name={ props.favorite ? 'heart' : 'heart-o'}
                    type='font-awesome'
                    color='#f50'
                    onPress={() => props.favorite ? console.log('Already favorite') : props.onPress()}
                />
                <Icon
                    raised
                    reverse
                    name={ 'pencil'}
                    type='font-awesome'
                    color='#9400D3'
                    onPress={() =>{ console.log('Pressed pencil icon') , props.onPencilPress()}}
                />
                </View>
                </Card>
                </Animatable.View> 
             
            );
        }
        else {
            return(<View>
                    <Text>
                         lOading failed
                    </Text>
            </View>);
        }
}

function RenderComments(props) {

    const comments = props.comments;
            
    const renderCommentItem = ({item, index}) => {
        
        return (
            <View key={index} style={{margin: 10}}>
                <Text style={{fontSize: 14}}>{item.comment}</Text>
                <Rating     style= {styles.ratingStarStyle}
                            readonly
                            startingValue={item.rating}
                            fractions={0}
                            imageSize ={15}
                          />
                <Text style={{fontSize: 12}}>{'-- ' + item.author + ', ' + item.date} </Text>
            </View>
        );
    };
    
    return (
      <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
        <Card title='Comments' >
        <FlatList 
            data={comments}
            renderItem={renderCommentItem}
            keyExtractor={item => item.id.toString()}
            />
        </Card>
      </Animatable.View>
    );
}

class Dishdetail extends Component {

    constructor(props){
        super(props);
        this.state={
            rating: 3,
            author: '',
            comment: '',
            showModal :false
        };
    }

    toggleModal() {
        this.setState({showModal: !this.state.showModal});
    }

    goToRatingModal() {
        console.log(JSON.stringify(this.state));
        this.toggleModal();
    }

    resetForm() {
        this.setState({
            rating: 3,
            author: '',
            comment: '',
            showModal: false
        });
    }

    markFavorite(dishId) {
        this.props.postFavorite(dishId);
    }

    handleComment(dishId){
        console.log(dishId)

        if(String(this.state.rating)=="undefined"){
            this.state.rating=3;
        }

        this.props.postComment(dishId, this.state.rating, this.state.author, this.state.comment);
        this.resetForm();
    }

    setRating(rating) {
        this.setState({rating})
    }

    setAuthor(author) {
        this.setState({author})
    }

    setComment(comment) {
        this.setState({comment})
    }

    static navigationOptions = {
        title: 'Dish Details'
    };


    render(){
        const dishId = this.props.navigation.getParam('dishId','');
        return(
            <ScrollView>
             <RenderDish dish={this.props.dishes.dishes[+dishId]} 
                         favorite={this.props.favorites.some(el => el === dishId)}
                         onPress={() => this.markFavorite(dishId)} 
                         onPencilPress={() => this.goToRatingModal()} >

            </RenderDish>
             <RenderComments comments={this.props.comments.comments.filter((comment) => comment.dishId === dishId)} />
             
             <Modal animationType = {"slide"} transparent = {false}
                visible = {this.state.showModal}
                onDismiss = {() => {this.toggleModal() ,this.resetForm();} }
                onRequestClose = {() => {this.toggleModal() ,this.resetForm();} }
                >
                <View style = {styles.modal}>
                    <Rating 
                            minValue={1}
                            startingValue={3}
                            fractions={0}
                            showRating={true}
                            imageSize ={25}
                            onFinishRating={(rating) => this.setRating(rating)}
                            
                            

                        />
                        <Input
                            placeholder="   Author"
                            leftIcon={
                                <Icon 
                                    name='user'
                                    type='font-awesome'
                                />
                            }
                            onChangeText={(author) => this.setAuthor(author)}
                        />
                        <Input 
                            placeholder="  Comment"
                            leftIcon={
                                <Icon 
                                    name='comment'
                                    type='font-awesome'
                                />
                            }
                            onChangeText={(comment) => this.setComment(comment)}
                        />  
                    
                    <View style= {styles.buttonTopMargin}> 
                    <Button 
                       onPress = {() =>{this.handleComment(dishId),this.toggleModal(); this.resetForm();}}
                        color="#512DA8"
                       title=" SUBMIT " 
                        />   
                    </View>
                    
                    <View style= {styles.buttonTopMargin}>             
                    <Button  
                       
                       onPress = {() =>{this.toggleModal(); this.resetForm();}}
                        color="#A9A9A9"
                       title=" CANCEL " 
                        />
                    </View>
                </View>
               </Modal>

             </ScrollView>
        );
    }  
}

const styles = StyleSheet.create({
    formRow: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        flexDirection: 'row',
        margin: 20
      },
      modal: {
        justifyContent: 'center',
        margin: 20
     },
     modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        backgroundColor: '#512DA8',
        textAlign: 'center',
        color: 'white',
        marginBottom: 20
    },
    modalText: {
        fontSize: 18,
        margin: 10
    },
    buttonTopMargin:{
         marginVertical: 10,
         marginHorizontal :10
    },
    ratingStarStyle :{
       alignItems : "flex-start"
    }
})

export default connect(mapStateToProps , mapDispatchToProps)(Dishdetail);