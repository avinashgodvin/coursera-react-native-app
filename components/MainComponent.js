import React, { Component } from 'react';
import Menu from './MenuComponent';
import { DISHES } from '../shared/dishes';
import Dishdetail from './DIshdetailComponent';
import { View , Platform } from 'react-native';
import { createStackNavigator } from 'react-navigation';

const MenuNavigator = createStackNavigator({
    Menu: { screen: Menu },
    Dishdetail: { screen: Dishdetail }
},
{
    initialRouteName: 'Menu',
    navigationOptions: {
        headerStyle: {
            backgroundColor: "#512DA8"
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            color: "#fff"            
        }
    }
}
);


class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dishes: DISHES , 
      selectedDish: null
    };
  }

  onDishSelect(dishId) {
    this.setState({selectedDish: dishId})
}

  render() {
 
    return (
        <View style={{flex: 1}}>
            <Menu dishes={this.state.dishes} 
            onPress={(dishId) => this.onDishSelect(dishId)}  />
            <Dishdetail dish={this.state.dishes.filter((dish) => dish.id === this.state.selectedDish)[0]} /> 
        </View>
    );
    
  }
}
  
export default Main;